export enum OptionYesNo {
	YES = "Yes",
	NO = "No",
}

export enum ENV {
	PRODUCTION = "production",
	DEVELOPMENT = "development",
	STAGING = "staging",
}

export enum TRUE_FALSE {
	TRUE = "true",
	FALSE = "false",
}

export enum DATE_CHECK_FROM {
	NOW = "NOW",
	TODAY = "TODAY",
}

export enum EMPLOYEE_CATEGORY {
	ACTIVE = 1,
	SUB_CONTRACTOR = 6,
}

export enum MODULE {
	DASHBOARD = "dashboard",
	WEEKLY_SCHEDULE = "weeklySchedule",
	JOBS_AND_PHASES = "jobsAndPhases",
	TIME_LOGS = "timeLogs",
	CONFIRMED_READY = "confirmedReady",
	QC_TRACKER = "qcTracker",
	CREW_LIST = "crewList",
	EMPLOYEES_LIST = "employeesList",
	SUB_CONTRACTOR = "subContractor",
	BUILDER_COMMUNICATIONS = "builderCommunications",
	REPORTS_AND_EXPORTS = "reportsAndExports",
	SAFETY_MANAGEMENT = "safetyManagement",
	TIME_REQUEST = "timeRequests",
	FLEET = "fleet",
	FINANCE = "finance",
	TRAINING = "training",
}

export enum ROASTER_TABS {
	All_Employees = "All Employees",
	Field = "Field",
	Warehouse = "Warehouse",
	Office = "Office",
}

export enum TEAM_NAME {
	WAREHOUSE = "Warehouse",
	OFFICE = "Office",
	FIELD = "Field",
	PROCUREMENT = "Procurement",
}

export enum MATERIAL_ROLE {
	WAREHOUSE_MANAGER = "warehouseManager",
	OFFICE_MANAGER = "officeManager",
	PROCUREMENT_SPECIALIST = "procurementSpecialist",
}

export enum WEEK_DAY {
	Saturday = "Saturday",
	Sunday = "Sunday",
	Monday = "Monday",
	Tuesday = "Tuesday",
	Wednesday = "Wednesday",
	Thursday = "Thursday",
	Friday = "Friday",
}

export enum WEEK_DAY_NUMBERS {
	SUNDAY = 0,
	MONDAY = 1,
	TUESDAY = 2,
	WEDNESDAY = 3,
	THURSDAY = 4,
	FRIDAY = 5,
	SATURDAY = 6,
}

export enum E_ROLES {
	FOREMAN = "FOREMAN",
}

export enum FALLBACK_TIME_RANGE_STRINGS {
	TIME_MISSING = "--",
	END_MISSING = "__",
	DEFAULT_TIME_RANGE = "00:00 - 00:00",
}

export enum LOGIN_MODE {
	USER = "user",
	SUB_CONTRACTOR_CREW_LEADER = "sub-contractor-crew-leader",
}

export enum TIME_VARIANCE_TYPE {
	LATE_ARRIVAL = "LATE_ARRIVAL",
	EARLY_LOGOUT = "EARLY_LOGOUT",
	BOTH = "BOTH", // both late arrival and early logout in same day
}

export enum TECHNICAL_ISSUE_STATUS {
	OPEN = "OPEN",
	IN_PROGRESS = "IN_PROGRESS",
	ON_HOLD = "ON_HOLD",
	RESOLVED = "RESOLVED",
	CANCELLED = "CANCELLED",
}

export enum TECHNICAL_ISSUE_TYPE {
	APP_CRASH = "APP_CRASH",
	SCHEDULING = "SCHEDULING",
	PAYROLL = "PAYROLL",
	GPS = "GPS",
	OTHER = "OTHER",
}

export enum TECHNICAL_ISSUE_CLASSIFICATION {
	NOT_A_BUG = "NOT_A_BUG",
	VALID_BUG = "VALID_BUG",
}

export enum TECHNICAL_ISSUE_ACTION_FILTER {
	TAKE_ACTION = "TAKE_ACTION",
	NOT_TAKE_ACTION = "NOT_TAKE_ACTION",
}

export enum TECHNICAL_ISSUE_SEVERITY {
	LOW = "LOW",
	MEDIUM = "MEDIUM",
	HIGH = "HIGH",
}

export enum TIMEZONE {
	ASIACENTRAL = "Asia/Calcutta",
	EST = "America/New_York",
	UTC = "UTC",
}

export enum FILTER_SAVED_VIEW_PAGE_KEY {
	MATERIAL_REQUESTS = "material-requests",
}
