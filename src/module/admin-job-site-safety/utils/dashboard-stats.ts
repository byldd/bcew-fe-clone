import { SAFETY_REPORT_STATUS } from "@/module/employee-safety/enums";
import { JOB_SITE_SAFETY_REPORT_TYPE } from "../enums";
import { IJobSiteSafetyDashboardRow } from "../types";

const CLOSED_STATUSES: SAFETY_REPORT_STATUS[] = [
	SAFETY_REPORT_STATUS.RESOLVED_INTERNALLY,
	SAFETY_REPORT_STATUS.RESOLVED,
];

const isOpen = (row: IJobSiteSafetyDashboardRow) => !CLOSED_STATUSES.includes(row.status);

export const buildJobSiteSafetyStats = (rows: IJobSiteSafetyDashboardRow[]) => [
	{ label: "Total Reports", value: rows.filter(isOpen).length },
	{ label: "Pending Review", value: rows.filter((row) => row.status === SAFETY_REPORT_STATUS.PENDING).length },
	{
		label: "Injury Claims open",
		value: rows.filter((row) => row.type === JOB_SITE_SAFETY_REPORT_TYPE.JOB_SITE_INJURY && isOpen(row)).length,
	},
	{
		label: "Pending 2nd review",
		value: rows.filter((row) => row.status === SAFETY_REPORT_STATUS.PENDING_SECOND_REVIEW).length,
	},
];
