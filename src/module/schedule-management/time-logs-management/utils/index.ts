import { parseISO } from "date-fns";
import {
	IEmployeeDayTime,
	IEmployeePauseTime,
	ITimes,
} from "../../weekly-schedule-management/types/schedule-interface";
import { dateToUTCString, getTimeString, setTime } from "@/lib/utils/date";
import { extendedTimeType } from "@/module/job/utils/enums";
import { UTCtoESTHoursDifference } from "./constants";
import { IStopDetail } from "../types";
import { IRoster } from "../../roster-time-configuration/types";

export const extractUTCDayAndTime = (date: Date | string | null | undefined) => {
	if (!date) return;
	if (typeof date !== "string") {
		date = dateToUTCString(date);
	}

	const timePart = date.split("T")[1]?.replace("Z", "");
	if (!timePart) return;

	const [hour, minute] = timePart.split(":") as [string, string, ...string[]];

	let hr = parseInt(hour, 10);
	const meridiem = hr >= 12 ? "PM" : "AM";
	hr = hr % 12 || 12;

	return `${hr}:${minute} ${meridiem}`;
};

export const extractTimeForInput = (date: Date | string | null | undefined): string => {
	if (!date) return "";
	const d = new Date(date);
	const hours = d.getUTCHours().toString().padStart(2, "0");
	const minutes = d.getUTCMinutes().toString().padStart(2, "0");
	return `${hours}:${minutes}`;
};

export const formatDateToMMDDYYYY = (dateString: Date | string | undefined) => {
	if (!dateString) {
		return;
	}
	const date = new Date(dateString);
	const day = String(date.getDate()).padStart(2, "0");
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const year = date.getFullYear();
	return `${month}/${day}/${year}`;
};

export const getOrdinalSuffix = (day: number) => {
	const j = day % 10,
		k = day % 100;
	if (j === 1 && k !== 11) return "st";
	if (j === 2 && k !== 12) return "nd";
	if (j === 3 && k !== 13) return "rd";
	return "th";
};

export const getDatePart = (dateStr: Date | string | undefined) => {
	if (!dateStr) return;

	const date = typeof dateStr === "string" ? parseISO(dateStr) : dateStr;
	return date.toISOString().substring(0, 10);
};

export const extractUTCTime = (date: Date | string | null | undefined) => {
	if (!date) return;
	if (typeof date !== "string") {
		date = date.toISOString();
	}

	const timePart = date.split("T")[1]?.replace("Z", "");
	if (!timePart) return;

	const [hour, minute] = timePart.split(":") as [string, string, ...string[]];

	const hr = parseInt(hour, 10);

	return `${hr}:${minute}`;
};

export const formatDecimalHours = (decimalHours: number | undefined): string => {
	if (!decimalHours || decimalHours < 0) return "0 hrs 0 mins";

	const hours = Math.floor(decimalHours);
	const minutes = Math.round((decimalHours - hours) * 60);

	return `${hours} hrs ${minutes} mins`;
};

export const calculatePauseHours = (employeePauseTimes: IEmployeePauseTime[]) => {
	let totalMinutes = 0;

	for (let index = 0; index < employeePauseTimes.length; index++) {
		const { pauseStartTime, pauseEndTime } = employeePauseTimes[index] || {};

		if (pauseStartTime && pauseEndTime) {
			const diffMs = new Date(pauseEndTime).getTime() - new Date(pauseStartTime).getTime();
			const diffMinutes = Math.floor(diffMs / (1000 * 60));
			totalMinutes += diffMinutes;
		}
	}

	const hours = Math.floor(totalMinutes / 60);
	const minutes = totalMinutes % 60;

	if (hours > 0 && minutes > 0) {
		return `${hours}h ${minutes}m`;
	} else if (hours > 0) {
		return `${hours} hr`;
	} else {
		return `${minutes} min`;
	}
};

export const calculateOvertimeHours = (overTimeHours: number | undefined, overTimeMinutes: number | undefined) => {
	const hours = overTimeHours ?? 0;
	const minutes = overTimeMinutes ?? 0;

	if (hours > 0 && minutes > 0) {
		return `${hours}h ${minutes}m`;
	} else if (hours > 0) {
		return `${hours} hr`;
	} else {
		return `${minutes} min`;
	}
};

export const getPaddedUTCTime = (date: Date | string | null | undefined) => {
	if (!date) return;
	if (typeof date !== "string") {
		date = date.toISOString();
	}

	const timePart = date.split("T")[1]?.replace("Z", "");
	if (!timePart) return;

	const [hour, minute] = timePart.split(":") as [string, string, ...string[]];

	const hr = parseInt(hour, 10);

	// Zero-pad hour and minute
	const paddedHour = hr.toString().padStart(2, "0");
	const paddedMinute = minute.padStart(2, "0");

	return `${paddedHour}:${paddedMinute}`;
};

export const calculateHoursFromTimes = (times: ITimes) => {
	let totalMinutes = 0;

	const { startTime, endTime } = times || {};

	if (startTime && endTime) {
		const diffMs = new Date(endTime).getTime() - new Date(startTime).getTime();
		const diffMinutes = Math.floor(diffMs / (1000 * 60));
		totalMinutes += diffMinutes;
	}

	const hours = Math.floor(totalMinutes / 60);
	const minutes = totalMinutes % 60;

	if (hours > 0 && minutes > 0) {
		return `${hours}h ${minutes}m`;
	} else if (hours > 0) {
		return `${hours} hr`;
	} else {
		return `${minutes} min`;
	}
};

export const calculateExtendedMinutes = (selectedDate: string, rosterDate: Date, type: string): number => {
	const selectedTime = getTimeString(selectedDate);
	const rosterTimeStr = getTimeString(rosterDate);

	if (!rosterTimeStr || !selectedTime) return 0;

	const [rosterHours = 0, rosterMinutes = 0] = rosterTimeStr.split(":").map(Number);
	const [selectedHours = 0, selectedMinutes = 0] = selectedTime.split(":").map(Number);

	const rosterTotalMinutes = rosterHours * 60 + rosterMinutes;
	const selectedTotalMinutes = selectedHours * 60 + selectedMinutes;

	const diffMinutes =
		type === extendedTimeType.EARLY_START
			? rosterTotalMinutes - selectedTotalMinutes
			: selectedTotalMinutes - rosterTotalMinutes;

	return Math.max(diffMinutes, 0);
};

export const calculateTotalExtendedHours = (rosterTimes: IRoster) => {
	const { isTimeOverridden, dayStartTime, dayEndTime, extendedApprovedStartTime, extendedApprovedEndTime, date } =
		rosterTimes;
	if (!isTimeOverridden) return "--";

	let totalMinutes = 0;

	if (extendedApprovedStartTime && extendedApprovedEndTime) {
		const rosterStartTime = setTime(date, getTimeString(dayStartTime));
		const rosterEndTime = setTime(date, getTimeString(dayEndTime));

		totalMinutes += calculateExtendedMinutes(extendedApprovedStartTime, rosterStartTime, extendedTimeType.EARLY_START);
		totalMinutes += calculateExtendedMinutes(extendedApprovedEndTime, rosterEndTime, extendedTimeType.LATE_RELEASE);
	}

	if (totalMinutes <= 0) return "--";

	const hours = Math.floor(totalMinutes / 60);
	const minutes = totalMinutes % 60;

	return `${hours} hr ${minutes} min`;
};

export const convertUTCtoEST = (timeStr: string): string | null => {
	const parts = timeStr.split(" ");
	if (parts.length !== 2) return null;

	const [time, modifier] = parts;

	if (!time) return null;

	const timeParts = time.split(":");
	if (timeParts.length !== 2) return null;

	const hours = Number(timeParts[0]);
	const minutes = Number(timeParts[1]);

	if (isNaN(hours) || isNaN(minutes)) return null;
	if (modifier !== "AM" && modifier !== "PM") return null;

	let h24 = hours;
	if (modifier === "PM" && hours !== 12) h24 += 12;
	if (modifier === "AM" && hours === 12) h24 = 0;

	const date = new Date();
	date.setHours(h24, minutes, 0, 0);

	//TODO: Optimize the function to Handle daylight saving using timezone
	date.setHours(date.getHours() - UTCtoESTHoursDifference);

	let newHours = date.getHours();
	const newMinutes = String(date.getMinutes()).padStart(2, "0");
	const newModifier = newHours >= 12 ? "PM" : "AM";

	newHours = newHours % 12;
	if (newHours === 0) newHours = 12;

	return `${newHours}:${newMinutes} ${newModifier}`;
};

export const calculateDayStartEndTimes = (employeeDayTimes: IEmployeeDayTime | null, jobs: IStopDetail[]) => {
	let empDayStartTime: string | undefined;
	let empDayEndTime: string | undefined;

	if (!jobs?.length) {
		return { empDayStartTime: undefined, empDayEndTime: undefined };
	}

	const areAllJobsCompleted = jobs.every(
		(j) => j.didNotWorked || (j.startTime && j.endTime) || (j.overrideStartTime && j.overrideEndTime)
	);

	const validStartTimes = jobs.map((j) => j.overrideStartTime || j.startTime).filter(Boolean) as string[];

	if (validStartTimes.length) {
		empDayStartTime = validStartTimes.reduce((a, b) => (new Date(a).getTime() < new Date(b).getTime() ? a : b));
	}

	if (!areAllJobsCompleted && empDayStartTime) {
		return { empDayStartTime, empDayEndTime: undefined };
	}

	const validEndTimes = jobs.map((j) => j.overrideEndTime || j.endTime).filter(Boolean) as string[];

	if (validEndTimes.length) {
		empDayEndTime = validEndTimes.reduce((a, b) => (new Date(a).getTime() > new Date(b).getTime() ? a : b));
	}

	if (empDayStartTime && empDayEndTime) {
		return { empDayStartTime, empDayEndTime };
	}

	if (employeeDayTimes?.overrideStartTime || employeeDayTimes?.overrideEndTime) {
		return {
			empDayStartTime: employeeDayTimes.overrideStartTime ?? undefined,
			empDayEndTime: employeeDayTimes.overrideEndTime ?? undefined,
		};
	}
	if (employeeDayTimes?.dayStartTime || employeeDayTimes?.dayEndTime) {
		return {
			empDayStartTime: employeeDayTimes.dayStartTime ?? undefined,
			empDayEndTime: employeeDayTimes.dayEndTime ?? undefined,
		};
	}

	return { empDayStartTime, empDayEndTime };
};
