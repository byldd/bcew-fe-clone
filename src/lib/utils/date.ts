import { DATE_FORMAT } from "@/types/date";
import { DATE_CHECK_FROM, TIMEZONE, WEEK_DAY_NUMBERS } from "@/utils/enums";
import { differenceInMinutes, format, formatDate, intervalToDuration } from "date-fns";
import { fromZonedTime, toZonedTime } from "date-fns-tz";
/**
 * Below function is used to set the time of a date
 * @param date - The date to set the time for
 * @param time - The time to set in the format of "HH:MM"
 */
export const setTime = (date: Date | string, time: string) => {
	const dateToSet = typeof date === "string" ? toDate(date) : date;

	const [hours, minutes] = time.split(":");
	dateToSet.setHours(Number(hours), Number(minutes), 0, 0);
	return dateToSet;
};

export const getTodayDate = () => {
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	return today;
};

export const getMonthsSinceDate = (joiningDate: string | Date | null): number | null => {
	if (!joiningDate) return null;

	const start = new Date(joiningDate);
	const now = new Date();

	const diffTime = now.getTime() - start.getTime();
	const months = diffTime / (1000 * 60 * 60 * 24 * 30.4375); // Average month length
	return parseFloat(months.toFixed(1));
};

export const getYearsSinceDate = (joiningDate: string | Date | null): number | null => {
	const months = getMonthsSinceDate(joiningDate);
	return months !== null ? parseFloat((months / 12).toFixed(1)) : null;
};

export const isPastDate = (date: string | Date, checkFrom: DATE_CHECK_FROM = DATE_CHECK_FROM.TODAY) => {
	const dateObj = new Date(date);
	if (checkFrom === DATE_CHECK_FROM.TODAY) {
		const today = getTodayDate();
		return dateObj < today;
	}
	return dateObj < new Date();
};

export const toMidnightDateString = (date: Date | string) => {
	const dateObj = toDate(date);
	dateObj.setHours(0, 0, 0, 0);
	return `${format(dateObj, "yyyy-MM-dd")}T00:00:00Z`;
};

export const getHourDifference = (startUTC: string | Date, endUTC: string | Date) => {
	const start = new Date(startUTC);
	const end = new Date(endUTC);

	let diffMs = end.getTime() - start.getTime();
	if (diffMs < 0) {
		diffMs += 24 * 60 * 60 * 1000;
	}

	const hours = Math.floor(diffMs / (1000 * 60 * 60));
	const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

	return parseFloat(`${hours}.${minutes.toString().padStart(2, "0")}`);
};

export const getTimeString = (date: Date | string) => {
	if (typeof date === "string") {
		return date.slice(11, 16);
	}
	return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
};

export function isSameDate(date1: Date | string, date2: Date | string) {
	const parseDate = (input: Date | string) => {
		if (input instanceof Date) {
			return input;
		}
		return new Date(input);
	};

	const parsedDate1 = parseDate(date1);
	const parsedDate2 = parseDate(date2);

	if (isNaN(parsedDate1.getTime()) || isNaN(parsedDate2.getTime())) {
		throw new Error("Invalid date(s) provided");
	}

	// Extract the date parts from each date as they appear in their original context
	// This preserves the "intended" date regardless of UTC conversion

	const extractDateParts = (input: Date | string, parsedDate: Date) => {
		if (typeof input === "string") {
			// For ISO strings ending with Z, use UTC parts
			if (input.includes("T") && input.endsWith("Z")) {
				return {
					year: parsedDate.getUTCFullYear(),
					month: parsedDate.getUTCMonth(),
					date: parsedDate.getUTCDate(),
				};
			}

			// For timezone-aware strings, the "intended" date is what's shown before timezone conversion
			if (input.includes("GMT") || input.includes("UTC")) {
				// Parse the date string to extract the intended date parts
				const match = input.match(/(\w+)\s+(\w+)\s+(\d+)\s+(\d+)/);
				if (match) {
					const [, , monthName, date, year] = match;
					const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
					const monthIndex = monthNames.indexOf(monthName || "");
					if (monthIndex !== -1) {
						return {
							year: parseInt(year || ""),
							month: monthIndex,
							date: parseInt(date || ""),
						};
					}
				}
			}
		}

		// Fallback to local date parts
		return {
			year: parsedDate.getFullYear(),
			month: parsedDate.getMonth(),
			date: parsedDate.getDate(),
		};
	};

	const parts1 = extractDateParts(date1, parsedDate1);
	const parts2 = extractDateParts(date2, parsedDate2);

	return parts1.year === parts2.year && parts1.month === parts2.month && parts1.date === parts2.date;
}

const toDate = (date: Date | string) => {
	if (typeof date !== "string") {
		return date;
	}
	// Parse the UTC string to extract components

	const utcDate = new Date(date);
	if (isNaN(utcDate.getTime())) {
		throw new Error("Invalid date string");
	}

	// Extract UTC components
	const year = utcDate.getUTCFullYear();
	const month = utcDate.getUTCMonth();
	const datePart = utcDate.getUTCDate();
	const hours = utcDate.getUTCHours();
	const minutes = utcDate.getUTCMinutes();
	const seconds = utcDate.getUTCSeconds();
	const milliseconds = utcDate.getUTCMilliseconds();

	return new Date(year, month, datePart, hours, minutes, seconds, milliseconds);
};

const toFormattedDate = (date: Date | string, format: DATE_FORMAT = DATE_FORMAT.MM_SLASH_DD_YYYY) => {
	let dateToFormat = date;
	if (typeof date === "string") {
		dateToFormat = toDate(date);
	}

	return formatDate(dateToFormat, format);
};

export const toLocalFormattedDate = (date: Date | string, format: DATE_FORMAT = DATE_FORMAT.MM_SLASH_DD_YYYY) => {
	let dateToFormat: Date;

	if (typeof date === "string") {
		const parsed = new Date(date);
		if (isNaN(parsed.getTime())) {
			throw new Error("Invalid date string");
		}
		dateToFormat = parsed;
	} else {
		dateToFormat = date;
	}

	return formatDate(dateToFormat, format);
};

const dateToUTCString = (date: Date | string) => {
	let dateToConvert = date;
	if (typeof date === "string") {
		dateToConvert = toDate(date);
	}
	const formattedDate = `${toFormattedDate(dateToConvert, DATE_FORMAT.YYYY_MM_DD)}T${toFormattedDate(dateToConvert, DATE_FORMAT.HH_MM_SS)}.000Z`;
	return formattedDate;
};

const getDifferenceInMinutes = (start: Date | string, end: Date | string) => {
	const startDate = toDate(start);
	const endDate = toDate(end);
	return differenceInMinutes(endDate, startDate);
};

const getDifferenceInHours = (start: Date | string, end: Date | string) => {
	const startDate = toDate(start);
	const endDate = toDate(end);

	const diffMs = endDate.getTime() - startDate.getTime(); // difference in milliseconds
	const diffMinutes = diffMs / (1000 * 60);

	// Round minutes to nearest 15 just in case (safety)
	const totalMinutes = Math.round(diffMinutes / 15) * 15;
	const hours = Math.floor(totalMinutes / 60);
	const minutes = totalMinutes % 60;

	const decimalPart = minutes / 60; // convert minutes to decimal
	const result = hours + decimalPart;

	// Ensure result is in 0.25 increments (optional safety)
	return Math.round(result * 4) / 4;
};

const deductMinutesFromDate = (date: Date | string, minutes: number) => {
	const dateToDeduct = toDate(date);
	return new Date(dateToDeduct.getTime() - minutes * 60000);
};

const roundToNearest15Minutes = (date: Date | string) => {
	const dateToRound = toDate(date);
	return new Date(Math.round(dateToRound.getTime() / 900000) * 900000);
};

const getMinutesFromDate = (date: Date | string) => {
	const dateToGet = toDate(date);
	return dateToGet.getHours() * 60 + dateToGet.getMinutes();
};

const convertToISODate = (dateStr: string): string => {
	const [month, day, year] = dateStr.split("/");
	return `${year}-${month}-${day}T12:00:00.000Z`;
};

const isInTimerange = ({
	range,
	timeToCheck,
}: {
	range: { start: Date; end: Date };
	timeToCheck: { start: Date; end: Date };
}) => {
	timeToCheck.start = ignoreMillisecondsAndSeconds(timeToCheck.start);
	timeToCheck.end = ignoreMillisecondsAndSeconds(timeToCheck.end);
	range.start = ignoreMillisecondsAndSeconds(range.start);
	range.end = ignoreMillisecondsAndSeconds(range.end);
	return timeToCheck.start >= range.start && timeToCheck.end <= range.end;
};

const ignoreMillisecondsAndSeconds = (date: Date): Date => {
	const newDate = new Date(date);
	newDate.setMilliseconds(0);
	newDate.setSeconds(0);
	return newDate;
};

import { startOfDay, addDays } from "date-fns";

const getBcewWeekRange = (date?: Date | string) => {
	const dateToCheck = startOfDay(date ? toDate(date) : getTodayDate());

	// JS: Sunday = 0, Saturday = 6
	const day = dateToCheck.getDay();

	// Calculate how many days to go back to reach Saturday
	const diffToSaturday = (day + 1) % 7;

	const weekStart = addDays(dateToCheck, -diffToSaturday);
	const weekEnd = addDays(weekStart, 6); // Friday

	return {
		weekStart,
		weekEnd,
	};
};

const minutesToHours = (minutes: number) => {
	const hours = Math.floor(minutes / 60);
	const remainingMinutes = minutes % 60;

	return `${hours > 0 ? `${hours} hrs` : ""} ${remainingMinutes > 0 ? `${remainingMinutes}` : "00"} min`;
};
const isTimeBefore = (time1: string | Date | undefined, time2: string | Date | undefined) => {
	if (!time1 || !time2) {
		return false;
	}
	const t1 = toDate(time1);
	const t2 = toDate(time2);

	return t1.getTime() < t2.getTime();
};

const isSameTime = (time1: string | Date | undefined, time2: string | Date | undefined) => {
	if (!time1 || !time2) {
		return false;
	}
	const t1 = toDate(time1);
	const t2 = toDate(time2);

	return t1.getTime() === t2.getTime();
};

const isATimeWithinRange = (
	range: { startTime: Date | undefined; endTime: Date | undefined },
	timeToCheck: Date
): boolean => {
	if (!range.startTime || !range.endTime) return false;

	return timeToCheck.getTime() >= range.startTime.getTime() && timeToCheck.getTime() <= range.endTime.getTime();
};

const formatTicksToDuration = (ticks: number | null | undefined) => {
	if (!ticks) {
		return "0H 0min";
	}
	// 1. Convert .NET ticks to milliseconds (1 ms = 10,000 ticks)
	const milliseconds = Math.floor(ticks / 10000);

	// 2. Extract the structured duration elements via date-fns
	const duration = intervalToDuration({ start: 0, end: milliseconds });

	// 3. Fallback undefined values to 0 and format the string output
	const hours = duration.hours || 0;
	const minutes = duration.minutes || 0;

	return `${hours}H ${minutes}min`;
};

const changeTimeZone = ({
	fromTimeZone,
	toTimeZone,
	date,
}: {
	fromTimeZone: TIMEZONE;
	toTimeZone: TIMEZONE;
	date: Date | string;
}) => {
	const parsedDate = toDate(date);

	// Convert source timezone -> UTC
	const utcDate = fromZonedTime(parsedDate, fromTimeZone);

	// Convert UTC -> target timezone
	const targetDate = toZonedTime(utcDate, toTimeZone);

	return targetDate;
};

const isWeekendDate = (date: Date | string) => {
	return toDate(date).getDay() === WEEK_DAY_NUMBERS.SUNDAY || toDate(date).getDay() === WEEK_DAY_NUMBERS.SATURDAY;
};

export {
	changeTimeZone,
	toDate,
	toFormattedDate,
	dateToUTCString,
	getDifferenceInMinutes,
	getDifferenceInHours,
	deductMinutesFromDate,
	roundToNearest15Minutes,
	getMinutesFromDate,
	convertToISODate,
	isInTimerange,
	getBcewWeekRange,
	minutesToHours,
	isTimeBefore,
	isSameTime,
	isATimeWithinRange,
	formatTicksToDuration,
	isWeekendDate,
};
