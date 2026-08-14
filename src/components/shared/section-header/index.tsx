"use client";

import React from "react";
import { AlignJustify } from "lucide-react";
import { cn } from "@/lib/utils/utils";
import { useSidebarOptional } from "@/components/ui/sidebar";
import BackButton from "@/components/common/back-button";

interface HeaderProps {
	title: string;
	className?: string;
	titleClassName?: string;
	hideSidebarToggle?: boolean;
	showBackButton?: boolean;
	hamburgerClassName?: string;
	hamburgerSize?: number;
	actions?: React.ReactNode;
}

export default function SectionHeader({
	title,
	className,
	titleClassName,
	hideSidebarToggle = false,
	hamburgerClassName = "",
	showBackButton = false,
	hamburgerSize = 20,
	actions,
}: HeaderProps) {
	const sidebar = useSidebarOptional();
	const showHamburger = !showBackButton && !hideSidebarToggle && !!sidebar && (sidebar.isMobile || !sidebar.open);

	return (
		<div className={cn("flex items-center gap-3", actions ? "justify-between" : "", className)}>
			<div className="flex items-center gap-3">
				{showBackButton && <BackButton />}
				{showHamburger && (
					<button
						className={cn(
							"flex h-[46px] w-[46px] items-center justify-center rounded-[10px] border border-[#1515151A] bg-white",
							hamburgerClassName
						)}
						onClick={sidebar!.toggleSidebar}
					>
						<AlignJustify size={hamburgerSize} />
					</button>
				)}

				<h1
					className={
						titleClassName
							? cn("text-brand-dark", titleClassName)
							: cn(
									"font-bold text-brand-dark",
									// base: 21px
									"text-[21px] leading-[28px]",
									// ≥1536px (2xl): 30px
									"2xl:text-[30px] 2xl:leading-[38px]",
									// ≥1920px (3xl): 52px
									"[@media(min-width:1920px)]:text-[52px] [@media(min-width:1920px)]:leading-[62px]"
								)
					}
				>
					{title}
				</h1>
			</div>
			{actions && <div className="flex items-center gap-4">{actions}</div>}
		</div>
	);
}
