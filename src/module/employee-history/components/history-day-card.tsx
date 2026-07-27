"use client";

import React, { useEffect, useState } from "react";
import { IEmployeeHistoryDay, HISTORY_RECORD_STATUS, isApprovedToStatus } from "../types";
import { cn } from "@/lib/utils/utils";
import { toFormattedDate, toLocalFormattedDate } from "@/lib/utils/date";
import { DATE_FORMAT } from "@/types/date";
import { ChevronDown, ChevronUp } from "lucide-react";
import EtrRecordItem from "./etr-record-item";
import TravelPayRecordItem from "./travel-pay-record-item";
import NewJobRecordItem from "./new-job-record-item";
import { calculateStopHours } from "@/module/schedule-management/time-logs-management/utils/calculate-hours";

const statusConfig: Record<string, { label: string; className: string }> = {
	APPROVED: { label: "Approved", className: "bg-[#1665341A] text-[#166534]" },
	REJECTED: { label: "Rejected", className: "bg-[#E7000B1A] text-[#E7000B]" },
	PENDING: { label: "Pending", className: "bg-[#FFFBEB] text-[#78350F]" },
};

const PENDING_STATUSES = new Set([HISTORY_RECORD_STATUS.PENDING, HISTORY_RECORD_STATUS.REJECTED]);

const HistoryDayCard = ({ day }: { day: IEmployeeHistoryDay }) => {
	const travelPayRequests = day.data?.travelPayRequests ?? [];
	const etrWrappers = day.data?.extendedRequests ?? [];
	const newJobRequests = day.data?.newJobRequests ?? [];
	const stopTimes = day.data?.stopTimes ?? [];
	const daytimeLog = day.data?.daytimeLog ?? null;
	const pauseTimes = daytimeLog?.employeePauseTime ?? [];

	const dayStart = daytimeLog?.overrideStartTime ?? daytimeLog?.dayStartTime ?? null;

	const dayEnd = daytimeLog?.overrideEndTime ?? daytimeLog?.dayEndTime ?? null;

	const dayWorkedHours = stopTimes.reduce((sum, stop) => {
		const stopHours = calculateStopHours({ stop, employeePauseTime: pauseTimes });
		return typeof stopHours === "number" ? sum + stopHours : sum;
	}, 0);

	const statusOrder: Record<string, number> = { REJECTED: 0, PENDING: 1, APPROVED: 2 };

	const etrRecords = etrWrappers
		.flatMap((w) => w.extendedRequestTimes ?? [])
		.sort(
			(a, b) =>
				(statusOrder[isApprovedToStatus(a.isApproved)] ?? 3) - (statusOrder[isApprovedToStatus(b.isApproved)] ?? 3)
		);

	const sortedTravelPayRequests = [...travelPayRequests].sort((a, b) => {
		const aStatus = a.traevlPayRequestStatuses?.[0]?.status ?? HISTORY_RECORD_STATUS.PENDING;
		const bStatus = b.traevlPayRequestStatuses?.[0]?.status ?? HISTORY_RECORD_STATUS.PENDING;
		return (statusOrder[aStatus] ?? 3) - (statusOrder[bStatus] ?? 3);
	});

	const sortedNewJobRequests = [...newJobRequests].sort(
		(a, b) =>
			(statusOrder[isApprovedToStatus(a.isApproved)] ?? 3) - (statusOrder[isApprovedToStatus(b.isApproved)] ?? 3)
	);

	const allStatuses: string[] = [
		...etrRecords.map((r) => isApprovedToStatus(r.isApproved) as string),
		...travelPayRequests.map((r) => r.traevlPayRequestStatuses?.[0]?.status ?? HISTORY_RECORD_STATUS.PENDING),
		...newJobRequests.map((r) => isApprovedToStatus(r.isApproved) as string),
	];

	const hasPending = allStatuses.some((s) => PENDING_STATUSES.has(s as HISTORY_RECORD_STATUS));
	const [expanded, setExpanded] = useState(false);
	const [logsExpanded, setLogsExpanded] = useState(true);

	useEffect(() => {
		if (hasPending) setExpanded(true);
	}, [hasPending]);

	const hasRecords =
		etrRecords.length > 0 || travelPayRequests.length > 0 || newJobRequests.length > 0 || stopTimes.length > 0;

	const isWeekend = (() => {
		const d = new Date(day.date).getDay();
		return d === 0 || d === 6;
	})();

	const dayLabel = `${toLocalFormattedDate(day.date, DATE_FORMAT.FULL_WEEK_DAY)} ${toLocalFormattedDate(day.date, DATE_FORMAT.MM_SLASH_DD_YYYY)}`;

	const statusCounts = allStatuses.reduce<Record<string, number>>((acc, s) => {
		acc[s] = (acc[s] ?? 0) + 1;
		return acc;
	}, {});

	return (
		<div className="overflow-hidden rounded-[12px] border-none bg-white">
			<button
				className="flex w-full items-center justify-between px-4 py-3 text-left"
				onClick={() => hasRecords && setExpanded((v) => !v)}
				disabled={!hasRecords}
			>
				<div className="min-w-0 flex-1">
					<p className="text-sm font-semibold text-brand-dark">{dayLabel}</p>
					{Object.keys(statusCounts).length > 0 && (
						<div className="mt-1.5 flex flex-wrap gap-1.5">
							{Object.entries(statusCounts)
								.sort(([a], [b]) => {
									const order: Record<string, number> = { REJECTED: 0, PENDING: 1, APPROVED: 2 };
									return (order[a] ?? 3) - (order[b] ?? 3);
								})
								.map(([status, count]) => {
									const cfg = statusConfig[status];
									if (!cfg) return null;
									return (
										<span
											key={status}
											className={cn("rounded-[4px] px-2.5 py-0.5 text-[10px] font-semibold", cfg.className)}
										>
											{count} {cfg.label.toLowerCase()}
										</span>
									);
								})}
						</div>
					)}
				</div>
				<div className="ml-3 flex shrink-0 items-center gap-1.5">
					{dayWorkedHours > 0 && (
						<span className="text-sm font-semibold text-brand-dark">{dayWorkedHours.toFixed(1)}h</span>
					)}
					{dayWorkedHours === 0 && <span className="text-sm text-brand-grey">0</span>}

					{hasRecords &&
						(expanded ? (
							<ChevronUp size={16} className="text-brand-grey" />
						) : (
							<ChevronDown size={16} className="text-brand-grey" />
						))}
				</div>
			</button>

			{expanded && (
				<div className="border-t border-gray-100 bg-gray-50 px-4 pb-4 pt-3">
					{stopTimes.length > 0 && (
						<div className="mb-2 overflow-hidden rounded-[8px] bg-white">
							<button
								className="flex w-full items-center justify-between px-3 py-2 text-left"
								onClick={() => setLogsExpanded((v) => !v)}
							>
								<p className="text-sm font-semibold text-brand-dark">Logged time - {stopTimes.length} stops</p>
								{logsExpanded ? (
									<ChevronUp size={14} className="text-brand-grey" />
								) : (
									<ChevronDown size={14} className="text-brand-grey" />
								)}
							</button>
							{logsExpanded && (
								<div className="space-y-1 px-3 pb-2.5 pt-1">
									{(dayStart || dayEnd) && (
										<p className="text-xs font-semibold text-brand-dark">
											{dayStart ? toFormattedDate(dayStart, DATE_FORMAT.HH_MM_AA_PM) : "--"}
											{" — "}
											{dayEnd ? toFormattedDate(dayEnd, DATE_FORMAT.HH_MM_AA_PM) : "--"}
										</p>
									)}
									{stopTimes.map((s, i) => {
										const num = s.stopNumber ?? i + 1;
										const ordinal = num === 1 ? "st" : num === 2 ? "nd" : num === 3 ? "rd" : "th";
										const jobName = s.JobDailyRecord?.actrec?.jobnme ?? s.JobDailyRecord?.specialJob?.name ?? "--";
										return (
											<div key={s.id} className="flex items-center justify-between text-xs">
												<span className="text-brand-grey">
													{num}
													{ordinal} Stop
												</span>
												<span className="font-medium text-brand-dark">{jobName}</span>
											</div>
										);
									})}
								</div>
							)}
						</div>
					)}

					{etrRecords.map((r) => (
						<EtrRecordItem key={r.id} record={r} />
					))}
					{sortedTravelPayRequests.map((r) => (
						<TravelPayRecordItem key={r.id} record={r} />
					))}
					{sortedNewJobRequests.map((r) => (
						<NewJobRecordItem key={r.id} record={r} />
					))}
				</div>
			)}
		</div>
	);
};

export default HistoryDayCard;
