import { CheckCircle2, Circle, RefreshCw, StickyNote, UserPlus, XCircle, type LucideIcon } from "lucide-react";
import { toLocalFormattedDate } from "@/lib/utils/date";
import { DATE_FORMAT } from "@/types/date";
import { cn } from "@/lib/utils/utils";
import { getMaterialSelectionReasonLabel } from "@/module/job/material-selection/utils";
import { MATERIAL_REQUEST_AUDIT_EVENT_TYPE } from "../utils/enums";
import type { MaterialRequestAuditEvent } from "../utils/types";

const EVENT_ICON: Record<MATERIAL_REQUEST_AUDIT_EVENT_TYPE, { Icon: LucideIcon; className: string }> = {
	[MATERIAL_REQUEST_AUDIT_EVENT_TYPE.SUBMITTED]: {
		Icon: Circle,
		className: "border border-brand-dark/10 bg-brand-dark/[0.04] text-brand-dark50",
	},
	[MATERIAL_REQUEST_AUDIT_EVENT_TYPE.NOTE_ADDED]: {
		Icon: StickyNote,
		className: "border border-brand-dark/10 bg-brand-dark/[0.04] text-brand-dark50",
	},
	[MATERIAL_REQUEST_AUDIT_EVENT_TYPE.ASSIGNED]: {
		Icon: UserPlus,
		className: "bg-amber-50 text-amber-500",
	},
	[MATERIAL_REQUEST_AUDIT_EVENT_TYPE.REASSIGNED]: {
		Icon: RefreshCw,
		className: "bg-amber-50 text-amber-500",
	},
	[MATERIAL_REQUEST_AUDIT_EVENT_TYPE.APPROVED]: {
		Icon: CheckCircle2,
		className: "bg-emerald-50 text-emerald-600",
	},
	[MATERIAL_REQUEST_AUDIT_EVENT_TYPE.REJECTED]: {
		Icon: XCircle,
		className: "bg-red-50 text-red-500",
	},
};

const formatEventMeta = (event: MaterialRequestAuditEvent) =>
	[
		event.actorName ? `by ${event.actorName}` : null,
		event.actorRole,
		toLocalFormattedDate(event.timestamp, DATE_FORMAT.MM_SLASH_DD_YYYY),
		toLocalFormattedDate(event.timestamp, DATE_FORMAT.HH_MM_AA_PM),
	]
		.filter(Boolean)
		.join(" · ");

type MaterialRequestAuditTimelineProps<T extends MaterialRequestAuditEvent> = {
	events: T[];
	renderTitle?: (event: T) => string;
};

export function MaterialRequestAuditTimeline<T extends MaterialRequestAuditEvent>({
	events,
	renderTitle,
}: MaterialRequestAuditTimelineProps<T>) {
	if (events.length === 0) {
		return <p className="py-3 text-sm text-brand-dark50">No history available.</p>;
	}

	return (
		<ol className="relative">
			{events.map((event, index) => {
				const { Icon, className } = EVENT_ICON[event.type];
				const isLast = index === events.length - 1;

				return (
					<li key={index} className="relative flex gap-3 pb-4 last:pb-0">
						{!isLast && <span className="absolute left-[13px] top-7 h-[calc(100%-1rem)] w-px bg-brand-dark/10" />}
						<span
							className={cn(
								"relative z-10 flex h-[27px] w-[27px] shrink-0 items-center justify-center rounded-full",
								className
							)}
						>
							<Icon className="h-[15px] w-[15px]" />
						</span>
						<div className="flex-1">
							<p className="text-sm font-medium text-brand-dark">{renderTitle ? renderTitle(event) : event.title}</p>
							<p className="mt-0.5 text-xs text-brand-dark50">{formatEventMeta(event)}</p>
							{(event.reasonCode || event.note) && (
								<div className="mt-2 space-y-1 rounded-md bg-brand-dark/[0.04] px-3 py-2 text-xs leading-relaxed text-brand-dark60">
									{event.reasonCode && (
										<p>
											<span className="font-medium text-brand-dark">Reason: </span>
											{getMaterialSelectionReasonLabel(event.reasonCode)}
										</p>
									)}
									{event.note && (
										<p>
											<span className="font-medium text-brand-dark">Note: </span>
											{event.note}
										</p>
									)}
								</div>
							)}
						</div>
					</li>
				);
			})}
		</ol>
	);
}
