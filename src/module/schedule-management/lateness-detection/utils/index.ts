import { toFormattedDate, toDate } from "@/lib/utils/date";
import { DATE_FORMAT } from "@/types/date";

export const getTimeDifference = (start: string | Date, end: string | Date) => {
	const a = new Date(start).getTime();
	const b = new Date(end).getTime();
	const diffMins = Math.round((a - b) / 60000);
	return diffMins;
};

export const timeDifference = (actualTime: string | Date | null, rosterTime: string | Date | null) => {
	if (actualTime && rosterTime) {
		const timeDiff = getTimeDifference(actualTime, rosterTime);
		return timeDiff >= 0 ? `+${timeDiff} mins` : `${timeDiff} mins`;
	}
	return "-";
};

export const timeDifferenceInHoursAndMinutes = (actualTime: string | Date | null, rosterTime: string | Date | null) => {
	if (!actualTime || !rosterTime) return "-";

	const totalMinutes = getTimeDifference(actualTime, rosterTime);

	const absMinutes = Math.abs(totalMinutes);

	const hours = Math.floor(absMinutes / 60);
	const minutes = absMinutes % 60;

	if (hours === 0) {
		return `${minutes}-minute`;
	}

	if (minutes === 0) {
		return `${hours}-hour`;
	}

	return `${hours}-hour ${minutes}-minute`;
};

export const getAdjustedHours = (loggedTime: string | Date) => {
	const date = typeof loggedTime === "string" ? toDate(loggedTime) : loggedTime;

	const hours = date.getHours();
	const minutes = date.getMinutes();

	let adjustedMinutes;

	if (minutes <= 7) adjustedMinutes = 0;
	else if (minutes <= 22) adjustedMinutes = 15;
	else if (minutes <= 37) adjustedMinutes = 30;
	else if (minutes <= 52) adjustedMinutes = 45;
	else {
		adjustedMinutes = 0;
		date.setHours(hours + 1);
	}

	date.setMinutes(adjustedMinutes);
	date.setSeconds(0);
	date.setMilliseconds(0);

	return toFormattedDate(date, DATE_FORMAT.HH_MM_AA_PM);
};
