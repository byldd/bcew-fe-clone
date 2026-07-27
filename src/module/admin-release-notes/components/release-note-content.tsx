"use client";

import React, { useEffect, useLayoutEffect, useRef } from "react";
import { highlightText } from "./highlight-text";
import {
	highlightReleaseNoteHtml,
	getPlainTextFromReleaseNoteContent,
	isRichTextReleaseNoteContent,
	sanitizeReleaseNoteHtml,
} from "../utils/release-note";

interface ReleaseNoteContentProps {
	content: string;
	searchQuery?: string;
	activeOccurrenceIndex?: number;
	searchNavigationVersion?: number;
	activeRef: React.RefObject<HTMLSpanElement | null>;
	className?: string;
	scrollContainerRef?: React.RefObject<HTMLDivElement | null>;
}

const ReleaseNoteContent = ({
	content,
	searchQuery = "",
	activeOccurrenceIndex = -1,
	searchNavigationVersion = 0,
	activeRef,
	className,
	scrollContainerRef,
}: ReleaseNoteContentProps) => {
	const hasSearch = searchQuery.trim().length > 0;
	const containerRef = useRef<HTMLDivElement | null>(null);
	const isRichText = isRichTextReleaseNoteContent(content);

	useEffect(() => {
		if (!activeRef) return;

		if (!hasSearch || !isRichText) {
			activeRef.current = null;
			return;
		}

		activeRef.current = containerRef.current?.querySelector("[data-release-note-active-match='true']") ?? null;
	}, [activeOccurrenceIndex, activeRef, content, hasSearch, isRichText, searchQuery]);

	useLayoutEffect(() => {
		if (!hasSearch || activeOccurrenceIndex < 0) return;

		const scrollContainer = scrollContainerRef?.current;
		if (!scrollContainer) return;

		const scrollToActiveMatch = () => {
			const activeElement =
				activeRef.current ??
				containerRef.current?.querySelector<HTMLElement>("[data-release-note-active-match='true']") ??
				scrollContainer.querySelector<HTMLElement>("mark.bg-orange-400");

			if (!activeElement) return;

			const containerRect = scrollContainer.getBoundingClientRect();
			const activeRect = activeElement.getBoundingClientRect();
			const nextScrollTop =
				scrollContainer.scrollTop +
				(activeRect.top - containerRect.top) -
				scrollContainer.clientHeight / 2 +
				activeRect.height / 2;

			scrollContainer.scrollTo({
				top: Math.max(0, nextScrollTop),
				behavior: "smooth",
			});
		};

		const frameId = window.requestAnimationFrame(scrollToActiveMatch);

		return () => {
			window.cancelAnimationFrame(frameId);
		};
	}, [
		activeOccurrenceIndex,
		activeRef,
		content,
		hasSearch,
		isRichText,
		scrollContainerRef,
		searchNavigationVersion,
		searchQuery,
	]);

	if (hasSearch && !isRichText) {
		return (
			<div className={className}>
				{highlightText(getPlainTextFromReleaseNoteContent(content), searchQuery, activeOccurrenceIndex, activeRef)}
			</div>
		);
	}

	if (isRichText) {
		const html = hasSearch
			? highlightReleaseNoteHtml(content, searchQuery, activeOccurrenceIndex)
			: sanitizeReleaseNoteHtml(content);

		return <div ref={containerRef} className={className} dangerouslySetInnerHTML={{ __html: html }} />;
	}

	return <div className={className}>{highlightText(content, "", activeOccurrenceIndex, activeRef)}</div>;
};

export default ReleaseNoteContent;
