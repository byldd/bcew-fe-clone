import { getBcewWeekRange, getTodayDate, isWeekendDate } from "@/lib/utils/date";
import { IUser } from "@/module/schedule-management/weekly-schedule-management/types/schedule-interface";

import { addDays } from "date-fns";

export const getSelfScheduleEnabledDateRange = () => {
	const { weekStart, weekEnd } = getBcewWeekRange(getTodayDate());
	const { weekEnd: nextWeekEnd } = getBcewWeekRange(addDays(weekEnd, 1));

	return {
		selfScheduleStartDate: weekStart,
		selfScheduleEndDate: nextWeekEnd,
	};
};

export const isSelfSchedulingEnabledForTheDate = ({
	date,
	user,
}: {
	date: string | Date;
	user: Pick<IUser, "isSelfSchedulingAllowed" | "isWeekendSelfSchedulingAllowed">;
}) => {
	const isWeekend = isWeekendDate(date);

	return isWeekend ? user.isWeekendSelfSchedulingAllowed : user.isSelfSchedulingAllowed;
};
