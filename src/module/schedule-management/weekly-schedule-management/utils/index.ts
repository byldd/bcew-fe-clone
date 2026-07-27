import { addDays, format } from "date-fns";
import { E_WEEKEND_WORKING_MODE, IHolidayConfiguration } from "../types/schedule-configuration";
import { holidayTypes } from "./enums";
import { isSameDate, toDate } from "@/lib/utils/date";
import { IGetWeekendWorksResponse } from "../../schedule-configuration/types/schedule-config";

export const getHolidayAndSpecialDay = (date: Date, holidays: IHolidayConfiguration[] | undefined) => {
	if (!holidays || holidays.length === 0) {
		return { type: "", startTime: "" };
	}

	// Compare only the date portion (ignoring time)
	const target = toDate(date).toDateString();

	const holiday = holidays.find((h) => {
		const date = toDate(h.date).toDateString();
		return date === target;
	});
	if (holiday?.type === holidayTypes.HOLIDAY) {
		return { type: holiday.type, time: holiday.startTime || "" };
	}
	return { type: holiday?.name || "", time: holiday?.startTime || "" };
};

const generateDates = ({
	startDate,
	holidays,
	forPayroll = false,
	weekendJobDates,
	weekendWorks,
}: {
	startDate: Date;
	weekendJobDates: Date[];
	holidays: IHolidayConfiguration[] | undefined;
	forPayroll?: boolean;
	weekendWorks: IGetWeekendWorksResponse["data"];
	isSaturdayWorking?: boolean;
	isSundayWorking?: boolean;
}) => {
	if (forPayroll) {
		const endDate = addDays(startDate, 6);

		let i = 0;
		const dates = [];
		while (startDate <= endDate && i < 7) {
			const date = toDate(startDate);
			date.setHours(0, 0, 0, 0);
			const { type, time } = getHolidayAndSpecialDay(date, holidays);
			const dayData = { date, type, time };
			if (
				date.getDay() === 6 &&
				(weekendJobDates?.some((d) => isSameDate(d, date)) ||
					weekendWorks?.some((ww) => isSameDate(ww.date, date) && !!ww.userWeekendWorks?.length))
			) {
				dates.push(dayData);
			} else if (
				date.getDay() === 0 &&
				(weekendJobDates?.some((d) => isSameDate(d, date)) ||
					weekendWorks?.some((ww) => isSameDate(ww.date, date) && !!ww.userWeekendWorks?.length))
			) {
				dates.push(dayData);
			} else if (date.getDay() > 0 && date.getDay() < 6) {
				dates.push(dayData);
			}
			startDate = addDays(startDate, 1);
			i++;
		}
		return dates;
	}

	const dates = [];
	let i = 0;
	while (dates.length < 7) {
		const nextDate = new Date(startDate);
		nextDate.setDate(startDate.getDate() + i);
		nextDate.setHours(0, 0, 0, 0);
		const { type, time } = getHolidayAndSpecialDay(nextDate, holidays);
		const dayData = { date: nextDate, type, time };
		if (
			nextDate.getDay() === 6 &&
			(weekendJobDates?.some((d) => isSameDate(d, nextDate)) ||
				weekendWorks?.some((ww) => isSameDate(ww.date, nextDate) && !!ww.userWeekendWorks?.length))
		) {
			dates.push(dayData);
		} else if (
			nextDate.getDay() === 0 &&
			(weekendJobDates?.some((d) => isSameDate(d, nextDate)) ||
				weekendWorks?.some((ww) => isSameDate(ww.date, nextDate) && !!ww.userWeekendWorks?.length))
		) {
			dates.push(dayData);
		} else if (nextDate.getDay() > 0 && nextDate.getDay() < 6) {
			dates.push(dayData);
		}
		i++;
	}
	return dates;
};

const getWeekRange = (startDate: Date, endDate: Date) => {
	const start = format(new Date(startDate), "d MMM");
	const end = format(new Date(endDate), "d MMM");

	return `${start} - ${end}`;
};

const getWeekStartAndEndForDate = (date: Date) => {
	const d = new Date(date);

	// Copy date so we don’t mutate the input
	const day = d.getDay(); // Sunday = 0, Monday = 1, ..., Saturday = 6

	// Adjust so Monday is start of the week
	const diffToMonday = (day === 0 ? -6 : 1) - day;

	const start = new Date(d);
	start.setDate(d.getDate() + diffToMonday);
	start.setHours(0, 0, 0, 0);

	const end = new Date(start);
	end.setDate(start.getDate() + 6);
	end.setHours(23, 59, 59, 999);

	return { start, end };
};

export { generateDates, getWeekRange, getWeekStartAndEndForDate };
