// hooks/useScrollableTabs.ts
import { useEffect, useState, RefObject, useCallback } from "react";

interface ScrollState {
	showScrollButtons: boolean;
	canScrollLeft: boolean;
	canScrollRight: boolean;
	scrollLeft: () => void;
	scrollRight: () => void;
}

/**
 * Hook to manage horizontal scrolling and visibility of scroll buttons
 * @param containerRef RefObject of the scroll container (e.g., RefObject<HTMLDivElement>)
 * @param scrollAmount Amount of pixels to scroll per click (default: 300)
 */
export function useScrollableTabs<T extends HTMLElement>(
	containerRef: RefObject<T | null>,
	scrollAmount = 300
): ScrollState {
	const [showScrollButtons, setShowScrollButtons] = useState(false);
	const [canScrollLeft, setCanScrollLeft] = useState(false);
	const [canScrollRight, setCanScrollRight] = useState(false);

	const checkScroll = useCallback(() => {
		const el = containerRef.current;
		if (!el) return;
		const { scrollLeft, scrollWidth, clientWidth } = el;
		setCanScrollLeft(scrollLeft > 0);
		setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
		setShowScrollButtons(scrollWidth > clientWidth);
	}, [containerRef]);

	const scrollLeft = useCallback(() => {
		const el = containerRef.current;
		if (!el) return;
		el.scrollTo({ left: el.scrollLeft - scrollAmount, behavior: "smooth" });
		setTimeout(checkScroll, 300);
	}, [containerRef, scrollAmount, checkScroll]);

	const scrollRight = useCallback(() => {
		const el = containerRef.current;
		if (!el) return;
		el.scrollTo({ left: el.scrollLeft + scrollAmount, behavior: "smooth" });
		setTimeout(checkScroll, 300);
	}, [containerRef, scrollAmount, checkScroll]);

	useEffect(() => {
		checkScroll();
		window.addEventListener("resize", checkScroll);
		return () => window.removeEventListener("resize", checkScroll);
	}, [checkScroll]);

	return { showScrollButtons, canScrollLeft, canScrollRight, scrollLeft, scrollRight };
}
