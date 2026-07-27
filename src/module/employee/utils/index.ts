import {
	LUNCH_BREAK_CUTOFF,
	LUNCH_BREAK_DURATION,
} from "@/module/schedule-management/roster-time-configuration/constants";
import { getHoursDifference } from "@/module/schedule-management/roster-time-configuration/utils";
import { IEmployeePauseTime } from "@/module/schedule-management/weekly-schedule-management/types/schedule-interface";
import { addDays, subDays } from "date-fns";
import { ACCESS_LEVEL } from "@/module/employee/enums";
import { IPermissions } from "@/module/employee/types";
import { MODULE } from "@/utils/enums";

export const getWeekRangeForDate = (date: Date) => {
	const day = date.getDay(); // 0=Sun, 6=Sat
	const diffToSaturday = (day + 1) % 7;
	const startDate = subDays(date, diffToSaturday); // Saturday
	const endDate = addDays(startDate, 6); // Friday
	return { startDate, endDate };
};

export const totalHours = (dayStartTime?: Date | string | null, dayEndTime?: Date | string | null): number | null => {
	if (!dayStartTime || !dayEndTime) return null;

	const start = new Date(dayStartTime).getTime();
	const end = new Date(dayEndTime).getTime();

	if (isNaN(start) || isNaN(end) || end < start) return null;

	return (end - start) / (1000 * 60 * 60);
};

type NullableDateInput = Date | string | null | undefined;

// helper to calculate adjusted hours after lunch deduction
export const calculateEffectiveHours = (startTime?: NullableDateInput, endTime?: NullableDateInput) => {
	if (!startTime || !endTime) return 0;

	let hours = getHoursDifference(startTime, endTime);

	// Deduct lunch break if applicable ( Deduct lunch if end time UTC >= 12:15)
	const endUTC = new Date(endTime);
	const endHour = endUTC.getUTCHours();
	const endMinute = endUTC.getUTCMinutes();

	if (
		hours >= LUNCH_BREAK_DURATION &&
		(endHour > LUNCH_BREAK_CUTOFF.hours ||
			(endHour === LUNCH_BREAK_CUTOFF.hours && endMinute >= LUNCH_BREAK_CUTOFF.minutes))
	) {
		hours -= LUNCH_BREAK_DURATION;
	}

	return hours;
};

export const calculateLunchDeductedHours = (startTime?: NullableDateInput, endTime?: NullableDateInput) => {
	if (!startTime || !endTime) return 0;

	const start = new Date(startTime);
	const end = new Date(endTime);

	let hours = getHoursDifference(start, end);

	const lunchStart = new Date(start);
	lunchStart.setUTCHours(12, 0, 0, 0);

	const lunchEnd = new Date(start);
	lunchEnd.setUTCHours(12, 30, 0, 0);

	const overlapStart = Math.max(start.getTime(), lunchStart.getTime());
	const overlapEnd = Math.min(end.getTime(), lunchEnd.getTime());

	if (overlapEnd > overlapStart) {
		const overlapMs = overlapEnd - overlapStart;
		const overlapHours = overlapMs / (1000 * 60 * 60);
		hours -= overlapHours;
	}

	return Math.max(hours, 0);
};

// helper to calculate total pause hours
export const getTotalPauseHours = (pauses: IEmployeePauseTime[] = []) => {
	return pauses.reduce((total, pause) => total + getHoursDifference(pause.pauseStartTime, pause.pauseEndTime), 0);
};

export const getModuleAccessLevel = (permissions: IPermissions[] | undefined, module: MODULE): ACCESS_LEVEL => {
	const match = permissions?.find((permission) => permission.module === module);
	return (match?.accessLevel as ACCESS_LEVEL) ?? ACCESS_LEVEL.NONE;
};

export const formatValue = (value: string | null) => {
	if (!value) return "None";

	switch (value.toLowerCase()) {
		case "true":
			return "Enabled";

		case "false":
			return "Disabled";

		case "read":
			return "Read";

		case "write":
			return "Write";

		case "none":
			return "None";

		default:
			return value;
	}
};
