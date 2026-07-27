import { TimeSource } from "@/module/schedule-management/roster-time-configuration/enums";
import { IEmployeeHistoryDay } from "../types";
import { calculateStopHours } from "@/module/schedule-management/time-logs-management/utils/calculate-hours";
import { WEEK_DAY_NUMBERS } from "@/utils/enums";
import { toDate } from "@/lib/utils/date";

export const calculateHistoryWeekSummary = (data: IEmployeeHistoryDay[]) => {
	let totalWorkedHours = 0;
	let totalScheduleHours = 0;

	data.forEach((day) => {
		const roster = day.data.scheduleHours;
		const stopTimes = day.data.stopTimes ?? [];
		const pauseTimes = day.data.daytimeLog?.employeePauseTime ?? [];

		// Worked Hours
		stopTimes.forEach((stop) => {
			const stopHours = calculateStopHours({
				stop,
				employeePauseTime: pauseTimes,
			});

			if (typeof stopHours === "number") {
				totalWorkedHours += stopHours;
			}
		});

		if (!roster) {
			return;
		}

		const dayOfWeek = toDate(day.date).getDay();

		// Skip Saturday if not approved to work
		if (dayOfWeek === WEEK_DAY_NUMBERS.SATURDAY && !roster.isSaturdayWorking) {
			return;
		}

		// Skip Sunday if not approved to work
		if (dayOfWeek === WEEK_DAY_NUMBERS.SUNDAY && !roster.isSundayWorking) {
			return;
		}

		// Skip leave days
		if (roster.isOnLeave) {
			return;
		}

		// Skip OFF days
		if (roster.timeSource === TimeSource.NOT_WORKING) {
			return;
		}

		const scheduleHours = calculateStopHours({
			stop: {
				startTime: roster.extendedApprovedStartTime ?? roster.dayStartTime,
				endTime: roster.extendedApprovedEndTime ?? roster.dayEndTime,
			},
		});

		if (typeof scheduleHours === "number") {
			totalScheduleHours += scheduleHours;
		}
	});

	return {
		totalWorkedHours,
		totalScheduleHours,
	};
};
