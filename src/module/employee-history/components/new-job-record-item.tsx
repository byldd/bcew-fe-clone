import React, { useState } from "react";
import { IHistoryNewJobRecord, HISTORY_RECORD_STATUS, isApprovedToStatus } from "../types";
import { cn } from "@/lib/utils/utils";
import { toFormattedDate } from "@/lib/utils/date";
import { DATE_FORMAT } from "@/types/date";
import { LuClock } from "react-icons/lu";
import { ChevronDown, ChevronUp } from "lucide-react";

const statusConfig: Record<
	string,
	{ label: string; badgeClass: string; borderClass: string; bgClass: string; titleClass: string }
> = {
	[HISTORY_RECORD_STATUS.APPROVED]: {
		label: "Approved",
		badgeClass: "bg-[#1665341A] text-[#166534]",
		borderClass: "border-[#166534]",
		bgClass: "bg-[#1665341A]",
		titleClass: "text-[#166534]",
	},
	[HISTORY_RECORD_STATUS.REJECTED]: {
		label: "Rejected",
		badgeClass: "bg-[#E7000B1A] text-[#E7000B]",
		borderClass: "border-[#E7000B]",
		bgClass: "bg-[#E7000B0D]",
		titleClass: "text-[#E7000B]",
	},
	[HISTORY_RECORD_STATUS.PENDING]: {
		label: "Pending",
		badgeClass: "bg-[#FFFBEB] text-[#78350F]",
		borderClass: "border-[#78350F]",
		bgClass: "bg-[#78350F1A]",
		titleClass: "text-[#78350F]",
	},
};

const NewJobRecordItem = ({ record }: { record: IHistoryNewJobRecord }) => {
	const status = isApprovedToStatus(record.isApproved);
	const cfg = statusConfig[status] ?? statusConfig[HISTORY_RECORD_STATUS.PENDING]!;
	const [expanded, setExpanded] = useState(
		status === HISTORY_RECORD_STATUS.PENDING || status === HISTORY_RECORD_STATUS.REJECTED
	);

	return (
		<div className={cn("mt-2 overflow-hidden rounded-[8px] border bg-white", cfg.borderClass)}>
			{/* Header — colored background only here */}
			<button
				className={cn("flex w-full items-center justify-between px-3 py-2", cfg.bgClass)}
				onClick={() => setExpanded((v) => !v)}
			>
				<div className="flex items-center gap-1.5">
					<LuClock size={14} className={cfg.titleClass} />
					<span className={cn("text-sm font-semibold", cfg.titleClass)}>New Job Request</span>
				</div>
				<div className="flex items-center gap-1.5">
					<span className={cn("rounded-[4px] px-2.5 py-0.5 text-[10px] font-semibold", cfg.badgeClass)}>
						{cfg.label}
					</span>
					{expanded ? (
						<ChevronUp size={14} className={cfg.titleClass} />
					) : (
						<ChevronDown size={14} className={cfg.titleClass} />
					)}
				</div>
			</button>

			{/* Body — visible when expanded */}
			{expanded && (
				<div className="space-y-1 px-3 py-3">
					{(record.actrec || record.project) && (
						<>
							<div className="flex items-center justify-between text-xs text-brand-grey">
								<span>Storage Unit Name</span>
								<span>Work Type</span>
							</div>
							<div className="flex items-center justify-between text-sm font-medium text-brand-dark">
								<span>{record.actrec ?? "--"}</span>
								<span>{record.project ?? "--"}</span>
							</div>
						</>
					)}
					<div className="mt-1.5 flex items-center justify-between text-xs text-brand-grey">
						<span>Entry Time</span>
						<span>Exit Time</span>
					</div>
					<div className="flex items-center justify-between text-sm font-medium text-brand-dark">
						<span>{record.startTime ? toFormattedDate(record.startTime, DATE_FORMAT.HH_MM_AA_PM) : "--"}</span>
						<span>{record.endTime ? toFormattedDate(record.endTime, DATE_FORMAT.HH_MM_AA_PM) : "--"}</span>
					</div>
					{record.adminNote && <p className="mt-1 text-xs text-brand-grey">{record.adminNote}</p>}
				</div>
			)}
		</div>
	);
};

export default NewJobRecordItem;
