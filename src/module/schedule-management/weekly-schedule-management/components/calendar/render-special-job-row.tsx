import React from "react";
import { SCHEDULE_ROW_TYPE } from "../../constants/week-schedule";
import CalendarJobName from "./calendar-job-name";
import DroppableCard from "../job-card/droppable-card";
import { isSameDate } from "@/lib/utils/date";
import { IRenderSpecialJobRowProps } from "../../types/calendar";
import CalenderRowLayout from "./calender-row-layout";

const RenderSpecialJob = ({
	dataOfWeek,
	specialJob,
	onSelectWorker,
	dragSelectedWorkers,
	schduleData,
	setDragSelectedWorkers,
}: IRenderSpecialJobRowProps) => {
	return (
		<CalenderRowLayout dataOfWeek={dataOfWeek}>
			<CalendarJobName rowType={SCHEDULE_ROW_TYPE.SPECIAL_JOB} specialJob={specialJob} />

			{dataOfWeek.map((day, colIndex) => {
				const jobDailyRecordsRaw = schduleData?.dailyJobs?.filter((record) => record.specialJobId === specialJob.id);

				const matchedRecords = jobDailyRecordsRaw?.filter((record) => {
					if (!record.date) return false;

					return isSameDate(day.date, record.date);
				});

				return (
					<DroppableCard
						key={`${colIndex}${specialJob?.id}`}
						day={day}
						onSelectWorker={onSelectWorker}
						dragSelectedWorkers={dragSelectedWorkers}
						dailyJobWithEmployee={matchedRecords?.[0]}
						specialJob={specialJob}
						setDragSelectedWorkers={setDragSelectedWorkers}
						rowType={SCHEDULE_ROW_TYPE.SPECIAL_JOB}
					/>
				);
			})}
		</CalenderRowLayout>
	);
};

export default RenderSpecialJob;
