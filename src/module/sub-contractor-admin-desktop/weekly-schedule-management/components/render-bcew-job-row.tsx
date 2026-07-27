import React from "react";

import { isSameDate, toDate, toMidnightDateString } from "@/lib/utils/date";
import { SCHEDULE_ROW_TYPE } from "@/module/schedule-management/weekly-schedule-management/constants/week-schedule";
import CalenderRowLayout from "@/module/schedule-management/weekly-schedule-management/components/calendar/calender-row-layout";
import CalendarJobName from "@/module/schedule-management/weekly-schedule-management/components/calendar/calendar-job-name";
import { IRenderBcewJobRowProps } from "@/module/schedule-management/weekly-schedule-management/types/calendar";
import { QC_JOB_TYPE } from "@/module/schedule-management/weekly-schedule-management/types/schedule-interface";
import SubContractorCalendarJobCard from "./job-card";

const RenderBcewJobRow = ({
	dataOfWeek,
	schduleData,
	jobItem,
}: Pick<IRenderBcewJobRowProps, "dataOfWeek" | "schduleData" | "jobItem">) => {
	const bcewJob = jobItem.bcewJob;
	const rowType = jobItem.rowType as SCHEDULE_ROW_TYPE;

	const jobDailyRecordsRaw = schduleData?.dailyJobs?.filter(
		(record) =>
			(record?.bcewSchlinIdNum && record.bcewSchlinIdNum) === bcewJob.schlin?.idnum ||
			(record.bcewSrvinvIdNum && record.bcewSrvinvIdNum) === bcewJob.srvinv?.idnum ||
			(record.bcewSchlinExtendedId && record.bcewSchlinExtendedId) === bcewJob.schlinExtended?.id
	);

	let subContractorForecastDate: Date | null = null;

	jobDailyRecordsRaw?.forEach((dailyJob) => {
		if (
			subContractorForecastDate &&
			dailyJob?.subContractorJobUpdate?.forecastDate &&
			toMidnightDateString(subContractorForecastDate) <
				toMidnightDateString(toDate(dailyJob?.subContractorJobUpdate?.forecastDate))
		) {
			subContractorForecastDate = toDate(dailyJob?.subContractorJobUpdate?.forecastDate);
		} else if (dailyJob?.subContractorJobUpdate?.forecastDate) {
			subContractorForecastDate = toDate(dailyJob?.subContractorJobUpdate?.forecastDate);
		}
	});

	return (
		<CalenderRowLayout dataOfWeek={dataOfWeek}>
			<CalendarJobName rowType={rowType} bcewJob={bcewJob} isCarryOver={jobItem.isCarryOver} />

			{dataOfWeek.map((day, colIndex) => {
				const matchedRecords = jobDailyRecordsRaw?.filter((record) => {
					if (!record.date) return false;

					return isSameDate(day.date, record.date);
				});

				const dayilyJob = matchedRecords?.find((record) => !record.isQcJob && rowType === SCHEDULE_ROW_TYPE.DAILY_JOB);
				const qcJob = matchedRecords?.find(
					(record) =>
						(record.qcType == QC_JOB_TYPE.REPAIR && rowType === SCHEDULE_ROW_TYPE.QC_REPAIR) ||
						(record.qcType == QC_JOB_TYPE.INSPECTION && rowType === SCHEDULE_ROW_TYPE.QC_INSPECTION)
				);

				return (
					<SubContractorCalendarJobCard
						key={`${colIndex}${dayilyJob?.id}-${rowType}-${qcJob?.id}`}
						bcewJob={bcewJob}
						dailyJobWithEmployee={dayilyJob || qcJob}
						day={day}
						subContractorForecastDate={rowType !== SCHEDULE_ROW_TYPE.QC_JOB ? subContractorForecastDate : null}
					/>
				);
			})}
		</CalenderRowLayout>
	);
};

export default RenderBcewJobRow;
