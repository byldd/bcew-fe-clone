import { IHolidayConfiguration } from "@/module/schedule-management/weekly-schedule-management/types/schedule-configuration";
import { getHolidayAndSpecialDay } from "@/module/schedule-management/weekly-schedule-management/utils";

export const generateSubContractorCalendarDates = ({
	startDate,
	data,
	holidays,
}: {
	startDate: Date;
	data: { isSat: boolean | undefined; isSun: boolean | undefined };
	holidays: IHolidayConfiguration[] | undefined;
}) => {
	const dates = [];
	let i = 0;

	while (dates.length < 7) {
		const nextDate = new Date(startDate);
		nextDate.setDate(startDate.getDate() + i);
		nextDate.setHours(0, 0, 0, 0);
		const { type, time } = getHolidayAndSpecialDay(nextDate, holidays);
		const dayData = { date: nextDate, type, time };
		if (nextDate.getDay() === 6 && data?.isSat) {
			dates.push(dayData);
		} else if (nextDate.getDay() === 0 && data?.isSun) {
			dates.push(dayData);
		} else if (nextDate.getDay() > 0 && nextDate.getDay() < 6) {
			dates.push(dayData);
		}
		i++;
	}
	return dates;
};
