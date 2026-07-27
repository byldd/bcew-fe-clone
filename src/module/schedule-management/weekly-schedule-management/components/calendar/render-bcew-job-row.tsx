import React from "react";
import CalenderRowLayout from "./calender-row-layout";
import { IRenderBcewJobRowProps } from "../../types/calendar";
import { getHourDifference, isSameDate, toDate, toMidnightDateString } from "@/lib/utils/date";
import CalendarJobName from "./calendar-job-name";
import { QC_JOB_TYPE } from "../../types/schedule-interface";
import DroppableCard from "../job-card/droppable-card";
import { SCHEDULE_ROW_TYPE } from "../../constants/week-schedule";
import { useScheduleContext } from "../../context/schedule-context";

const RenderBcewJobRow = ({
	dataOfWeek,
	onSelectWorker,
	dragSelectedWorkers,
	schduleData,
	setDragSelectedWorkers,
	jobItem,
}: IRenderBcewJobRowProps) => {
	const bcewJob = jobItem.bcewJob;
	const rowType = jobItem.rowType as SCHEDULE_ROW_TYPE;
	const actrec = bcewJob?.schlin?.actrec || bcewJob?.srvinv?.actrec || bcewJob?.schlinExtended?.actrec;

	const { taskLeaderMapByRecnum } = useScheduleContext();

	const taskLeaders = actrec?.recnum ? taskLeaderMapByRecnum.get(Number(actrec?.recnum)) : [];

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
			<CalendarJobName
				rowType={rowType}
				bcewJob={bcewJob}
				isCarryOver={jobItem.isCarryOver}
				taskLeaders={taskLeaders}
			/>

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

				let actualHours = 0;

				jobDailyRecordsRaw?.forEach((dailyJob) => {
					if (toMidnightDateString(dailyJob.date) <= toMidnightDateString(day.date)) {
						dailyJob.jobEmployeeAssignments?.forEach((jobEmployee) => {
							if (jobEmployee.startTime && jobEmployee.endTime) {
								actualHours += getHourDifference(jobEmployee.startTime, jobEmployee.endTime);
							}
						});
					}
				});

				return (
					<DroppableCard
						key={`${colIndex}${dayilyJob?.id}-${rowType}-${qcJob?.id}`}
						bcewJob={bcewJob}
						day={day}
						onSelectWorker={onSelectWorker}
						dragSelectedWorkers={dragSelectedWorkers}
						dailyJobWithEmployee={dayilyJob || qcJob}
						actualHours={actualHours}
						subContractorForecastDate={rowType !== SCHEDULE_ROW_TYPE.QC_JOB ? subContractorForecastDate : null}
						setDragSelectedWorkers={setDragSelectedWorkers}
						rowType={rowType as SCHEDULE_ROW_TYPE}
					/>
				);
			})}
		</CalenderRowLayout>
	);
};

export default RenderBcewJobRow;
