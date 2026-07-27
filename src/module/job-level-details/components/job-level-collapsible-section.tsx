"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/utils";
import { JobLevelCollapsibleSectionProps } from "../utils/types";

export default function JobLevelCollapsibleSection({
	title,
	headerMeta,
	headerActions,
	defaultOpen = false,
	expandLabel = "Expand",
	collapseLabel = "Collapse",
	className,
	children,
}: JobLevelCollapsibleSectionProps) {
	const [isOpen, setIsOpen] = useState(defaultOpen);

	return (
		<div className={cn("rounded-[14px] border-none bg-white px-4 py-4 shadow-md", className)}>
			<div className="flex flex-wrap items-center justify-between gap-2">
				<div className="flex flex-wrap items-center gap-2">
					<p className="text-sm font-semibold uppercase tracking-wide text-brand-greyLight">{title}</p>
					{headerMeta}
				</div>
				<div className="ml-auto flex items-center gap-2">
					{headerActions}
					<Button
						type="button"
						variant="ghost"
						onClick={() => setIsOpen((prev) => !prev)}
						className="flex items-center gap-1 rounded-[10px] px-3 py-1.5 text-sm font-medium text-brand-dark hover:bg-gray-50"
					>
						{isOpen ? (
							<>
								{collapseLabel}
								<ChevronUp className="h-3.5 w-3.5" />
							</>
						) : (
							<>
								{expandLabel}
								<ChevronDown className="h-3.5 w-3.5" />
							</>
						)}
					</Button>
				</div>
			</div>

			{isOpen && <div className="mt-4">{children}</div>}
		</div>
	);
}
