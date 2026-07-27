import { ITeam } from "@/module/team/types";
import { IEmployeeDayTime } from "@/module/schedule-management/weekly-schedule-management/types/schedule-interface";
import {
	DayTimeComparison,
	RosterWeekDays,
	TimeSource,
} from "@/module/schedule-management/roster-time-configuration//enums";
import { rosterDays, TIME_SOURCE_DISPLAY_MAP } from "@/module/schedule-management/roster-time-configuration/constants";
import { IRoster } from "@/module/schedule-management/roster-time-configuration/types";
import { calculateEffectiveHours, getTotalPauseHours } from "@/module/employee/utils";
import { toFormattedDate } from "@/lib/utils/date";
import { DATE_FORMAT } from "@/types/date";
import { FALLBACK_TIME_RANGE_STRINGS } from "@/utils/enums";

export const rosterTeamDisplayOrder = ["Field", "Warehouse", "Office"];

export const sortTeamsByDisplayOrder = (teams: ITeam[]) => {
	return [...teams].sort((a, b) => rosterTeamDisplayOrder.indexOf(a.name) - rosterTeamDisplayOrder.indexOf(b.name));
};

export const compareDayTimes = (
	rosterDayTime?: { dayStartTime: string; dayEndTime: string },
	employeeDayTime?: IEmployeeDayTime,
	type: DayTimeComparison.SAME | DayTimeComparison.DIFFERENT = DayTimeComparison.SAME
): boolean => {
	if (!rosterDayTime || !employeeDayTime) return false;

	const getTime = (dateStr?: string | Date) =>
		dateStr ? new Date(dateStr).toISOString().substring(11, 19) : undefined;

	const rosterStart = getTime(rosterDayTime.dayStartTime);
	const rosterEnd = getTime(rosterDayTime.dayEndTime);

	const employeeStart = getTime(employeeDayTime.overrideStartTime || employeeDayTime.dayStartTime);
	const employeeEnd = getTime(employeeDayTime.overrideEndTime || employeeDayTime.dayEndTime);

	const isSame = rosterStart === employeeStart && rosterEnd === employeeEnd;

	return type === DayTimeComparison.SAME ? isSame : !isSame;
};

export const isDayTimeSame = (
	rosterDayTime?: { dayStartTime: string; dayEndTime: string },
	employeeDayTime?: IEmployeeDayTime
) => compareDayTimes(rosterDayTime, employeeDayTime, DayTimeComparison.SAME);

export const isDayTimeDifferent = (
	rosterDayTime?: { dayStartTime: string; dayEndTime: string },
	employeeDayTime?: IEmployeeDayTime
) => compareDayTimes(rosterDayTime, employeeDayTime, DayTimeComparison.DIFFERENT);

/**
 * Calculates the difference in hours between two date/time values.
 * Returns 0 if either is invalid or end < start.
 */
export function getHoursDifference(
	start: Date | string | null | undefined,
	end: Date | string | null | undefined
): number {
	if (!start || !end) return 0;

	const startDate = new Date(start);
	const endDate = new Date(end);

	if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || endDate <= startDate) return 0;

	return (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);
}

export function isValidTimeRange(start?: Date | string | null, end?: Date | string | null) {
	if (!start || !end) return false;
	const startDate = new Date(start);
	const endDate = new Date(end);
	return !isNaN(startDate.getTime()) && !isNaN(endDate.getTime()) && endDate >= startDate;
}

export function calculateTotalScheduledHours(
	roster: IRoster[],
	isSaturdayWorking: boolean,
	isSundayWorking: boolean
): number {
	if (!Array.isArray(roster)) return 0;

	return roster.reduce((sum, r, idx) => {
		// Skip weekends if not working
		if (rosterDays[idx] === RosterWeekDays.Saturday && !isSaturdayWorking) return sum;
		if (rosterDays[idx] === RosterWeekDays.Sunday && !isSundayWorking) return sum;

		// Skip leave days
		if (r?.isOnLeave) return sum;

		const hasValidScheduledTime = isValidTimeRange(r.dayStartTime, r.dayEndTime);
		if (!hasValidScheduledTime) return sum;

		const currentDateScheduleHours = calculateEffectiveHours(r.dayStartTime, r.dayEndTime);

		return sum + currentDateScheduleHours;
	}, 0);
}

/**
 * Calculates total logged working hours for a given roster array.
 * Handles:
 * - Skipping weekends (if not working)
 * - Skipping leave days
 * - Deducting pause durations
 * - Deducting lunch duration (if logged end time >= 12:15 UTC)
 */
export function calculateTotalLoggedHours(
	roster: IRoster[],
	isSaturdayWorking: boolean,
	isSundayWorking: boolean
): number {
	if (!Array.isArray(roster)) return 0;

	return roster.reduce((sum, r, idx) => {
		// Skip Saturday/Sunday if not working
		if (rosterDays[idx] === RosterWeekDays.Saturday && !isSaturdayWorking) return sum;
		if (rosterDays[idx] === RosterWeekDays.Sunday && !isSundayWorking) return sum;

		// Skip leave days
		if (r?.isOnLeave) return sum;

		const loggedStart = r?.employeeDayTime?.overrideStartTime || r?.employeeDayTime?.dayStartTime || null;
		const loggedEnd = r?.employeeDayTime?.overrideEndTime || r?.employeeDayTime?.dayEndTime || null;

		const hasValidLoggedTime = isValidTimeRange(loggedStart, loggedEnd);
		if (!hasValidLoggedTime) return sum;

		let workingHours = calculateEffectiveHours(loggedStart, loggedEnd);

		// Subtract pauses
		const pauses = r?.employeeDayTime?.employeePauseTime || [];
		const totalPauseTime = getTotalPauseHours(pauses);
		workingHours -= totalPauseTime;

		if (workingHours < 0) workingHours = 0;
		return sum + workingHours;
	}, 0);
}

/**
 * Converts decimal hours into a formatted string like "7H 45M".
 * Omits minutes if 0 (e.g. "7H" instead of "7H 0M").
 *
 * @param hours Decimal hour value (e.g., 7.75)
 * @returns Formatted string like "7H 45M" or "7H"
 */
export function formatHoursToHM(hours: number): string {
	if (isNaN(hours) || hours <= 0) return "-";

	const h = Math.floor(hours);
	const m = Math.round((hours - h) * 60);

	return m > 0 ? `${h}H ${m}M` : `${h}H`;
}

export function getFormattedTimeRange(
	startTime: string | Date | null | undefined,
	endTime: string | Date | null | undefined,
	fallback: FALLBACK_TIME_RANGE_STRINGS = FALLBACK_TIME_RANGE_STRINGS.TIME_MISSING,
	allowPartial: boolean = false
): string {
	if (startTime && endTime) {
		return `${toFormattedDate(startTime, DATE_FORMAT.HH_MM_AA_PM)} - ${toFormattedDate(endTime, DATE_FORMAT.HH_MM_AA_PM)}`;
	}

	if (allowPartial && startTime && !endTime) {
		return `${toFormattedDate(startTime, DATE_FORMAT.HH_MM_AA_PM)} - ${FALLBACK_TIME_RANGE_STRINGS.END_MISSING}`;
	}

	return fallback;
}

export const getTimeSourceLabel = (timeSource?: string): TimeSource | string => {
	if (!timeSource) return "--";
	return TIME_SOURCE_DISPLAY_MAP[timeSource as TimeSource] ?? timeSource;
};
