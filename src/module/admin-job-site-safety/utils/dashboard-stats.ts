import { SAFETY_REPORT_STATUS } from "@/module/employee-safety/enums";
import { JOB_SITE_SAFETY_REPORT_TYPE } from "../enums";
import { IJobSiteSafetyDashboardRow } from "../types";

const CLOSED_STATUSES: SAFETY_REPORT_STATUS[] = [
	SAFETY_REPORT_STATUS.RESOLVED_INTERNALLY,
	SAFETY_REPORT_STATUS.RESOLVED,
];

const isOpen = (row: IJobSiteSafetyDashboardRow) => !CLOSED_STATUSES.includes(row.status);

// Violations have no reviewable status in this UI (see IS_VIOLATION_WORKFLOW_ENABLED
// in dashboard-constants.ts) — they sit at PENDING forever, so review-stage counts
// only make sense for injuries.
const isInjury = (row: IJobSiteSafetyDashboardRow) => row.type === JOB_SITE_SAFETY_REPORT_TYPE.JOB_SITE_INJURY;

export const buildJobSiteSafetyStats = (rows: IJobSiteSafetyDashboardRow[]) => [
	{ label: "Total Reports", value: rows.filter(isOpen).length },
	{
		label: "Pending Review",
		value: rows.filter((row) => isInjury(row) && row.status === SAFETY_REPORT_STATUS.PENDING).length,
	},
	{
		label: "Injury Claims Open",
		value: rows.filter((row) => isInjury(row) && isOpen(row)).length,
	},
	{
		label: "Pending 2nd Review",
		value: rows.filter((row) => isInjury(row) && row.status === SAFETY_REPORT_STATUS.PENDING_SECOND_REVIEW).length,
	},
];
