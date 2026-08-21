import { JOB_SITE_INJURY_MEDICAL_ACTION, REPORT_SOURCE, SAFETY_REPORT_STATUS } from "@/module/employee-safety/enums";
import { JOB_SITE_SAFETY_ACTION, JOB_SITE_SAFETY_REPORT_TYPE, JOB_SITE_SAFETY_TAB } from "../enums";
import { IJobSiteSafetyDashboardRow } from "../types";

export const JOB_SITE_INJURY_REPORT_PREFIX = "INJ";
export const JOB_SITE_SAFETY_VIOLATION_REPORT_PREFIX = "JSS";

export const formatJobSiteSafetyReportNumber = (prefix: string, reportId: number, createdAt: string): string =>
	`${prefix}-${new Date(createdAt).getUTCFullYear()}-${String(reportId).padStart(4, "0")}`;

export const REPORT_SOURCE_LABEL: Record<REPORT_SOURCE, string> = {
	[REPORT_SOURCE.EMPLOYEE]: "Employee",
	[REPORT_SOURCE.OFFICE]: "Admin",
};

export const JOB_SITE_SAFETY_REPORT_TYPE_LABEL: Record<JOB_SITE_SAFETY_REPORT_TYPE, string> = {
	[JOB_SITE_SAFETY_REPORT_TYPE.JOB_SITE_INJURY]: "Job Site Injury",
	[JOB_SITE_SAFETY_REPORT_TYPE.JOB_SITE_SAFETY_VIOLATION]: "Job Site Safety Violation",
};

export const SAFETY_REPORT_STATUS_META: Record<SAFETY_REPORT_STATUS, { label: string; className: string }> = {
	[SAFETY_REPORT_STATUS.DRAFT]: { label: "Draft", className: "bg-brand-bgLightgrey text-brand-dark50" },
	[SAFETY_REPORT_STATUS.PENDING]: { label: "Pending", className: "bg-[#F2EEE6] text-[#784F04]" },
	[SAFETY_REPORT_STATUS.PENDING_SECOND_REVIEW]: {
		label: "Pending Second Review",
		className: "bg-[#F2EEE6] text-[#784F04]",
	},
	[SAFETY_REPORT_STATUS.RESOLVED_INTERNALLY]: {
		label: "Resolved Internally",
		className: "bg-green-50 text-green-600",
	},
	[SAFETY_REPORT_STATUS.SUBMITTED_TO_INSURANCE]: {
		label: "Submitted to Insurance",
		className: "bg-[#E9EEFC] text-[#1D4ED8]",
	},
	[SAFETY_REPORT_STATUS.RESOLVED]: { label: "Resolved", className: "bg-[#E7F9E8] text-[#0CC312]" },
};

// Records created before the status lifecycle was introduced still carry retired
// values (e.g. "SUBMITTED"), so an unmapped status must not blank the whole table.
export const resolveSafetyReportStatusMeta = (status: SAFETY_REPORT_STATUS) =>
	SAFETY_REPORT_STATUS_META[status] ?? SAFETY_REPORT_STATUS_META[SAFETY_REPORT_STATUS.PENDING];

export const MARK_READY_FOR_INSURANCE_CONFIRM = {
	title: "Do you want to Mark it for President's Review?",
	description: `Marking this as Ready for Insurance will send this to "President's" Approval.`,
	confirmText: "Yes, Mark it.",
};

export const APPROVE_AND_SEND_TO_INSURANCE_CONFIRM = {
	title: "Do you want to Approve & Send to Insurance?",
	description: `Approving this will generate the insurance email and send the full report to "Fleet Manager" for review.`,
	confirmText: "Yes, Approve it.",
};

export const APPROVE_INTERNALLY_CONFIRM = {
	title: "Do you want to Approve this Internally?",
	description: "Approving it Internally will close this report here.",
	confirmText: "Yes, Approve it",
};

export const JOB_SITE_INJURY_MEDICAL_ACTION_LABEL: Record<JOB_SITE_INJURY_MEDICAL_ACTION, string> = {
	[JOB_SITE_INJURY_MEDICAL_ACTION.NO_ACTION]: "No Action",
	[JOB_SITE_INJURY_MEDICAL_ACTION.TREATMENT_NEEDED]: "Treatment Needed",
	[JOB_SITE_INJURY_MEDICAL_ACTION.TREATMENT_AND_DRUG_SCREEN]: "Treatment + Drug Screen",
	[JOB_SITE_INJURY_MEDICAL_ACTION.DRUG_SCREEN_ONLY]: "Drug Screen Only",
};

export const JOB_SITE_SAFETY_ACTION_LABEL: Record<JOB_SITE_SAFETY_ACTION, string> = {
	[JOB_SITE_SAFETY_ACTION.CONTINUE]: "Continue",
	[JOB_SITE_SAFETY_ACTION.REVIEW]: "Review",
	[JOB_SITE_SAFETY_ACTION.SEE_DETAILS]: "See Details",
};

const TAB_TYPE: Record<JOB_SITE_SAFETY_TAB, JOB_SITE_SAFETY_REPORT_TYPE | null> = {
	[JOB_SITE_SAFETY_TAB.ALL]: null,
	[JOB_SITE_SAFETY_TAB.INJURIES]: JOB_SITE_SAFETY_REPORT_TYPE.JOB_SITE_INJURY,
	[JOB_SITE_SAFETY_TAB.VIOLATIONS]: JOB_SITE_SAFETY_REPORT_TYPE.JOB_SITE_SAFETY_VIOLATION,
	// Drafts is a status filter, not a type — handled separately below.
	[JOB_SITE_SAFETY_TAB.DRAFTS]: null,
};

export const matchesJobSiteSafetyTab = (row: IJobSiteSafetyDashboardRow, tab: JOB_SITE_SAFETY_TAB): boolean => {
	if (tab === JOB_SITE_SAFETY_TAB.DRAFTS) return row.status === SAFETY_REPORT_STATUS.DRAFT;
	const typeForTab = TAB_TYPE[tab];
	return typeForTab === null || row.type === typeForTab;
};

export const matchesJobSiteSafetySearch = (row: IJobSiteSafetyDashboardRow, search: string): boolean => {
	if (!search) return true;
	const haystack = [row.recordNumber, row.employeeName, REPORT_SOURCE_LABEL[row.source], row.jobSiteName, row.detail]
		.filter(Boolean)
		.join(" ")
		.toLowerCase();
	return haystack.includes(search.toLowerCase());
};

const CLOSED_STATUSES: SAFETY_REPORT_STATUS[] = [
	SAFETY_REPORT_STATUS.RESOLVED_INTERNALLY,
	SAFETY_REPORT_STATUS.RESOLVED,
];

export const isClosedJobSiteSafetyRecord = (row: IJobSiteSafetyDashboardRow): boolean =>
	CLOSED_STATUSES.includes(row.status);

// Violations are record-keeping only for now: nothing happens after they are
// created, so no status is shown and no review actions are offered. The whole
// injury-style workflow is still wired up behind this flag in case the client
// asks for it back.
export const IS_VIOLATION_WORKFLOW_ENABLED = false;

export const hasJobSiteSafetyWorkflow = (row: IJobSiteSafetyDashboardRow): boolean =>
	IS_VIOLATION_WORKFLOW_ENABLED || row.type !== JOB_SITE_SAFETY_REPORT_TYPE.JOB_SITE_SAFETY_VIOLATION;

// Violations have no draft state (office-entered only), so CONTINUE never
// applies to them — otherwise they go through the same review workflow as
// injuries once submitted.
export const resolveJobSiteSafetyAction = (row: IJobSiteSafetyDashboardRow): JOB_SITE_SAFETY_ACTION => {
	if (!hasJobSiteSafetyWorkflow(row)) return JOB_SITE_SAFETY_ACTION.SEE_DETAILS;
	if (row.status === SAFETY_REPORT_STATUS.DRAFT) return JOB_SITE_SAFETY_ACTION.CONTINUE;
	if (CLOSED_STATUSES.includes(row.status)) return JOB_SITE_SAFETY_ACTION.SEE_DETAILS;
	return JOB_SITE_SAFETY_ACTION.REVIEW;
};
