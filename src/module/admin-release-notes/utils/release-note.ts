import { z } from "zod";
import { AUDIENCE, IReleaseNote, MatchEntry } from "../types/release-note";

const HTML_TAG_REGEX = /<[^>]+>/g;
const BLOCK_BREAK_TAG_REGEX = /<\/(p|div|li|blockquote|h1|h2|h3|h4|h5|h6|pre)>/gi;
const BLOCK_PREFIX_TAG_REGEX = /<(li)>/gi;
const LINE_BREAK_TAG_REGEX = /<br\s*\/?>/gi;

const decodeHtmlEntities = (value: string) => {
	return value
		.replace(/&nbsp;/gi, " ")
		.replace(/&amp;/gi, "&")
		.replace(/&lt;/gi, "<")
		.replace(/&gt;/gi, ">")
		.replace(/&quot;/gi, '"')
		.replace(/&#39;/gi, "'");
};

export const getPlainTextFromReleaseNoteContent = (content: string) => {
	return decodeHtmlEntities(
		content
			.replace(LINE_BREAK_TAG_REGEX, "\n")
			.replace(BLOCK_BREAK_TAG_REGEX, "\n")
			.replace(BLOCK_PREFIX_TAG_REGEX, "\n")
			.replace(HTML_TAG_REGEX, " ")
	)
		.replace(/[ \t]+\n/g, "\n")
		.replace(/\n{3,}/g, "\n\n")
		.trim();
};

export const isRichTextReleaseNoteContent = (content: string) => /<[^>]+>/.test(content);

export const normalizeReleaseNoteContent = (content: string) => {
	return getPlainTextFromReleaseNoteContent(content).trim().length > 0 ? content : "";
};

export const sanitizeReleaseNoteHtml = (content: string) => {
	if (typeof window === "undefined") return content;

	const parser = new DOMParser();
	const document = parser.parseFromString(content, "text/html");
	const allowedTags = new Set(["p", "br", "strong", "em", "u", "s", "blockquote", "ol", "ul", "li", "a", "h1", "h2"]);
	const nodes = Array.from(document.body.querySelectorAll("*"));

	nodes.forEach((node) => {
		const tagName = node.tagName.toLowerCase();

		if (!allowedTags.has(tagName)) {
			const parent = node.parentNode;
			while (node.firstChild) {
				parent?.insertBefore(node.firstChild, node);
			}
			parent?.removeChild(node);
			return;
		}

		Array.from(node.attributes).forEach((attribute) => {
			const attributeName = attribute.name.toLowerCase();
			const isAllowedAnchorAttribute = tagName === "a" && ["href", "target", "rel"].includes(attributeName);
			const isAllowedListAttribute = tagName === "li" && ["data-list", "class"].includes(attributeName);

			if (!isAllowedAnchorAttribute && !isAllowedListAttribute) {
				node.removeAttribute(attribute.name);
			}
		});

		if (tagName === "a") {
			const href = node.getAttribute("href") || "";
			const isSafeHref = /^(https?:|mailto:|tel:)/i.test(href);

			if (!isSafeHref) {
				node.removeAttribute("href");
			} else {
				node.setAttribute("target", "_blank");
				node.setAttribute("rel", "noreferrer");
			}
		}
	});

	return document.body.innerHTML;
};

export const highlightReleaseNoteHtml = (content: string, query: string, activeOccurrenceIndex: number) => {
	if (typeof window === "undefined") return sanitizeReleaseNoteHtml(content);

	const sanitizedHtml = sanitizeReleaseNoteHtml(content);
	if (!query.trim()) return sanitizedHtml;

	const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	const matchRegex = new RegExp(`\\b${escapedQuery}\\b`, "gi");
	const parser = new DOMParser();
	const document = parser.parseFromString(sanitizedHtml, "text/html");
	const walker = document.createTreeWalker(document.body, window.NodeFilter.SHOW_TEXT);
	const textNodes: Text[] = [];
	let currentNode = walker.nextNode();
	let matchCount = 0;

	while (currentNode) {
		textNodes.push(currentNode as Text);
		currentNode = walker.nextNode();
	}

	textNodes.forEach((textNode) => {
		const parentElement = textNode.parentElement;
		const text = textNode.textContent || "";

		if (!text.trim() || parentElement?.tagName.toLowerCase() === "mark") return;

		matchRegex.lastIndex = 0;
		const matches = Array.from(text.matchAll(matchRegex));
		if (!matches.length) return;

		const fragment = document.createDocumentFragment();
		let lastIndex = 0;

		matches.forEach((match) => {
			const index = match.index ?? 0;
			const value = match[0];

			if (index > lastIndex) {
				fragment.appendChild(document.createTextNode(text.slice(lastIndex, index)));
			}

			const mark = document.createElement("mark");
			const isActive = matchCount === activeOccurrenceIndex;
			mark.textContent = value;
			mark.className = isActive
				? "rounded-sm bg-orange-400 px-0.5 font-semibold text-white"
				: "rounded-sm bg-yellow-200 px-0.5 font-medium text-yellow-900";

			if (isActive) {
				mark.setAttribute("data-release-note-active-match", "true");
			}

			fragment.appendChild(mark);
			lastIndex = index + value.length;
			matchCount += 1;
		});

		if (lastIndex < text.length) {
			fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
		}

		textNode.parentNode?.replaceChild(fragment, textNode);
	});

	return document.body.innerHTML;
};

export const releaseNoteSchema = z.object({
	date: z.string().min(1, "Date is required"),
	audience: z.enum([AUDIENCE.ADMIN, AUDIENCE.TECHNICIAN, AUDIENCE.ALL], {
		required_error: "Target audience is required",
	}),
	content: z.string().refine((value) => getPlainTextFromReleaseNoteContent(value).trim().length > 0, {
		message: "Note content is required",
	}),
	files: z
		.array(
			z.object({
				keyFile: z.string(),
				file: z.instanceof(File).optional(),
				url: z.string(),
			})
		)
		.default([]),
});

export type IReleaseNoteSchema = z.input<typeof releaseNoteSchema>;

export const getFileName = (keyFile?: string) => {
	if (!keyFile) return "";

	const name = keyFile.split("/").pop() || "";
	const index = name.lastIndexOf("-");

	return index !== -1 ? name.substring(index + 1) : name;
};

const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "webp", "svg"];

export const isImage = (keyFile: string) => {
	const ext = keyFile.split(".").pop()?.toLowerCase() ?? "";
	return IMAGE_EXTENSIONS.includes(ext);
};

// Count how many times `query` appears in `content` (case-insensitive)
export const countMatchesInNote = (content: string, query: string): number => {
	if (!query.trim()) return 0;
	const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	const regex = new RegExp(`\\b${escapedQuery}\\b`, "gi");
	return (getPlainTextFromReleaseNoteContent(content).match(regex) || []).length;
};

export const buildMatchList = (items: IReleaseNote[], query: string): MatchEntry[] => {
	const list: MatchEntry[] = [];
	items.forEach((note, noteIndex) => {
		const count = countMatchesInNote(note.content, query);
		for (let i = 0; i < count; i++) {
			list.push({ noteId: note.id, noteIndex, occurrenceOffset: i });
		}
	});
	return list;
};

export const URL_REGEX = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;

export const getUrlParts = (value: string) => {
	const match = value.match(/^(.*?)([),.!?:;]+)?$/);

	if (!match) {
		return {
			urlText: value,
			trailingText: "",
		};
	}

	return {
		urlText: match[1] || value,
		trailingText: match[2] || "",
	};
};

export const getHref = (url: string) => {
	return url.startsWith("www.") ? `https://${url}` : url;
};

export const isUrlSegment = (value: string) => {
	URL_REGEX.lastIndex = 0;
	return URL_REGEX.test(value);
};
