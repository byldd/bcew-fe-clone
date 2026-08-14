import { SAFETY_REPORT_STATUS } from "@/module/employee-safety/enums";
import { JOB_SITE_SAFETY_REVIEWER_ROLE, JOB_SITE_SAFETY_STATUS_ACTION } from "../enums";
import { IJobSiteSafetyDashboardRow } from "../types";
import { hasJobSiteSafetyWorkflow } from "./dashboard-constants";

export const JOB_SITE_SAFETY_STATUS_ACTION_LABEL: Record<JOB_SITE_SAFETY_STATUS_ACTION, string> = {
	[JOB_SITE_SAFETY_STATUS_ACTION.MARK_FOR_PRESIDENT_REVIEW]: "Mark for President's Review",
	[JOB_SITE_SAFETY_STATUS_ACTION.APPROVE_AND_SEND_TO_INSURANCE]: "Approve & Send to Insurance",
	[JOB_SITE_SAFETY_STATUS_ACTION.APPROVE_INTERNALLY]: "Resolve Internally",
	[JOB_SITE_SAFETY_STATUS_ACTION.MARK_RESOLVED]: "Mark as Resolved",
};

export const JOB_SITE_SAFETY_STATUS_ACTION_SUCCESS: Record<JOB_SITE_SAFETY_STATUS_ACTION, string> = {
	[JOB_SITE_SAFETY_STATUS_ACTION.MARK_FOR_PRESIDENT_REVIEW]: "Marked for President's review",
	[JOB_SITE_SAFETY_STATUS_ACTION.APPROVE_AND_SEND_TO_INSURANCE]: "Approved — sent for Fleet Manager's review",
	[JOB_SITE_SAFETY_STATUS_ACTION.APPROVE_INTERNALLY]: "Report resolved internally",
	[JOB_SITE_SAFETY_STATUS_ACTION.MARK_RESOLVED]: "Report marked resolved",
};

const { MARK_FOR_PRESIDENT_REVIEW, APPROVE_AND_SEND_TO_INSURANCE, APPROVE_INTERNALLY, MARK_RESOLVED } =
	JOB_SITE_SAFETY_STATUS_ACTION;

// The President and Fleet Manager can deliberately skip ahead of the normal
// order, so the available actions come from the role rather than from the stage
// the report happens to have reached.
export const resolveJobSiteSafetyStatusActions = (
	row: IJobSiteSafetyDashboardRow,
	roleName?: string
): JOB_SITE_SAFETY_STATUS_ACTION[] => {
	if (!hasJobSiteSafetyWorkflow(row)) return [];

	const isPresident = roleName === JOB_SITE_SAFETY_REVIEWER_ROLE.PRESIDENT;
	const isFleetManager = roleName === JOB_SITE_SAFETY_REVIEWER_ROLE.FLEET_MANAGER;

	switch (row.status) {
		case SAFETY_REPORT_STATUS.PENDING:
			if (isPresident) return [APPROVE_AND_SEND_TO_INSURANCE, APPROVE_INTERNALLY];
			if (isFleetManager) return [MARK_FOR_PRESIDENT_REVIEW, APPROVE_INTERNALLY];
			return [MARK_FOR_PRESIDENT_REVIEW];

		case SAFETY_REPORT_STATUS.PENDING_SECOND_REVIEW:
			// Once the President has committed the report to insurance, nobody can
			// pull it back internally — the only step left is the Fleet Manager
			// sending the email from the review page.
			if (row.approvedForInsuranceAt) return [];
			if (isPresident) return [APPROVE_AND_SEND_TO_INSURANCE, APPROVE_INTERNALLY];
			if (isFleetManager) return [APPROVE_INTERNALLY];
			return [];

		case SAFETY_REPORT_STATUS.SUBMITTED_TO_INSURANCE:
			return isPresident || isFleetManager ? [MARK_RESOLVED] : [];

		default:
			return [];
	}
};
