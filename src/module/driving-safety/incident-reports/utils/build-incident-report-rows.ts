import { IIncidentReportRow, IIncidentReportsResponse, IRawAccidentReport, IRawBreakdownReport } from "../types";
import { ACCIDENT_REPORT_PREFIX, BREAKDOWN_REPORT_PREFIX, formatReportNumber } from "./constants";
import { INCIDENT_SOURCE, INCIDENT_TYPE } from "./enums";

// A missing source means the report came straight from a driver's submission.
const resolveSource = (source: INCIDENT_SOURCE | null): INCIDENT_SOURCE => source ?? INCIDENT_SOURCE.DRIVER;

const toAccidentRow = (report: IRawAccidentReport): IIncidentReportRow => ({
	id: report.id,
	recordNumber: formatReportNumber(ACCIDENT_REPORT_PREFIX, report.reportId, report.createdAt),
	type: INCIDENT_TYPE.VEHICLE_ACCIDENT,
	source: resolveSource(report.source),
	detail: report.describeAccident,
	employeeName: report.user?.name ?? null,
	truckNumber: report.truckNumber,
	severity: report.severity,
	dateTime: report.accidentDate ?? report.createdAt,
	location: report.location,
	status: report.status,
	createdAt: report.createdAt,
});

const toBreakdownRow = (report: IRawBreakdownReport): IIncidentReportRow => ({
	id: report.id,
	recordNumber: formatReportNumber(BREAKDOWN_REPORT_PREFIX, report.reportId, report.createdAt),
	type: INCIDENT_TYPE.VEHICLE_BREAKDOWN,
	source: resolveSource(report.source),
	detail: report.issueType?.name ?? report.description,
	employeeName: report.user?.name ?? null,
	truckNumber: report.truckNumber,
	severity: report.severity,
	dateTime: report.createdAt,
	location: null,
	status: report.incidentStatus,
	createdAt: report.createdAt,
});

export const buildIncidentReportRows = ({
	accidentReports,
	breakdownReports,
}: IIncidentReportsResponse): IIncidentReportRow[] =>
	[...accidentReports.map(toAccidentRow), ...breakdownReports.map(toBreakdownRow)].sort(
		(a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
	);
