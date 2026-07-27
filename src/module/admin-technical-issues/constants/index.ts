import {
	TECHNICAL_ISSUE_TYPE,
	TECHNICAL_ISSUE_SEVERITY,
	TECHNICAL_ISSUE_CLASSIFICATION,
	TECHNICAL_ISSUE_ACTION_FILTER,
} from "@/utils/enums";

/* ─────────────────────────────
 * Issue Type Labels
 * ───────────────────────────── */
export const TECHNICAL_ISSUE_TYPE_LABEL_MAP: Record<TECHNICAL_ISSUE_TYPE, string> = {
	[TECHNICAL_ISSUE_TYPE.APP_CRASH]: "App not Working / Crash",
	[TECHNICAL_ISSUE_TYPE.SCHEDULING]: "Scheduling Issue",
	[TECHNICAL_ISSUE_TYPE.PAYROLL]: "Time / Payroll Issue",
	[TECHNICAL_ISSUE_TYPE.GPS]: "GPS / Location Issue",
	[TECHNICAL_ISSUE_TYPE.OTHER]: "Other",
};

/* ─────────────────────────────
 * Severity Labels
 * ───────────────────────────── */
export const TECHNICAL_ISSUE_SEVERITY_LABEL_MAP: Record<TECHNICAL_ISSUE_SEVERITY, string> = {
	LOW: "Low",
	MEDIUM: "Medium",
	HIGH: "High",
};

/* ─────────────────────────────
 * Classification Labels (optional)
 * ───────────────────────────── */
export const TECHNICAL_ISSUE_CLASSIFICATION_LABEL_MAP: Record<TECHNICAL_ISSUE_CLASSIFICATION, string> = {
	NOT_A_BUG: "Not a Bug",
	VALID_BUG: "Valid Technical Bug",
};

/* ─────────────────────────────
 * Action Filter Labels
 * ───────────────────────────── */
export const TECHNICAL_ISSUE_ACTION_FILTER_LABEL_MAP: Record<TECHNICAL_ISSUE_ACTION_FILTER, string> = {
	[TECHNICAL_ISSUE_ACTION_FILTER.TAKE_ACTION]: "Action Taken",
	[TECHNICAL_ISSUE_ACTION_FILTER.NOT_TAKE_ACTION]: "Action Not Taken",
};
