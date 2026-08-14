import { REPORT_SOURCE } from "@/module/employee-safety/enums";
import { JOB_SITE_SAFETY_REPORT_TYPE } from "../enums";
import {
	IJobSiteSafetyDashboardResponse,
	IJobSiteSafetyDashboardRow,
	IRawJobSiteInjuryReport,
	IRawJobSiteSafetyViolation,
} from "../types";
import {
	JOB_SITE_INJURY_REPORT_PREFIX,
	JOB_SITE_SAFETY_VIOLATION_REPORT_PREFIX,
	formatJobSiteSafetyReportNumber,
} from "./dashboard-constants";

// A missing source means the report came straight from the technician's own submission.
const resolveSource = (source: REPORT_SOURCE | null): REPORT_SOURCE => source ?? REPORT_SOURCE.EMPLOYEE;

const toInjuryRow = (report: IRawJobSiteInjuryReport): IJobSiteSafetyDashboardRow => ({
	id: report.id,
	recordNumber: formatJobSiteSafetyReportNumber(JOB_SITE_INJURY_REPORT_PREFIX, report.reportId, report.createdAt),
	source: resolveSource(report.source),
	type: JOB_SITE_SAFETY_REPORT_TYPE.JOB_SITE_INJURY,
	employeeName: report.user?.name ?? null,
	jobSiteName: report.jobSiteName,
	detail: report.howInjuryOccurred ?? "--",
	dateTime: report.injuryDate ?? report.createdAt,
	status: report.status,
	approvedForInsuranceAt: report.approvedForInsuranceAt,
	createdAt: report.createdAt,
});

const toViolationRow = (violation: IRawJobSiteSafetyViolation): IJobSiteSafetyDashboardRow => ({
	id: violation.id,
	recordNumber: formatJobSiteSafetyReportNumber(
		JOB_SITE_SAFETY_VIOLATION_REPORT_PREFIX,
		violation.reportId,
		violation.createdAt
	),
	source: resolveSource(violation.source),
	type: JOB_SITE_SAFETY_REPORT_TYPE.JOB_SITE_SAFETY_VIOLATION,
	employeeName: violation.user?.name ?? null,
	jobSiteName: violation.jobSiteName,
	detail: violation.description,
	dateTime: violation.violationDate,
	status: violation.status,
	approvedForInsuranceAt: violation.approvedForInsuranceAt,
	createdAt: violation.createdAt,
});

export const buildJobSiteSafetyDashboardRows = ({
	injuryReports,
	violations,
}: IJobSiteSafetyDashboardResponse): IJobSiteSafetyDashboardRow[] =>
	[...injuryReports.map(toInjuryRow), ...violations.map(toViolationRow)].sort(
		(a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
	);
