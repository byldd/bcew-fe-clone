import { IWeekReportEntry } from "../types";
import { ITimeLogResponse } from "@/module/schedule-management/time-logs-management/types";
import { calculateDayHours } from "@/module/schedule-management/time-logs-management/utils/calculate-hours";
import { calculateDayStartEndTimes } from "@/module/schedule-management/time-logs-management/utils";
import { calculateEffectiveHours } from "@/module/employee/utils";
import { SORT_ORDER } from "@/types";

export const getDayActualHours = (timeLog: ITimeLogResponse) => {
	const { empDayStartTime, empDayEndTime } = calculateDayStartEndTimes(timeLog.employeeDayTimes, timeLog.jobs);

	const { hours } = calculateDayHours({
		employeeDayTime: { ...timeLog.employeeDayTimes, dayStartTime: empDayStartTime, dayEndTime: empDayEndTime },
		stops: timeLog.jobs,
		pauses: timeLog.employeeDayTimes?.employeePauseTime,
	});

	return typeof hours === "number" ? hours : 0;
};

export const getDayScheduledHours = (timeLog: ITimeLogResponse) =>
	calculateEffectiveHours(timeLog.rosterTimes?.dayStartTime, timeLog.rosterTimes?.dayEndTime);

export const getScheduledHours = (entry: IWeekReportEntry) =>
	entry.timeLogs.reduce((sum, timeLog) => sum + getDayScheduledHours(timeLog), 0);

export const getActualHours = (entry: IWeekReportEntry) =>
	entry.timeLogs.reduce((sum, timeLog) => sum + getDayActualHours(timeLog), 0);

export const getTravelMiles = (entry: IWeekReportEntry) =>
	entry.travelPayRequests.reduce(
		(sum, request) => sum + (request.firstStopDistance || 0) + (request.lastStopDistance || 0),
		0
	);

export interface IWeekReportColumn {
	key: string;
	label: string;
	getValue: (entry: IWeekReportEntry) => string | number;
}

export const weekReportColumns: IWeekReportColumn[] = [
	{ key: "employeeNum", label: "Emp #", getValue: (entry) => Number(entry.employeeNum) },
	{ key: "lastName", label: "Last Name", getValue: (entry) => entry.lastName ?? entry.userName },
	{ key: "firstName", label: "First Name", getValue: (entry) => entry.firstName ?? "" },
	{ key: "middleInitial", label: "MI", getValue: (entry) => entry.middleInitial ?? "" },
	{ key: "scheduledHours", label: "Scheduled Time", getValue: getScheduledHours },
	{ key: "actualHours", label: "Actual Time", getValue: getActualHours },
	{ key: "travelMiles", label: "Travel Pay", getValue: getTravelMiles },
];

export const sortWeekReportEntries = (data: IWeekReportEntry[], key: string, dir: SORT_ORDER) => {
	const column = weekReportColumns.find((c) => c.key === key);
	if (!column) return data;

	return [...data].sort((a, b) => {
		const aValue = column.getValue(a);
		const bValue = column.getValue(b);

		if (aValue < bValue) return dir === "asc" ? -1 : 1;
		if (aValue > bValue) return dir === "asc" ? 1 : -1;
		return 0;
	});
};

export const filterWeekReportEntries = (data: IWeekReportEntry[], search: string) => {
	if (!search) return data;
	const query = search.toLowerCase();
	return data.filter((entry) =>
		`${entry.firstName ?? ""} ${entry.lastName ?? entry.userName}`.toLowerCase().includes(query)
	);
};
