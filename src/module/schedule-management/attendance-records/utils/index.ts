import { ATTENDANCE_SOURCE, BCEW_ATTENDANCE_TYPE } from "./enums";

export const attendanceSourceTabs = [
	{
		label: "All",
		key: "ALL",
	},
	{
		label: "Byldd",
		key: ATTENDANCE_SOURCE.BYLDD,
	},
	{
		label: "BCEW",
		key: ATTENDANCE_SOURCE.BCEW,
	},
];

export const attendanceTypeOptions = [
	{
		label: "Late Start",
		value: BCEW_ATTENDANCE_TYPE.LATENESS,
	},
	{
		label: "Absentee",
		value: BCEW_ATTENDANCE_TYPE.ABSENTEE,
	},
	{
		label: "Early Quit",
		value: BCEW_ATTENDANCE_TYPE.EARLY_QUIT,
	},
	{
		label: "Time Off",
		value: BCEW_ATTENDANCE_TYPE.TIME_OFF,
	},
	{
		label: "Leave Return",
		value: BCEW_ATTENDANCE_TYPE.LEAVE_RETURN,
	},
];

export const attendanceTypeLabelMap: Record<BCEW_ATTENDANCE_TYPE, string> = {
	[BCEW_ATTENDANCE_TYPE.LATENESS]: "Late Start",

	[BCEW_ATTENDANCE_TYPE.ABSENTEE]: "Absentee",

	[BCEW_ATTENDANCE_TYPE.EARLY_QUIT]: "Early Quit",

	[BCEW_ATTENDANCE_TYPE.TIME_OFF]: "Time Off",

	[BCEW_ATTENDANCE_TYPE.LEAVE_RETURN]: "Leave Return",
};
