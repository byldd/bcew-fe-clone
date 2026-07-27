import { MODULE } from "@/utils/enums";
import { ACCESS_LEVEL, MODULE_HEADING } from "@/module/employee/enums";
import { getTodayDate, setTime, dateToUTCString } from "@/lib/utils/date";
import { JOB_PHASE_LABEL_NUM } from "@/module/schedule-management/weekly-schedule-management/constants/week-schedule";
import { IPermissionChangeHistoryItem, IRoleChangeHistoryItem } from "@/module/employee/types";

export const MODULE_DISPLAY_ORDER = [
	MODULE.DASHBOARD,
	MODULE.WEEKLY_SCHEDULE,
	MODULE.JOBS_AND_PHASES,
	MODULE.TIME_LOGS,
	MODULE.CONFIRMED_READY,
	MODULE.QC_TRACKER,
	MODULE.CREW_LIST,
	MODULE.EMPLOYEES_LIST,
	MODULE.SUB_CONTRACTOR,
	MODULE.BUILDER_COMMUNICATIONS,
	MODULE.REPORTS_AND_EXPORTS,
];

export const MODULE_HEADING_WITH_DISPLAY_ORDER: Record<MODULE_HEADING, MODULE[]> = {
	[MODULE_HEADING.DASHBOARD]: [MODULE.DASHBOARD],

	[MODULE_HEADING.SCHEDULE_MANAGEMENT]: [MODULE.WEEKLY_SCHEDULE, MODULE.JOBS_AND_PHASES, MODULE.TIME_LOGS],

	[MODULE_HEADING.READINESS_AND_QUALITY]: [MODULE.CONFIRMED_READY, MODULE.QC_TRACKER],

	[MODULE_HEADING.PEOPLE_MANAGEMENT]: [MODULE.CREW_LIST, MODULE.EMPLOYEES_LIST, MODULE.SUB_CONTRACTOR],

	[MODULE_HEADING.BUILDER_COMMUNICATIONS]: [MODULE.BUILDER_COMMUNICATIONS],

	[MODULE_HEADING.REPORTS_AND_EXPORT]: [MODULE.REPORTS_AND_EXPORTS],
};

export const MODULE_LABELS: Record<MODULE, string> = {
	[MODULE.DASHBOARD]: "Dashboard",
	[MODULE.WEEKLY_SCHEDULE]: "Weekly Schedule",
	[MODULE.JOBS_AND_PHASES]: "Jobs and Phases",
	[MODULE.TIME_LOGS]: "Time Logs",
	[MODULE.CONFIRMED_READY]: "Confirmed Ready",
	[MODULE.QC_TRACKER]: "QC Tracker",
	[MODULE.CREW_LIST]: "Crew ",
	[MODULE.EMPLOYEES_LIST]: "Employees ",
	[MODULE.SUB_CONTRACTOR]: "Sub-Contractor",
	[MODULE.BUILDER_COMMUNICATIONS]: "Builder Communications",
	[MODULE.REPORTS_AND_EXPORTS]: "Reports and Exports",
	[MODULE.SAFETY_MANAGEMENT]: "Safety Management",
	[MODULE.TIME_REQUEST]: "Time Request",
	[MODULE.FLEET]: "Fleet",
	[MODULE.FINANCE]: "Finance",
	[MODULE.TRAINING]: "Training",
};

export const MODULE_ORDER: MODULE[] = [
	MODULE.DASHBOARD,
	MODULE.WEEKLY_SCHEDULE,
	MODULE.TIME_LOGS,
	MODULE.CREW_LIST,
	MODULE.EMPLOYEES_LIST,
	MODULE.SUB_CONTRACTOR,
];

export const LOCKED_MODULES: MODULE[] = [
	MODULE.CONFIRMED_READY,
	MODULE.QC_TRACKER,
	MODULE.JOBS_AND_PHASES,
	MODULE.REPORTS_AND_EXPORTS,
];

export const activityTableHeaders = [
	"Date",
	"No. of Stops",
	"Day Start & End Time",
	"Pause Time",
	"Override Start & End Time",
	"Notes",
	"Truck Assigned",
	"Distance Travelled",
	"Action",
];

export const ROLE_DEFAULT_TIME = {
	dayStartTime: dateToUTCString(setTime(getTodayDate(), "09:00")),
	dayEndTime: dateToUTCString(setTime(getTodayDate(), "15:30")),
};

export const EMPLOYEE_PHASES = {
	[JOB_PHASE_LABEL_NUM.Rough]: "ROUGH",
	[JOB_PHASE_LABEL_NUM.Final]: "FINAL",
	[JOB_PHASE_LABEL_NUM["Second hit"]]: "SECOND_HIT",
	[JOB_PHASE_LABEL_NUM.Service]: "SERVICE",
	WORK_ORDER: "WORK_ORDER",
};

export const userPermissions = {
	WEEKEND_SELF_SCHEDULING: "Weekend Self-Scheduling",
	WEEKDAY_SELF_SCHEDULING: "Weekday Self-Scheduling",
	MATERIAL_REQUEST: "Material Request",
	MODIFY_TECHNICIAN_NOTES: "Modify Technician Notes",
	QC_ENABLED: "QC Enabled",
	ASANA_TASK_CREATION: "Asana Task Creation",
	FINGERPRINT: "Fingerprint",
	SPECIAL_CARD_TIME_LOGGING_EXEMPT: "Exempt Time Logging at Special Card",
};

export const rolePermissions = {
	CAN_SEND_NOTIFICATION: "Send Notification",
	TRACK_TIME_BY_GPS: "Track Time by GPS",
	CAN_SEND_TRAVEL_PAY_REQUEST: "Can Send Travel Pay Request",
	REQUIRES_SCHEDULE_VALIDATION: "Requires Schedule Validation",
	SPECIAL_CARD_TIME_LOGGING_EXEMPT: "Exempt Time Logging at Special Card",
	FINGERPRINT_ENABLED: "Fingerprint Permission",
};

// Short labels for a "From: X → To: Y" transition line.
export const ACCESS_LEVEL_TRANSITION_LABEL: Record<ACCESS_LEVEL, string> = {
	[ACCESS_LEVEL.NONE]: "None",
	[ACCESS_LEVEL.READ]: "Read Only",
	[ACCESS_LEVEL.WRITE]: "Write",
};

// Combined label for a module's current access level (single-column summary).
export const ACCESS_LEVEL_COMBINED_LABEL: Record<ACCESS_LEVEL, string> = {
	[ACCESS_LEVEL.NONE]: "No Access",
	[ACCESS_LEVEL.READ]: "Read Only",
	[ACCESS_LEVEL.WRITE]: "Read & Write",
};

// Placeholder data until the backend exposes list endpoints for role/permission change history.
export const MOCK_ROLE_CHANGE_HISTORY: IRoleChangeHistoryItem[] = [
	{
		id: "1",
		fromRole: "Supervisor",
		toRole: "Scheduler",
		changedBy: "Alex Martin",
		changedAt: "2024-08-20T20:21:00Z",
	},
	{
		id: "2",
		fromRole: "Foreman",
		toRole: "Supervisor",
		changedBy: "Alex Martin",
		changedAt: "2024-06-25T20:10:00Z",
	},
	{
		id: "3",
		fromRole: "Technician",
		toRole: "Foreman",
		changedBy: "Alex Martin",
		changedAt: "2024-04-18T15:30:00Z",
	},
];

export const MOCK_PERMISSION_CHANGE_HISTORY: IPermissionChangeHistoryItem[] = [
	{
		id: "1",
		module: MODULE.CREW_LIST,
		fromAccessLevel: ACCESS_LEVEL.NONE,
		toAccessLevel: ACCESS_LEVEL.WRITE,
		changedBy: "Alex Martin",
		changedAt: "2024-06-25T20:10:00Z",
	},
	{
		id: "2",
		module: MODULE.DASHBOARD,
		fromAccessLevel: ACCESS_LEVEL.NONE,
		toAccessLevel: ACCESS_LEVEL.WRITE,
		changedBy: "Alex Martin",
		changedAt: "2024-06-08T18:05:00Z",
	},
	{
		id: "3",
		module: MODULE.EMPLOYEES_LIST,
		fromAccessLevel: ACCESS_LEVEL.NONE,
		toAccessLevel: ACCESS_LEVEL.WRITE,
		changedBy: "Alex Martin",
		changedAt: "2024-05-02T13:45:00Z",
	},
];
