// The "Reason" column on the pending-approval table — why the request was filed.
export enum ATTENDANCE_REASON {
	FULL_DAY_OFF = "FULL_DAY_OFF",
	LATE_ARRIVAL = "LATE_ARRIVAL",
	EARLY_QUIT = "EARLY_QUIT",
	LEAVE_RETURN_SAME_DAY = "LEAVE_RETURN_SAME_DAY",
}

export const ATTENDANCE_REASON_LABEL: Record<ATTENDANCE_REASON, string> = {
	[ATTENDANCE_REASON.FULL_DAY_OFF]: "Full Day Off",
	[ATTENDANCE_REASON.LATE_ARRIVAL]: "Late Arrival",
	[ATTENDANCE_REASON.EARLY_QUIT]: "Early Quit",
	[ATTENDANCE_REASON.LEAVE_RETURN_SAME_DAY]: "Leave/Return Same Day",
};

// The "Status" column — the employee's current employment status, not the request's.
export enum EMPLOYMENT_STATUS {
	CURRENT = "CURRENT",
	FORMER = "FORMER",
}

export const EMPLOYMENT_STATUS_LABEL: Record<EMPLOYMENT_STATUS, string> = {
	[EMPLOYMENT_STATUS.CURRENT]: "Current",
	[EMPLOYMENT_STATUS.FORMER]: "Former",
};

// The "Employee Type" column — which worksite the employee is assigned to.
export enum WORKSITE_TYPE {
	FIELD = "FIELD",
	OFFICE = "OFFICE",
	WAREHOUSE = "WAREHOUSE",
}

export const WORKSITE_TYPE_LABEL: Record<WORKSITE_TYPE, string> = {
	[WORKSITE_TYPE.FIELD]: "Field",
	[WORKSITE_TYPE.OFFICE]: "Office",
	[WORKSITE_TYPE.WAREHOUSE]: "Warehouse",
};

// The "PTO Status" column — the approval state of the request itself.
export enum ATTENDANCE_APPROVAL_STATUS {
	PENDING = "PENDING",
	APPROVED = "APPROVED",
	DECLINED = "DECLINED",
}

export const ATTENDANCE_APPROVAL_STATUS_LABEL: Record<ATTENDANCE_APPROVAL_STATUS, string> = {
	[ATTENDANCE_APPROVAL_STATUS.PENDING]: "Pending",
	[ATTENDANCE_APPROVAL_STATUS.APPROVED]: "Approved",
	[ATTENDANCE_APPROVAL_STATUS.DECLINED]: "Declined",
};

// Time-range filter for the Top Types and Point Assessment Summary panels.
export enum DASHBOARD_PERIOD {
	YESTERDAY = "YESTERDAY",
	THIS_WEEK = "THIS_WEEK",
	THIS_MONTH = "THIS_MONTH",
	THIS_YEAR = "THIS_YEAR",
}

export const DASHBOARD_PERIOD_LABEL: Record<DASHBOARD_PERIOD, string> = {
	[DASHBOARD_PERIOD.YESTERDAY]: "Yesterday",
	[DASHBOARD_PERIOD.THIS_WEEK]: "This Week",
	[DASHBOARD_PERIOD.THIS_MONTH]: "This Month",
	[DASHBOARD_PERIOD.THIS_YEAR]: "This Year",
};
