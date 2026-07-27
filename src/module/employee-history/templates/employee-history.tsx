"use client";

import React from "react";
import { useGetEmployeeHistory } from "../hooks/useEmployeeHistory";
import { useEmployeeHistoryParams } from "../hooks/useEmployeeHistoryParams";
import { toMidnightDateString, toFormattedDate, getBcewWeekRange, toDate } from "@/lib/utils/date";
import HistoryDayCard from "../components/history-day-card";
import BackButton from "@/components/common/back-button";
import DateRangePickModal, { DATE_PICK_APPLY_TO } from "@/components/common/date-range-modal";
import { DATE_FORMAT } from "@/types/date";

import { calculateHistoryWeekSummary } from "../utils/calculate-history-summary";

const EmployeeHistoryTemplate = () => {
	const { getParams, setParams } = useEmployeeHistoryParams();
	const { date } = getParams();
	const { weekStart, weekEnd } = getBcewWeekRange(date);

	const { data: apiData, isPending } = useGetEmployeeHistory({
		startDate: toMidnightDateString(weekStart),
		endDate: toMidnightDateString(weekEnd),
	});

	const data = apiData ?? [];

	const sortedData = [...data].sort((a, b) => toDate(a.date).getTime() - toDate(b.date).getTime());

	const { totalWorkedHours, totalScheduleHours } = calculateHistoryWeekSummary(data);

	const dateRangeLabel = `All Activity from ${toFormattedDate(weekStart, DATE_FORMAT.MM_SLASH_DD_YYYY)} to ${toFormattedDate(weekEnd, DATE_FORMAT.MM_SLASH_DD_YYYY)}`;

	return (
		<div className="flex h-screen flex-col bg-brand-bgLightgrey">
			<div className="shrink-0 bg-brand-bgLightgrey px-4 pb-3 pt-4">
				<div className="flex items-center justify-between gap-2">
					<div className="flex items-center gap-1">
						<BackButton />
						<p className="text-xl font-semibold text-brand-dark">My History</p>
					</div>
					<DateRangePickModal
						startDate={weekStart}
						endDate={weekEnd}
						selectApplyTo={DATE_PICK_APPLY_TO.END_DATE}
						onMoveBack={(startDate) => {
							setParams({ date: startDate });
						}}
						onMoveForward={(startDate, endDate) => {
							setParams({ date: endDate });
						}}
						onChange={(startDate, endDate) => {
							setParams({ date: endDate });
						}}
						dayRange={6}
					/>
				</div>
				<p className="ml-9 mt-0.5 text-sm font-medium text-brand-grey">{dateRangeLabel}</p>

				<div className="mt-3 flex gap-3">
					<div className="flex-1 rounded-[10px] border-none bg-white px-4 py-3 text-start">
						<p className="text-xs text-brand-dark50">Logged Hours</p>
						<p className="text-sm font-semibold text-brand-dark">
							{totalWorkedHours > 0 ? totalWorkedHours.toFixed(1) : "-"}
						</p>
					</div>
					<div className="flex-1 rounded-[10px] border-none bg-white px-4 py-3 text-start">
						<p className="text-xs text-brand-dark50">Scheduled Hours</p>
						<p className="text-sm font-semibold text-brand-dark">
							{totalScheduleHours > 0 ? totalScheduleHours.toFixed(1) : "-"}
						</p>
					</div>
				</div>
			</div>

			<div className="flex-1 overflow-y-auto px-4 pb-8">
				{/* Daily breakdown heading */}
				<p className="pb-2 text-sm font-medium tracking-wide text-brand-grey">Daily Breakdown</p>

				{isPending && (
					<div className="space-y-3">
						{[...Array(6)].map((_, i) => (
							<div key={i} className="h-16 animate-pulse rounded-[12px] bg-white" />
						))}
					</div>
				)}

				{/* Day cards */}
				{!isPending && (
					<div className="space-y-2">
						{sortedData.map((day) => (
							<HistoryDayCard key={day.date} day={day} />
						))}
					</div>
				)}
			</div>
		</div>
	);
};

export default EmployeeHistoryTemplate;
