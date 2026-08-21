import { IGetAdminNotificationItem } from "@/module/schedule-management/weekly-schedule-management/types/schedule-interface";
import { IApiResponse } from "@/types";

import { NOTIFICATION_TYPE } from "@/types/notification";

export enum NOTIFICATION_READ_FILTER {
	ALL = "all",
	UNREADS = "unreads",
	READS = "reads",
}

export enum NOTIFICATION_VIEW {
	DEFAULT_VIEW = "default",
	ALL = "all",
	MODULE = "module",
}

export const ADMIN_NOTIFICATION_GROUP = {
	[NOTIFICATION_TYPE.JOB_NOT_COMPLETED]: "Job Not Completed",
	[NOTIFICATION_TYPE.JOB_MARK_AS_NOT_READY]: "Job Marked as Not Ready",
	[NOTIFICATION_TYPE.DAY_LOG_TIME_MISMATCH]: "Day Log Time Mismatch",
	[NOTIFICATION_TYPE.WEEKEND_SELF_SCHEDULING]: "Weekend Self-Scheduling",
	[NOTIFICATION_TYPE.SELF_SCHEDULING]: "Weekday Self-Scheduling",
	[NOTIFICATION_TYPE.EMPLOYEE_RESCHEDULED_JOB]: "Job Rescheduled",
	[NOTIFICATION_TYPE.JOB_SCHEDULE_DATE_CHANGED]: "Job Date Changed",
	[NOTIFICATION_TYPE.LATE_DAY_START]: "Late Day Start",
	[NOTIFICATION_TYPE.FOREMAN_ADDED_STOP]: "Stop Added by Foreman",
	[NOTIFICATION_TYPE.GPS_TIME_MISMATCH]: "GPS Time Mismatch",
	[NOTIFICATION_TYPE.ETR]: "Extended Time Requested",
	[NOTIFICATION_TYPE.VEHICLE_SWAP]: "Vehicle Swapped",
	[NOTIFICATION_TYPE.LATE_START_AND_EARLY_QUIT]: "Late Start & Early Quit",
	[NOTIFICATION_TYPE.LATENESS_ALERT]: "Lateness Alert",
	[NOTIFICATION_TYPE.EMPLOYEE_ADDED_NOTE]: "Note Added",
	[NOTIFICATION_TYPE.ATTENDANCE_APPROVAL]: "Attendance",
	[NOTIFICATION_TYPE.TECHNICAL_ISSUE]: "Technical Issue Reported",
	[NOTIFICATION_TYPE.TRAVEL_PAY_REQUEST]: "Travel Pay Request",
	[NOTIFICATION_TYPE.EMPLOYEE_GPS_OFFLINE]: "GPS Alert",
	[NOTIFICATION_TYPE.MIDDAY_STOP]: "New Job Request",
	[NOTIFICATION_TYPE.RELEASE_NOTE]: "Release Note",
	[NOTIFICATION_TYPE.GEOTAB_REGAINED_POWER]: "Geotab Power Restored",
	[NOTIFICATION_TYPE.WEEKEND_SCHEDULE]: "Weekend Schedule",
	[NOTIFICATION_TYPE.SUBCONTRACTOR_JOB_CREATED_AND_CREW_ASSIGNMENT]: "Crew Assigned by Subcontractor",
	[NOTIFICATION_TYPE.WORK_ORDER]: "Work Order Updated",
	[NOTIFICATION_TYPE.JOB_MARKED_AS_DNW]: "Job Marked as Did Not Work",
	[NOTIFICATION_TYPE.GPS_EXCEPTION_EVENT]: "Geotab Exception Events",
	[NOTIFICATION_TYPE.MATERIAL_REQUEST]: "Material Requests",
	[NOTIFICATION_TYPE.CRATE_MANAGEMENT]: "Crate Management",
	[NOTIFICATION_TYPE.ROLES_AND_PERMISSIONS_UPDATED]: "Roles and Permissions Updated",
	[NOTIFICATION_TYPE.VEHICLE_ACCIDENT_REPORT]: "Vehicle Accident",
	[NOTIFICATION_TYPE.VEHICLE_BREAKDOWN_REPORT]: "Vehicle Breakdown",
	[NOTIFICATION_TYPE.DRIVING_SAFETY_VIOLATION_REPORT]: "Driving Safety Violation",
	[NOTIFICATION_TYPE.JOB_SITE_INJURY_REPORT]: "Job Site Injury",
	[NOTIFICATION_TYPE.JOB_SITE_SAFETY_VIOLATION_REPORT]: "Job Site Safety Violation",
} as const;

export const ADMIN_NOTIFICATION_TOOLTIP: Partial<Record<NOTIFICATION_TYPE, string>> = {
	[NOTIFICATION_TYPE.JOB_NOT_COMPLETED]: "The job wasn’t completed as scheduled.",
	[NOTIFICATION_TYPE.JOB_MARK_AS_NOT_READY]: "Job flagged as not ready to start.",
	[NOTIFICATION_TYPE.DAY_LOG_TIME_MISMATCH]: "Logged work time doesn’t match the scheduled time.",
	[NOTIFICATION_TYPE.WEEKEND_SELF_SCHEDULING]: "Employee scheduled weekend work.",
	[NOTIFICATION_TYPE.SELF_SCHEDULING]: "Employee scheduled weekday work.",
	[NOTIFICATION_TYPE.EMPLOYEE_RESCHEDULED_JOB]: "Assigned job was rescheduled.",
	[NOTIFICATION_TYPE.JOB_SCHEDULE_DATE_CHANGED]: "The scheduled date of the job was modified.",
	[NOTIFICATION_TYPE.LATE_DAY_START]: "Work started later than planned.",
	[NOTIFICATION_TYPE.FOREMAN_ADDED_STOP]: "Additional stops added to the route.",
	[NOTIFICATION_TYPE.GPS_TIME_MISMATCH]: "GPS data doesn’t align with logged work time.",
	[NOTIFICATION_TYPE.ETR]: "Request for extended job time.",
	[NOTIFICATION_TYPE.VEHICLE_SWAP]: "The vehicle assignment changed during the day.",
	[NOTIFICATION_TYPE.LATE_START_AND_EARLY_QUIT]: "Reason submitted for late arrival.",
	[NOTIFICATION_TYPE.LATENESS_ALERT]: "Employees arrived later than scheduled.",
	[NOTIFICATION_TYPE.EMPLOYEE_ADDED_NOTE]: "Note added to job or day log.",
	[NOTIFICATION_TYPE.ATTENDANCE_APPROVAL]: "Attendance logs pending approval.",
	[NOTIFICATION_TYPE.TECHNICAL_ISSUE]: "Issue reported from the field.",
	[NOTIFICATION_TYPE.TRAVEL_PAY_REQUEST]: "Request submitted for travel compensation.",
	[NOTIFICATION_TYPE.EMPLOYEE_GPS_OFFLINE]: "Unusual GPS activity detected.",
	[NOTIFICATION_TYPE.MIDDAY_STOP]: "New job submitted for scheduling.",
	[NOTIFICATION_TYPE.RELEASE_NOTE]: "Information about recent app updates.",
	[NOTIFICATION_TYPE.GEOTAB_REGAINED_POWER]: "GPS device reconnected after power loss.",
	[NOTIFICATION_TYPE.WEEKEND_SCHEDULE]: "Updates on technician availability for weekend work.",
	[NOTIFICATION_TYPE.SUBCONTRACTOR_JOB_CREATED_AND_CREW_ASSIGNMENT]: "Crew assigned by subcontractor admin.",
	[NOTIFICATION_TYPE.WORK_ORDER]: "Work order created or updated.",
	[NOTIFICATION_TYPE.JOB_MARKED_AS_DNW]: "Job marked as Did Not Work",
	[NOTIFICATION_TYPE.GPS_EXCEPTION_EVENT]: "GPS Exception Event",
	[NOTIFICATION_TYPE.MATERIAL_REQUEST]:
		"Includes notifications for material requests and related updates such as submissions, approvals, rejections, assignments, responses, and notes.",
	[NOTIFICATION_TYPE.CRATE_MANAGEMENT]:
		"Includes notifications for crate seal issues, damaged or missing crates, and crate returns.",
	[NOTIFICATION_TYPE.ROLES_AND_PERMISSIONS_UPDATED]: "Roles and Permissions Updated",
	[NOTIFICATION_TYPE.VEHICLE_ACCIDENT_REPORT]: "Notifications related to vehicle accidents and required actions.",
	[NOTIFICATION_TYPE.VEHICLE_BREAKDOWN_REPORT]: "Notifications related to vehicle breakdowns and required actions.",
	[NOTIFICATION_TYPE.DRIVING_SAFETY_VIOLATION_REPORT]:
		"Notifications related to driving safety violations and required actions.",
	[NOTIFICATION_TYPE.JOB_SITE_INJURY_REPORT]: "Notifications related to job site injuries and required actions.",
	[NOTIFICATION_TYPE.JOB_SITE_SAFETY_VIOLATION_REPORT]:
		"Notifications related to job site safety violations and required actions.",
};

export type IAdminNotificationGroup = (typeof ADMIN_NOTIFICATION_GROUP)[keyof typeof ADMIN_NOTIFICATION_GROUP];

export const SUB_CONTRACTOR_NOTIFICATION_GROUP = {
	[NOTIFICATION_TYPE.SCHEDULE_PUBLISHED]: "Schedule Published",
	[NOTIFICATION_TYPE.JOB_DATE_UPDATE]: "Job Date Update",
	[NOTIFICATION_TYPE.JOB_MARK_AS_NOT_READY]: "Job Not Ready",
	[NOTIFICATION_TYPE.TECHNICAL_ISSUE_UPDATE]: "Technical Issue Update",
};

export const SUB_CONTRACTOR_NOTIFICATION_TOOLTIP: Partial<Record<NOTIFICATION_TYPE, string>> = {
	[NOTIFICATION_TYPE.SCHEDULE_PUBLISHED]: "A new schedule has been published.",
	[NOTIFICATION_TYPE.JOB_DATE_UPDATE]: "The scheduled date of the job was modified.",
	[NOTIFICATION_TYPE.JOB_MARK_AS_NOT_READY]: "Job flagged as not ready to start.",
	[NOTIFICATION_TYPE.TECHNICAL_ISSUE_UPDATE]: "Technical issue update shouldn't be visible for subcontractor",
};
// Module Groups
export enum MODULE_GROUP {
	SCHEDULE_MANAGEMENT = "scheduleManagement",
	PEOPLE_MANAGEMENT = "peopleManagement",
	BUILDER_COMMUNICATIONS = "builderCommunications",
	SAFETY_MANAGEMENT = "safetyManagement",
	REPORTS_AND_EXPORTS = "reportsAndExports",
	TECHNICAL_ISSUE = "technicalIssue",
	FLEET_MANAGEMENT = "fleetManagement",
	MATERIAL = "material",
}

// Labels for UI
export const MODULE_GROUP_LABEL: Record<MODULE_GROUP, string> = {
	[MODULE_GROUP.SCHEDULE_MANAGEMENT]: "Schedule",
	[MODULE_GROUP.PEOPLE_MANAGEMENT]: "People",
	[MODULE_GROUP.TECHNICAL_ISSUE]: "Technical Issue",
	[MODULE_GROUP.BUILDER_COMMUNICATIONS]: "Builder Communications",
	[MODULE_GROUP.SAFETY_MANAGEMENT]: "Safety",
	[MODULE_GROUP.REPORTS_AND_EXPORTS]: "Reports & Exports",
	[MODULE_GROUP.FLEET_MANAGEMENT]: "Fleet",
	[MODULE_GROUP.MATERIAL]: "Material",
};
export const MODULE_GROUP_TOOLTIP: Partial<Record<MODULE_GROUP, string>> = {
	[MODULE_GROUP.SCHEDULE_MANAGEMENT]:
		"Includes notifications related to lateness, job updates and schedule changes, GPS time mismatch and alerts, day log time mismatch, stops added by foreman, self-scheduling, extended time requests, vehicle swaps, notes added, travel pay requests, and work order updates.",
	[MODULE_GROUP.PEOPLE_MANAGEMENT]: "Includes notifications for attendance approved.",
	[MODULE_GROUP.TECHNICAL_ISSUE]: "Includes notifications for technical issue reported.",
	[MODULE_GROUP.BUILDER_COMMUNICATIONS]: "No notifications mapped yet.",
	[MODULE_GROUP.SAFETY_MANAGEMENT]:
		"Notifications related to vehicle accidents, breakdowns, driving safety violations, job site injuries, and job site safety violations.",
	[MODULE_GROUP.REPORTS_AND_EXPORTS]: "Includes notifications for release note.",
	[MODULE_GROUP.MATERIAL]:
		"Includes notifications for material requests and related updates such as submissions, approvals, rejections, assignments, responses, and notes.",
};

export type INotificationGroupEntry<T> = {
	id: string;
	groupName: string;
	items: T[];
	value: string;
	unreadCount: number;
};

export type IAdminNotificationGroupedResponse = IApiResponse<{
	items: {
		group: MODULE_GROUP;
		items: IGetAdminNotificationItem[];
		total: number;
		unreadCount: number;
	}[];
}>;

export type IAdminNotificationTypeGroupedResponse = IApiResponse<{
	items: {
		type: NOTIFICATION_TYPE;
		items: IGetAdminNotificationItem[];
		total: number;
		unreadCount: number;
	}[];
}>;

export type IUpdateNotificationPreferencePayload = {
	view?: NOTIFICATION_VIEW;
	readFilter?: NOTIFICATION_READ_FILTER;
	teamId?: string | null;
};

export type INotificationPreferenceResponse = {
	view: NOTIFICATION_VIEW;
	readFilter: NOTIFICATION_READ_FILTER;
	teamId: string | null;
};

export type IMarkAllAdminNotificationsReadPayload = {
	isRead?: boolean;
	types?: NOTIFICATION_TYPE[];
	moduleGroups?: MODULE_GROUP[];
	createdAt?: string;
	teamId?: string;
};
