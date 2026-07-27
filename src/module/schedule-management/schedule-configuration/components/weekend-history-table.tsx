"use client";
import React from "react";
import { useGetWeekendWorks } from "@/module/schedule-management/schedule-configuration/hooks/useScheduleConfig";
import DateRangePickModal from "@/components/common/date-range-modal";
import { useScheduleConfigParams } from "../hooks/useScheduleConfigParams";
import { dateToUTCString, toDate } from "@/lib/utils/date";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
import SectionHeader from "@/components/shared/section-header";
import WeekendHistoryCollapsibleTable from "./weekend-history-collapsible-table";

const WeekendHistoryTable = () => {
	const { getParams, setParams } = useScheduleConfigParams();
	const { startDate, endDate } = getParams();
	const { data, isLoading } = useGetWeekendWorks({ startDate, endDate });
	const tschedule = useTypedTranslations(NAMESPACE.SCHEDULE);

	return (
		<div className="space-y-4">
			{/* Header */}
			<div className="flex flex-wrap items-center justify-between gap-2">
				<SectionHeader title={tschedule.weekendHistory} hideSidebarToggle />
				<div className="py-1">
					<DateRangePickModal
						startDate={toDate(startDate)}
						endDate={toDate(endDate)}
						onChange={(startDate, endDate) => {
							setParams({
								startDate: startDate ? dateToUTCString(startDate) : undefined,
								endDate: endDate ? dateToUTCString(endDate) : undefined,
							});
						}}
						onMoveBack={(startDate, endDate) => {
							setParams({
								startDate: startDate ? dateToUTCString(startDate) : undefined,
								endDate: endDate ? dateToUTCString(endDate) : undefined,
							});
						}}
						onMoveForward={(startDate, endDate) => {
							setParams({
								startDate: startDate ? dateToUTCString(startDate) : undefined,
								endDate: endDate ? dateToUTCString(endDate) : undefined,
							});
						}}
						dayRange={50}
					/>
				</div>
			</div>

			<WeekendHistoryCollapsibleTable data={data ?? []} isLoading={isLoading} />
		</div>
	);
};

export default WeekendHistoryTable;
