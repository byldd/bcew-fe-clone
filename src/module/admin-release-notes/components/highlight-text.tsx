import { getHref, getUrlParts, isUrlSegment, URL_REGEX } from "../utils/release-note";

const renderHighlightedSegment = (
	content: string,
	query: string,
	activeOccurrenceIndex: number,
	activeRef: React.RefObject<HTMLSpanElement | null>,
	keyPrefix: string,
	matchCounterRef: { current: number }
) => {
	if (!query.trim()) {
		return <span key={keyPrefix}>{content}</span>;
	}

	const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	const splitRegex = new RegExp(`(\\b${escapedQuery}\\b)`, "gi");
	const matchRegex = new RegExp(`^\\b${escapedQuery}\\b$`, "i");
	const parts = content.split(splitRegex);

	return parts.map((part, index) => {
		if (matchRegex.test(part)) {
			const isActive = matchCounterRef.current === activeOccurrenceIndex;
			matchCounterRef.current += 1;

			return isActive ? (
				<mark
					key={`${keyPrefix}-match-${index}`}
					ref={activeRef}
					className="rounded-sm bg-orange-400 px-0.5 font-semibold text-white"
				>
					{part}
				</mark>
			) : (
				<mark
					key={`${keyPrefix}-match-${index}`}
					className="rounded-sm bg-yellow-200 px-0.5 font-medium text-yellow-900"
				>
					{part}
				</mark>
			);
		}

		return <span key={`${keyPrefix}-text-${index}`}>{part}</span>;
	});
};

export const highlightText = (
	content: string,
	query: string,
	activeOccurrenceIndex: number,
	activeRef: React.RefObject<HTMLSpanElement | null>
): React.ReactNode => {
	const segments = content.split(URL_REGEX);
	const matchCounterRef = { current: 0 };

	return segments.map((segment, index) => {
		if (!segment) {
			return null;
		}

		if (isUrlSegment(segment)) {
			const { urlText, trailingText } = getUrlParts(segment);

			return (
				<span key={`url-wrapper-${index}`}>
					<a
						href={getHref(urlText)}
						target="_blank"
						rel="noreferrer"
						className="break-all text-blue-600 underline underline-offset-2 hover:text-blue-700"
					>
						{renderHighlightedSegment(
							urlText,
							query,
							activeOccurrenceIndex,
							activeRef,
							`url-${index}`,
							matchCounterRef
						)}
					</a>
					{trailingText && (
						<span>
							{renderHighlightedSegment(
								trailingText,
								query,
								activeOccurrenceIndex,
								activeRef,
								`trail-${index}`,
								matchCounterRef
							)}
						</span>
					)}
				</span>
			);
		}

		return renderHighlightedSegment(segment, query, activeOccurrenceIndex, activeRef, `text-${index}`, matchCounterRef);
	});
};
