import React, { useState } from "react";
import { IHistoryEtrRecord, HISTORY_RECORD_STATUS, isApprovedToStatus } from "../types";
import { cn } from "@/lib/utils/utils";
import { toFormattedDate, toLocalFormattedDate } from "@/lib/utils/date";
import { DATE_FORMAT } from "@/types/date";
import { extendedTimeTypeMap } from "@/module/schedule-management/time-logs-management/utils/constants";
import { extendedReasonMap } from "@/module/job/utils/constants";
import { LuClock } from "react-icons/lu";
import { extendedTimeType } from "@/module/job/utils/enums";
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

const EtrRecordItem = ({ record }: { record: IHistoryEtrRecord }) => {
	const status = isApprovedToStatus(record.isApproved);
	const cfg = statusConfig[status] ?? statusConfig[HISTORY_RECORD_STATUS.PENDING]!;
	const typeLabel = extendedTimeTypeMap[record.extendedType] ?? record.extendedType;
	const reasonLabel = extendedReasonMap[record.extendedReason] ?? record.extendedReason;
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
					<span className={cn("text-sm font-semibold", cfg.titleClass)}>ETR ({typeLabel})</span>
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
				<div className="px-3 pb-2.5 pt-2">
					{(record.adminNote || reasonLabel) && (
						<div className="mb-2">
							<p className="text-xs text-brand-grey">Reason</p>
							<p className="mt-0.5 text-sm font-medium text-brand-dark">{record.adminNote || reasonLabel}</p>
						</div>
					)}

					<div className="flex items-center justify-between">
						<div>
							<p className="text-xs text-brand-grey">ETR (Requested)</p>
							<p className="text-sm font-medium text-brand-dark">
								{record.extendedType === extendedTimeType.EARLY_START
									? record.startTime
										? toFormattedDate(record.startTime, DATE_FORMAT.HH_MM_AA_PM)
										: "--"
									: record.extendedType === extendedTimeType.BOTH
										? `${record.startTime ? toFormattedDate(record.startTime, DATE_FORMAT.HH_MM_AA_PM) : "--"} — ${record.endTime ? toFormattedDate(record.endTime, DATE_FORMAT.HH_MM_AA_PM) : "--"}`
										: record.endTime
											? toFormattedDate(record.endTime, DATE_FORMAT.HH_MM_AA_PM)
											: "--"}
							</p>
						</div>
						<div className="text-right">
							<p className="text-xs text-brand-grey">Submitted</p>
							<p className="text-sm font-medium text-brand-dark">
								{record.createdAt ? toLocalFormattedDate(record.createdAt, DATE_FORMAT.MM_SLASH_DD_YYYY) : "--"}
							</p>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default EtrRecordItem;
