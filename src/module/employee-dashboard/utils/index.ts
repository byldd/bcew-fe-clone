import { WeekdayAbbreviation } from "./enums";
import { openErrorToast } from "@/components/toast";
import { IEmployeeDayTime } from "@/module/schedule-management/weekly-schedule-management/types/schedule-interface";
import { getTodayDate, toDate } from "@/lib/utils/date";
import { EOD_GPS_BUFFER_MINUTES } from "@/utils/constants";
import {
	E_WEEKEND_WORK_ADMIN_STATUS,
	E_WEEKEND_WORK_USER_STATUS,
} from "@/module/schedule-management/schedule-configuration/types/schedule-config";
import { E_WEEKEND_WORKING_MODE } from "@/module/schedule-management/weekly-schedule-management/types/schedule-configuration";
import { IGetUserWeekendWorkResponse } from "../types/weekend-work";

const generateWeek = (date: string | undefined, startOffset = 0): Date[] => {
	const week: Date[] = [];
	const current = toDate(date || getTodayDate());

	current.setDate(current.getDate() + startOffset);

	while (week.length < 7) {
		const dateObj = toDate(new Date(current));
		week.push(dateObj);
		current.setDate(current.getDate() + 1);
	}

	return week;
};

const getDayOfMonth = (date: Date): string => {
	return String(date.getDate());
};

const formatTime = (totalSeconds: number) => {
	const hours = Math.floor(totalSeconds / 3600);
	const minutes = Math.floor((totalSeconds % 3600) / 60);
	const seconds = totalSeconds % 60;

	return [hours, minutes, seconds].map((unit) => String(unit).padStart(2, "0")).join(":");
};

const formatToLocalISO = (date: Date | undefined): string => {
	if (!date) return "";
	const pad = (num: number) => num.toString().padStart(2, "0");
	const year = date.getFullYear();
	const month = pad(date.getMonth() + 1);
	const day = pad(date.getDate());
	const hours = pad(date.getHours());
	const minutes = pad(date.getMinutes());
	const seconds = pad(date.getSeconds());
	return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.000Z`;
};

const customWeekFilter = (day: { label: string }, data?: { isSaturdayWorking?: boolean; isSundayWorking?: boolean }) =>
	!(day.label === WeekdayAbbreviation.SATURDAY && !data?.isSaturdayWorking) &&
	!(day.label === WeekdayAbbreviation.SUNDAY && !data?.isSundayWorking);

const checkTimeOverlap = (
	overrideStartTime: string,
	overrideEndTime: string,
	rosterStart: Date,
	rosterEnd: Date
): boolean => {
	const timeToMinutes = (time: string): number => {
		const [h = "0", m = "0"] = time.split(":");
		return Number(h) * 60 + Number(m);
	};

	//  Used UTC hours/minutes (consistent everywhere)
	const dateToMinutes = (date: Date): number => {
		return date.getUTCHours() * 60 + date.getUTCMinutes();
	};

	const overrideStartMinutes = timeToMinutes(overrideStartTime);
	const overrideEndMinutes = timeToMinutes(overrideEndTime);

	const rosterStartMinutes = dateToMinutes(rosterStart);
	const rosterEndMinutes = dateToMinutes(rosterEnd);

	const isStartWithin = overrideStartMinutes >= rosterStartMinutes;
	const isEndWithin = overrideEndMinutes <= rosterEndMinutes;

	return isStartWithin && isEndWithin;
};

const getAttendanceReasonContext = (
	rosterStart: string | undefined,
	rosterEnd: string | undefined,
	enteredStart: string,
	enteredEnd: string
): { isLateStart: boolean; isEarlyQuit: boolean } => {
	if (!rosterStart || !rosterEnd || !enteredStart || !enteredEnd) {
		return { isLateStart: false, isEarlyQuit: false };
	}

	const toMinutesUTC = (date: string | Date): number => {
		const d = new Date(date);
		return d.getUTCHours() * 60 + d.getUTCMinutes();
	};

	const rosterStartMinutes = toMinutesUTC(rosterStart);
	const rosterEndMinutes = toMinutesUTC(rosterEnd);
	const enteredStartMinutes = toMinutesUTC(enteredStart);
	const enteredEndMinutes = toMinutesUTC(enteredEnd);

	return {
		isLateStart: enteredStartMinutes > rosterStartMinutes,
		isEarlyQuit: enteredEndMinutes < rosterEndMinutes,
	};
};

const validateRosterTime = (
	rosterTime: { dayStartTime: string | Date | undefined; dayEndTime: string | Date | undefined } | undefined,
	overrideStartTime: string,
	overrideEndTime: string,
	isSelfSchedule?: boolean
) => {
	if (!rosterTime?.dayStartTime || !rosterTime?.dayEndTime) {
		openErrorToast({
			message: "No work schedule found for today. Please contact your manager.",
		});
		return false;
	}

	const rosterStart = new Date(rosterTime.dayStartTime);
	const rosterEnd = new Date(rosterTime.dayEndTime);

	if (checkTimeOverlap(overrideStartTime, overrideEndTime, rosterStart, rosterEnd)) {
		return true;
	} else if (!isSelfSchedule) {
		//  Format in US-style, locked to UTC
		const formatTime = (d: Date) =>
			d.toLocaleTimeString("en-US", {
				hour: "numeric",
				minute: "2-digit",
				timeZone: "UTC",
			});

		const rosterWindow = `${formatTime(rosterStart)} to ${formatTime(rosterEnd)}`;
		openErrorToast({
			message: `Invalid time entry.Your scheduled time is ${rosterWindow}`,
		});
		return false;
	}

	return true;
};

const checkGPSTimeMatch = (
	overrideStartTime: string | null,
	overrideEndTime: string | null,
	rosterStart: Date,
	rosterEnd: Date
): boolean => {
	if (!overrideStartTime || !overrideEndTime) return false;
	const timeToMinutes = (time: string): number => {
		const [timePart, modifier] = time.split(" ");
		if (!timePart) return 0;

		const [h, m] = timePart.split(":");

		let hours = Number(h);
		const minutes = Number(m);

		if (modifier === "PM" && hours !== 12) {
			hours += 12;
		}
		if (modifier === "AM" && hours === 12) {
			hours = 0;
		}

		return hours * 60 + minutes;
	};

	const dateToMinutes = (date: Date): number => {
		return date.getUTCHours() * 60 + date.getUTCMinutes();
	};

	const overrideStartMinutes = timeToMinutes(overrideStartTime);
	const overrideEndMinutes = timeToMinutes(overrideEndTime);

	const rosterStartMinutes = dateToMinutes(rosterStart);
	const rosterEndMinutes = dateToMinutes(rosterEnd);

	const isStartWithin = Math.abs(rosterStartMinutes - overrideStartMinutes) <= EOD_GPS_BUFFER_MINUTES;
	const isEndWithin = Math.abs(rosterEndMinutes - overrideEndMinutes) <= EOD_GPS_BUFFER_MINUTES;
	return isStartWithin && isEndWithin;
};

const checkRosterTimeMatch = (
	overrideStartTime: string | null,
	overrideEndTime: string | null,
	rosterStart: Date,
	rosterEnd: Date
): boolean => {
	if (!overrideStartTime || !overrideEndTime) return false;
	const timeToMinutes = (time: string): number => {
		const [timePart, modifier] = time.split(" ");
		if (!timePart) return 0;

		const [h, m] = timePart.split(":");

		let hours = Number(h);
		const minutes = Number(m);

		if (modifier === "PM" && hours !== 12) {
			hours += 12;
		}
		if (modifier === "AM" && hours === 12) {
			hours = 0;
		}

		return hours * 60 + minutes;
	};

	const dateToMinutes = (date: Date): number => {
		return toDate(date).getHours() * 60 + toDate(date).getMinutes();
	};

	const overrideStartMinutes = timeToMinutes(overrideStartTime);
	const overrideEndMinutes = timeToMinutes(overrideEndTime);
	const rosterStartMinutes = dateToMinutes(rosterStart);
	const rosterEndMinutes = dateToMinutes(rosterEnd);
	const isStartWithin = Math.abs(rosterStartMinutes - overrideStartMinutes) <= EOD_GPS_BUFFER_MINUTES;
	const isEndWithin = Math.abs(rosterEndMinutes - overrideEndMinutes) <= EOD_GPS_BUFFER_MINUTES;
	return isStartWithin && isEndWithin;
};

const validateEODSubmission = (
	eodNote: string,
	overrideStartTime: string,
	overrideEndTime: string,
	rosterTime: { dayStartTime: string | undefined; dayEndTime: string | undefined } | undefined
) => {
	if (!rosterTime || !rosterTime?.dayStartTime || !rosterTime?.dayEndTime) {
		openErrorToast({
			message: "No work schedule found for today. Please contact your manager.",
		});
		return true;
	}
	const rosterStart = new Date(rosterTime.dayStartTime);
	const rosterEnd = new Date(rosterTime.dayEndTime);

	const formatTime = (d: Date) =>
		d.toLocaleTimeString("en-US", {
			hour: "numeric",
			minute: "2-digit",
			timeZone: "UTC",
		});

	const rosterWindow = `${formatTime(rosterStart)} to ${formatTime(rosterEnd)}`;
	if (overrideStartTime > overrideEndTime) {
		openErrorToast({
			message: `Start time can not be greater than end time.Your scheduled time is ${rosterWindow}`,
		});
		return true;
	}

	if (!checkGPSTimeMatch(overrideStartTime, overrideEndTime, rosterStart, rosterEnd) && !eodNote) {
		openErrorToast({
			message: `Please provide early/late logout reason.Your scheduled time is ${rosterWindow}`,
		});
		return true;
	}
};

const calculateHoursFromDateRange = (
	dayStartTime: string | undefined | null,
	dayEndTime: string | undefined | null
): string => {
	if (!dayStartTime || !dayEndTime) return "0 hrs 00 mins";

	const start = toDate(dayStartTime);
	const end = toDate(dayEndTime);

	if (end <= start) return "0 hrs 00 mins";

	let diff = end.getTime() - start.getTime();

	// ---- Lunch Break time (12:00 PM - 12:30 PM) to remove
	const baseDate = toDate(start);

	const breakStart = new Date(baseDate);
	breakStart.setHours(12, 0, 0, 0);

	const breakEnd = new Date(baseDate);
	breakEnd.setHours(12, 30, 0, 0);

	const overlapStart = Math.max(start.getTime(), breakStart.getTime());
	const overlapEnd = Math.min(end.getTime(), breakEnd.getTime());

	let breakDeduction = 0;

	if (overlapEnd > overlapStart) {
		breakDeduction = overlapEnd - overlapStart;
	}

	diff -= breakDeduction;

	const hours = Math.floor(diff / (1000 * 60 * 60));
	const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

	return `${hours} hrs ${minutes.toString().padStart(2, "0")} mins`;
};

const getTimeFromISOString = (isoString: string | undefined): number => {
	if (!isoString) return 0;

	const timePart = isoString.split("T")[1]?.split("Z")[0];
	if (!timePart) return 0;

	const [hms, msPart] = timePart.split(".");
	if (!hms) return 0;

	const parts = hms.split(":").map((p) => Number(p));
	const hours = parts[0] ?? 0;
	const minutes = parts[1] ?? 0;
	const seconds = parts[2] ?? 0;
	const milliseconds = msPart ? parseInt(msPart, 10) : 0;

	const now = new Date();
	now.setHours(hours, minutes, seconds, milliseconds);

	return now.getTime();
};

const calculatePausedDuration = (pauseTimes: IEmployeeDayTime["employeePauseTime"] = []) => {
	return pauseTimes.reduce((total, pause) => {
		const startTime = toDate(pause.pauseStartTime).getTime();
		const end = toDate(pause.pauseEndTime);
		let endTime;
		if (end) {
			endTime = end.getTime();
		} else {
			endTime = toDate(new Date()).getTime();
		}
		if (!isNaN(startTime) && !isNaN(endTime) && endTime - startTime > 0) total += Math.max(0, endTime - startTime);
		return total;
	}, 0);
};

const getTodayReminderPhase = () => {
	const day = toDate(new Date()).getDay();

	if (day === 1) return "MON";
	if (day === 4) return "THU";
	if (day === 5) return "FRI";

	return null;
};

const isDateMatch = (a: string | null | undefined, b: Date): boolean => {
	if (!a) return false;

	const d1 = new Date(a);
	const d2 = new Date(b);

	return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
};

const getWeekendStatusLabel = (weekendWork: IGetUserWeekendWorkResponse[number]) => {
	const { userWeekendWork, isCapacityReached } = weekendWork;
	const { adminStatus, userStatus, mode } = userWeekendWork || {};

	if (!userWeekendWork) {
		return {
			label: "Not Working",
		};
	}

	if (mode === E_WEEKEND_WORKING_MODE.MANDATORY) {
		return {
			label: "Working Mandatory",
		};
	}

	if (mode === E_WEEKEND_WORKING_MODE.NOT_WORKING) {
		return {
			label: "",
		};
	}

	if (adminStatus === E_WEEKEND_WORK_ADMIN_STATUS.APPROVED) {
		return {
			label: "Approved",
		};
	}

	if (adminStatus === E_WEEKEND_WORK_ADMIN_STATUS.DECLINED) {
		return {
			label: "Admin Declined",
		};
	}

	if (isCapacityReached && userStatus != E_WEEKEND_WORK_USER_STATUS.APPROVED) {
		return {
			label: "Capacity Reached",
		};
	}

	if (userStatus === E_WEEKEND_WORK_USER_STATUS.OPT_OUT) {
		return {
			label: "Opted Out",
		};
	}

	if (userStatus === E_WEEKEND_WORK_USER_STATUS.DECLINED) {
		return {
			label: "Declined",
		};
	}

	if (userStatus === E_WEEKEND_WORK_USER_STATUS.APPROVED) {
		return {
			label: "Awaiting Confirmation",
		};
	}

	return {
		label: "Pending",
	};
};

export {
	generateWeek,
	getDayOfMonth,
	formatTime,
	formatToLocalISO,
	customWeekFilter,
	checkTimeOverlap,
	getAttendanceReasonContext,
	validateRosterTime,
	validateEODSubmission,
	checkGPSTimeMatch,
	calculateHoursFromDateRange,
	getTimeFromISOString,
	calculatePausedDuration,
	getTodayReminderPhase,
	isDateMatch,
	checkRosterTimeMatch,
	getWeekendStatusLabel,
};
