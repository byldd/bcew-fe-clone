import React, { useState } from "react";
import { IHistoryTravelPayRecord } from "../types";
import { cn } from "@/lib/utils/utils";
import { TRAVEL_PAY_REQUEST_STATUS } from "@/module/schedule-management/travel-pay/types";
import { LuClock } from "react-icons/lu";
import { ChevronDown, ChevronUp } from "lucide-react";

const statusConfig: Record<
	string,
	{ label: string; badgeClass: string; borderClass: string; bgClass: string; titleClass: string }
> = {
	[TRAVEL_PAY_REQUEST_STATUS.APPROVED]: {
		label: "Approved",
		badgeClass: "bg-[#1665341A] text-[#166534]",
		borderClass: "border-[#166534]",
		bgClass: "bg-[#1665341A]",
		titleClass: "text-[#166534]",
	},
	[TRAVEL_PAY_REQUEST_STATUS.REJECTED]: {
		label: "Rejected",
		badgeClass: "bg-[#E7000B1A] text-[#E7000B]",
		borderClass: "border-[#E7000B]",
		bgClass: "bg-[#E7000B0D]",
		titleClass: "text-[#E7000B]",
	},
	[TRAVEL_PAY_REQUEST_STATUS.PENDING]: {
		label: "Pending",
		badgeClass: "bg-[#FFFBEB] text-[#78350F]",
		borderClass: "border-[#78350F]",
		bgClass: "bg-[#78350F1A]",
		titleClass: "text-[#78350F]",
	},
};

const TravelPayRecordItem = ({ record }: { record: IHistoryTravelPayRecord }) => {
	const latestStatus = record.traevlPayRequestStatuses?.[0]?.status;
	const status = latestStatus ?? TRAVEL_PAY_REQUEST_STATUS.PENDING;
	const cfg = statusConfig[status] ?? statusConfig[TRAVEL_PAY_REQUEST_STATUS.PENDING]!;
	const [expanded, setExpanded] = useState(
		status === TRAVEL_PAY_REQUEST_STATUS.PENDING || status === TRAVEL_PAY_REQUEST_STATUS.REJECTED
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
					<span className={cn("text-sm font-semibold", cfg.titleClass)}>Travel Pay</span>
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
					<div className="flex items-center justify-between">
						<div>
							<p className="text-xs text-brand-grey">Home → 1st Stop</p>
							<p className="text-sm font-medium text-brand-dark">{record.firstStopDistance} Miles</p>
						</div>
						<div className="text-right">
							<p className="text-xs text-brand-grey">Last Stop → Home</p>
							<p className="text-sm font-medium text-brand-dark">{record.lastStopDistance} Miles</p>
						</div>
					</div>
					{record.note && <p className={cn("mt-1 text-xs font-medium", cfg.titleClass)}>{record.note}</p>}
				</div>
			)}
		</div>
	);
};

export default TravelPayRecordItem;
