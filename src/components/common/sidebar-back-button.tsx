"use client";

import { AlignJustify } from "lucide-react";
import BackButton from "@/components/common/back-button";
import { useSidebarOptional } from "@/components/ui/sidebar";

// Review pages that always show a back button still need a way to reopen the sidebar once
// it's collapsed (e.g. after widening the window). Swaps the back arrow for a hamburger while
// collapsed (or on mobile) instead of showing both at once — only one icon at a time.
const SidebarBackButton = () => {
	const sidebar = useSidebarOptional();
	const showHamburger = !!sidebar && (sidebar.isMobile || !sidebar.open);

	if (showHamburger) {
		return (
			<button
				type="button"
				aria-label="Toggle sidebar"
				className="mr-3 flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-[10px] border border-[#1515151A] bg-white"
				onClick={sidebar!.toggleSidebar}
			>
				<AlignJustify size={20} />
			</button>
		);
	}

	// The negative margin offsets BackButton's own ghost-button hit-area padding so the
	// chevron sits flush left.
	return (
		<span className="-ml-[10px] mr-1">
			<BackButton />
		</span>
	);
};

export default SidebarBackButton;
