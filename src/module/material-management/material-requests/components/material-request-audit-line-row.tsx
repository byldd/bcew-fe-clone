"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils/utils";
import { MaterialRequestAuditTimeline } from "./material-request-audit-timeline";
import type { MaterialRequestAuditLineItem } from "../utils/types";

export function MaterialRequestAuditLineRow({
	lineItem,
	defaultExpanded = false,
}: {
	lineItem: MaterialRequestAuditLineItem;
	defaultExpanded?: boolean;
}) {
	const [expanded, setExpanded] = useState(defaultExpanded);

	return (
		<div className="border-b border-brand-dark/10 last:border-b-0">
			<button
				type="button"
				onClick={() => setExpanded((value) => !value)}
				aria-expanded={expanded}
				className="flex w-full items-start justify-between gap-3 py-3 text-left"
			>
				<span className="text-sm text-brand-dark">
					{lineItem.code ? lineItem.label.replace(`#${lineItem.partId}`, lineItem.code) : lineItem.label}
				</span>
				<span className="flex shrink-0 items-center gap-2">
					{lineItem.quantity && <span className="text-sm text-brand-dark">{lineItem.quantity}</span>}
					<ChevronDown className={cn("h-4 w-4 text-brand-dark50 transition-transform", expanded && "rotate-180")} />
				</span>
			</button>

			{expanded && (
				<div className="pb-4 pl-1">
					<MaterialRequestAuditTimeline events={lineItem.events} />
				</div>
			)}
		</div>
	);
}
