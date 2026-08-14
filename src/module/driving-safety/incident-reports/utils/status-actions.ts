import { JOB_SITE_SAFETY_REVIEWER_ROLE } from "@/module/admin-job-site-safety/enums";

import { IIncidentReportRow } from "../types";
import { ACCIDENT_STATUS_ACTION, INCIDENT_REPORT_STATUS, INCIDENT_TYPE } from "./enums";

export const ACCIDENT_STATUS_ACTION_LABEL: Record<ACCIDENT_STATUS_ACTION, string> = {
	[ACCIDENT_STATUS_ACTION.MARK_FOR_PRESIDENT_REVIEW]: "Mark for President's Review",
	[ACCIDENT_STATUS_ACTION.APPROVE_AND_SEND_TO_INSURANCE]: "Approve & Send to Insurance",
	[ACCIDENT_STATUS_ACTION.RESOLVE_INTERNALLY]: "Resolve Internally",
	[ACCIDENT_STATUS_ACTION.MARK_RESOLVED]: "Mark as Resolved",
};

export const ACCIDENT_STATUS_ACTION_SUCCESS: Record<ACCIDENT_STATUS_ACTION, string> = {
	[ACCIDENT_STATUS_ACTION.MARK_FOR_PRESIDENT_REVIEW]: "Sent for President's review",
	[ACCIDENT_STATUS_ACTION.APPROVE_AND_SEND_TO_INSURANCE]: "Forwarded for Fleet Manager's review",
	[ACCIDENT_STATUS_ACTION.RESOLVE_INTERNALLY]: "Report resolved internally",
	[ACCIDENT_STATUS_ACTION.MARK_RESOLVED]: "Claim marked as resolved",
};

const { MARK_FOR_PRESIDENT_REVIEW, APPROVE_AND_SEND_TO_INSURANCE, RESOLVE_INTERNALLY, MARK_RESOLVED } =
	ACCIDENT_STATUS_ACTION;

// The President and Fleet Manager can skip ahead of the normal order, so the
// available actions come from the role rather than the stage reached. Only
// vehicle-accident rows carry this workflow; the third-review stage (with the
// Fleet Manager for the email) and Additional Info Requested offer nothing here.
export const resolveAccidentStatusActions = (row: IIncidentReportRow, roleName?: string): ACCIDENT_STATUS_ACTION[] => {
	if (row.type !== INCIDENT_TYPE.VEHICLE_ACCIDENT) return [];

	const isPresident = roleName === JOB_SITE_SAFETY_REVIEWER_ROLE.PRESIDENT;
	const isFleetManager = roleName === JOB_SITE_SAFETY_REVIEWER_ROLE.FLEET_MANAGER;

	switch (row.status) {
		case INCIDENT_REPORT_STATUS.PENDING:
			if (isPresident) return [APPROVE_AND_SEND_TO_INSURANCE, RESOLVE_INTERNALLY];
			if (isFleetManager) return [MARK_FOR_PRESIDENT_REVIEW, RESOLVE_INTERNALLY];
			return [MARK_FOR_PRESIDENT_REVIEW];

		case INCIDENT_REPORT_STATUS.PENDING_SECOND_REVIEW:
			if (isPresident) return [APPROVE_AND_SEND_TO_INSURANCE, RESOLVE_INTERNALLY];
			if (isFleetManager) return [RESOLVE_INTERNALLY];
			return [];

		case INCIDENT_REPORT_STATUS.WITH_INSURANCE:
			return isPresident || isFleetManager ? [MARK_RESOLVED] : [];

		default:
			return [];
	}
};
