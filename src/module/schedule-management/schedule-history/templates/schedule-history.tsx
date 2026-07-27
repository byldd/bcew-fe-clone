"use client";
import { DataTable } from "@/components/shared/datatable/datatable";
import { ColumnDef } from "@tanstack/react-table";
import React from "react";
import { useScheduleColumns } from "../../weekly-schedule-management/utils/data-table-columns";
import { useGetScheduleHistory } from "../hooks/useScheduleHistory";
import { IScheduleHistory } from "../utils/schedule-history-type";
import SectionHeader from "@/components/shared/section-header";
import { useScheduleHistoryParams } from "../hooks/useScheduleHistoryParams";
import { dateToUTCString } from "@/lib/utils/date";
import DateRangeModal from "@/components/common/date-range-modal";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";

const ScheduleHistory = () => {
	const tableColumns: ColumnDef<IScheduleHistory>[] = useScheduleColumns();
	const { getParams, setParams } = useScheduleHistoryParams();
	const { startDate, endDate } = getParams();
	const tschedule = useTypedTranslations(NAMESPACE.SCHEDULE);

	const { data: scheduleHistory, isLoading } = useGetScheduleHistory({
		startDate: dateToUTCString(startDate),
		endDate: dateToUTCString(endDate),
	});

	return (
		<div className="space-y-4">
			<div className="flex items-center gap-4">
				<SectionHeader title={tschedule.scheduleHistory} showBackButton />
				<DateRangeModal
					startDate={startDate}
					endDate={endDate}
					onChange={(startDate, endDate) => setParams({ startDate, endDate })}
				/>
			</div>

			<DataTable
				columns={tableColumns}
				data={scheduleHistory?.items || []}
				isLoading={isLoading}
				useSectionHeader={false}
			/>
		</div>
	);
};

export default ScheduleHistory;
