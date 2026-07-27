import React from "react";
import { useSubContractorScheduleContext } from "../context/schedule-context";
import { SCHEDULE_ROW_TYPE } from "@/module/schedule-management/weekly-schedule-management/constants/week-schedule";
import { cn } from "@/lib/utils/utils";
import { WeekHeader } from "@/module/schedule-management/weekly-schedule-management/components/week-header";
import { useHolidayConfiguration } from "@/module/schedule-management/weekly-schedule-management/hooks/useScheduleConfig";
import { generateSubContractorCalendarDates } from "../utils/date";
import { useScheduleParams } from "@/module/schedule-management/weekly-schedule-management/hooks/useScheduleParams";
import RenderBcewJobRow from "./render-bcew-job-row";
import { QC_JOB_TYPE } from "@/module/schedule-management/weekly-schedule-management/types/schedule-interface";
import useAuthStore from "@/store/auth-store";

const SubContractorCalendar = () => {
	const { user } = useAuthStore((state) => state);
	const { schduleData, jobOnSaturday, jobOnSunday } = useSubContractorScheduleContext();
	const { data: holidays } = useHolidayConfiguration(user);
	const { getParams } = useScheduleParams();

	const { startDate } = getParams();

	const extendedjobsWithTypes =
		schduleData?.bcewJobs
			?.flatMap((bcewJob) => {
				if (bcewJob.schlinExtended) {
					const qcJobs = [];

					if (
						bcewJob?.schlinExtended?.qcrcmp &&
						schduleData?.dailyJobs?.some(
							(dailyJob) =>
								dailyJob?.qcType === QC_JOB_TYPE.REPAIR && dailyJob?.bcewSchlinExtendedId === bcewJob.schlinExtended?.id
						)
					) {
						qcJobs.push({ rowType: SCHEDULE_ROW_TYPE.QC_REPAIR, bcewJob });
					}
					return [...qcJobs];
				}
				return [{ rowType: SCHEDULE_ROW_TYPE.DAILY_JOB, bcewJob }];
			})
			.flat() || [];

	const dataOfWeek = generateSubContractorCalendarDates({
		startDate: startDate,
		data: {
			isSat: jobOnSaturday,
			isSun: jobOnSunday,
		},
		holidays,
	});

	return (
		<div className={cn("scrollbar max-h-[calc(100vh-170px)] overflow-auto sm:max-h-[calc(100vh-110px)]")}>
			<WeekHeader datesOfWeek={dataOfWeek.map((day) => day.date)} />
			<div style={{ position: "relative" }} className={cn("min-h-full min-w-max")}>
				<div />

				{extendedjobsWithTypes.map((item, i) => {
					if ("bcewJob" in item && item.bcewJob) {
						return (
							<div
								key={`${item?.bcewJob?.schlin?.idnum || item?.bcewJob?.srvinv?.idnum || item?.bcewJob?.schlinExtended?.id}-${item.rowType}-${i}`}
								className="mb-2 h-auto min-w-full"
							>
								<RenderBcewJobRow dataOfWeek={dataOfWeek} schduleData={schduleData} jobItem={item} />
							</div>
						);
					}
				})}
			</div>
		</div>
	);
};

export default SubContractorCalendar;
