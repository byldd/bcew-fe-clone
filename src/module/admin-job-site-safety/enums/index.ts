export enum ADD_RECORD_TAB {
	JOB_SITE_INJURY = "JOB_SITE_INJURY",
	JOB_SITE_SAFETY_VIOLATION = "JOB_SITE_SAFETY_VIOLATION",
}

export enum JOB_SITE_SAFETY_REPORT_TYPE {
	JOB_SITE_INJURY = "JOB_SITE_INJURY",
	JOB_SITE_SAFETY_VIOLATION = "JOB_SITE_SAFETY_VIOLATION",
}

// Violations have no draft state and no interactive review page — they're
// always a read-only "See Details" modal, regardless of status.
export enum JOB_SITE_SAFETY_ACTION {
	CONTINUE = "CONTINUE",
	REVIEW = "REVIEW",
	SEE_DETAILS = "SEE_DETAILS",
}

// Approval steps offered straight from the list's Status column. Sending the
// insurance email is deliberately absent — the Fleet Manager has to open the
// review page to read the draft before it goes out.
export enum JOB_SITE_SAFETY_STATUS_ACTION {
	MARK_FOR_PRESIDENT_REVIEW = "MARK_FOR_PRESIDENT_REVIEW",
	APPROVE_AND_SEND_TO_INSURANCE = "APPROVE_AND_SEND_TO_INSURANCE",
	APPROVE_INTERNALLY = "APPROVE_INTERNALLY",
	MARK_RESOLVED = "MARK_RESOLVED",
}

export enum JOB_SITE_SAFETY_LIFECYCLE_EVENT {
	REPORT_SUBMITTED = "REPORT_SUBMITTED",
	DETAILS_EDITED = "DETAILS_EDITED",
	SENT_FOR_PRESIDENT_REVIEW = "SENT_FOR_PRESIDENT_REVIEW",
	APPROVED_FOR_INSURANCE = "APPROVED_FOR_INSURANCE",
	SENT_TO_INSURANCE = "SENT_TO_INSURANCE",
	RESOLVED_INTERNALLY = "RESOLVED_INTERNALLY",
	RESOLVED = "RESOLVED",
}

export enum JOB_SITE_SAFETY_TAB {
	ALL = "ALL",
	INJURIES = "INJURIES",
	VIOLATIONS = "VIOLATIONS",
	DRAFTS = "DRAFTS",
}

// The workflow is role-based, not user-based — these are Role.name values on
// the current user, not fixed enum members in the DB.
export enum JOB_SITE_SAFETY_REVIEWER_ROLE {
	PRESIDENT = "President",
	FLEET_MANAGER = "Fleet Manager",
}
