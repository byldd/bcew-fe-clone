import { useGetUserWeekendWork } from "../../hooks/useWeekendWork";
import { getTodayDate, toDate, toMidnightDateString } from "@/lib/utils/date";
import { useEmployeeScheduleParams } from "@/module/job/hooks/useEmployeeScheduleParams";

import { getActiveWeekendDates } from "@/module/schedule-management/schedule-configuration/utils/weekend-config-form";
import WeekendBannerCard from "./weekend-banner-card";
import { WEEK_DAY_NUMBERS } from "@/utils/enums";
import { E_WEEKEND_WORKING_MODE } from "@/module/schedule-management/weekly-schedule-management/types/schedule-configuration";
import { IGetUserWeekendWorkResponse } from "../../types/weekend-work";

const WeekendBanner = () => {
	const { getParams } = useEmployeeScheduleParams();
	const { startDate } = getParams();

	const { saturday, sunday } = getActiveWeekendDates(getTodayDate());

	const { data: weekendWorks } = useGetUserWeekendWork({
		date: toMidnightDateString(startDate),
		startDate: toMidnightDateString(saturday),
		endDate: toMidnightDateString(sunday),
	});

	if (!weekendWorks?.length) {
		return null;
	}

	const saturdayWork = weekendWorks?.find(
		(weekendWork) => toDate(weekendWork?.date)?.getDay() == WEEK_DAY_NUMBERS?.SATURDAY
	);

	const sundayWork = weekendWorks?.find(
		(weekendWork) => toDate(weekendWork?.date)?.getDay() == WEEK_DAY_NUMBERS?.SUNDAY
	);

	const weekWorksToShow: IGetUserWeekendWorkResponse = [];

	if (saturdayWork?.userWeekendWork || saturdayWork?.mode == E_WEEKEND_WORKING_MODE.NOT_WORKING) {
		weekWorksToShow.push(saturdayWork);
	}

	if (sundayWork?.userWeekendWork) {
		weekWorksToShow.push(sundayWork);
	}

	return (
		<>
			{weekWorksToShow.length > 0 && (
				<div className="space-y-1 rounded-[8px] bg-brand-bgYellow p-2 text-brand-yellow800">
					{weekWorksToShow?.map((weekendWork) => {
						return <WeekendBannerCard weekendWork={weekendWork} key={weekendWork?.id} />;
					})}
				</div>
			)}
		</>
	);
};

export default WeekendBanner;
