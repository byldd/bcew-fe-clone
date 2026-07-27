export const stopNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export const scheduleFrequency = ["Daily", "Weekly", "Monthly"];
export const scheduleTime = ["3:15 PM", "9:00 AM", "12:00 PM", "6:00 PM"];

export const C_SCHEDULE_PUBLISH_ERROR = {
	PTO_CONFLICT: "PTO_CONFLICT",
	STOP_NUMBER_SEQUENCE: "STOP_NUMBER_SEQUENCE",
	EMPLOYEE_NOT_ASSIGNED_TO_JOB: "EMPLOYEE_NOT_ASSIGNED_TO_JOB",
	JOBS_HAS_NO_WORKERS: "JOBS_HAS_NO_WORKERS",
	SCHEDULED_BUT_NEW_START_NOT_CREATED: "SCHEDULED_BUT_NEW_START_NOT_CREATED",
	AVAILABLE_FOR_WEEKEND_BUT_NOT_ASSIGNED_TO_JOB: "AVAILABLE_FOR_WEEKEND_BUT_NOT_ASSIGNED_TO_JOB",
	NOT_AVAILABLE_FOR_WEEKEND_BUT_ASSIGNED_TO_JOB: "NOT_AVAILABLE_FOR_WEEKEND_BUT_ASSIGNED_TO_JOB",
};

export const C_SCHEDULE_PUBLISH_ERROR_TITLE = {
	[C_SCHEDULE_PUBLISH_ERROR.PTO_CONFLICT]: "❌ PTO Conflict Detected",
	[C_SCHEDULE_PUBLISH_ERROR.STOP_NUMBER_SEQUENCE]: "❗Stop Number Sequence",
	[C_SCHEDULE_PUBLISH_ERROR.EMPLOYEE_NOT_ASSIGNED_TO_JOB]: "⚠️ Employee Not Assigneed to Job",
	[C_SCHEDULE_PUBLISH_ERROR.JOBS_HAS_NO_WORKERS]: "🚫 Jobs Has No Workers",
	[C_SCHEDULE_PUBLISH_ERROR.SCHEDULED_BUT_NEW_START_NOT_CREATED]: "🚫 Scheduled But New Start Not Created",
	[C_SCHEDULE_PUBLISH_ERROR.AVAILABLE_FOR_WEEKEND_BUT_NOT_ASSIGNED_TO_JOB]:
		"🗓️ Available for Weekend But Not Assigned to Job",
	[C_SCHEDULE_PUBLISH_ERROR.NOT_AVAILABLE_FOR_WEEKEND_BUT_ASSIGNED_TO_JOB]:
		"🗓️ Not Available for Weekend But Assigned to Job",
};

export enum SCHEDULE_ROW_TYPE {
	DAILY_JOB = "DAILY_JOB",
	QC_JOB = "QC_JOB",
	QC_REPAIR = "QC_REPAIR",
	QC_INSPECTION = "QC_INSPECTION",
	SPECIAL_JOB = "SPECIAL_JOB",
}

export const SCHEDULE_ROW_TYPE_LABEL = {
	[SCHEDULE_ROW_TYPE.QC_REPAIR]: "QC Repair",
	[SCHEDULE_ROW_TYPE.QC_INSPECTION]: "QC Inspection",
	[SCHEDULE_ROW_TYPE.DAILY_JOB]: "Daily Job",
	[SCHEDULE_ROW_TYPE.QC_JOB]: "QC Job",
	[SCHEDULE_ROW_TYPE.SPECIAL_JOB]: "Special Job",
};

export const emptyCardKey = "empty";

export const bcewJobCardId = (bcewSchlinIdNum: string) => `job-row-${bcewSchlinIdNum}`;

export const HOLIDAY_OPTIONS = [
	{ label: "Extreme Weather Handling", value: "extreme" },
	{ label: "Special Day", value: "special" },
];

export const HOLIDAY_REASON_OPTIONS = [
	{ label: "Full Day Closure", value: "holiday" },
	{ label: "Late Start", value: "late_start" },
	{ label: "Early Release", value: "early_release" },
];

export const HOLIDAY_REASON_MAP = HOLIDAY_REASON_OPTIONS.reduce<Record<string, string>>((acc, curr) => {
	acc[curr.value] = curr.label;
	return acc;
}, {});

export const DEFAULT_START_TIME = "12:00";

export const JOB_PHASE_LABEL: Record<number, string> = {
	16200: "Rough",
	16400: "Final",
	16500: "Second hit",
	16100: "Service",
	16000: "Slab Rough",
};

export const JOB_PHASE_LABEL_NUM = {
	Rough: 16200,
	Final: 16400,
	"Second hit": 16500,
	Service: 16100,
	"Slab Rough": 16000,
};

export const SearchKeywords = {
	MULTI_FAMILY: "multi family",
};
