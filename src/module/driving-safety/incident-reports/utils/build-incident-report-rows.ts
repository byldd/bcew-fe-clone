import {
	IIncidentReportRow,
	IIncidentReportsResponse,
	IRawAccidentReport,
	IRawBreakdownReport,
	IRawSafetyViolationReport,
	IRawViolationReport,
} from "../types";
import {
	ACCIDENT_REPORT_PREFIX,
	BREAKDOWN_REPORT_PREFIX,
	formatReportNumber,
	VIOLATION_REPORT_PREFIX,
} from "./constants";
import { INCIDENT_REPORT_STATUS, INCIDENT_SOURCE, INCIDENT_TYPE } from "./enums";

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

// Office-entered violations always originate from an admin; the model has no
// source column of its own.
const toViolationRow = (report: IRawViolationReport): IIncidentReportRow => ({
	id: report.id,
	recordNumber: formatReportNumber(VIOLATION_REPORT_PREFIX, report.reportId, report.createdAt),
	type: INCIDENT_TYPE.DRIVING_SAFETY_VIOLATION,
	source: INCIDENT_SOURCE.ADMIN,
	detail: report.violationType?.name ?? report.description,
	employeeName: report.user?.name ?? null,
	truckNumber: report.truckNumber,
	severity: report.severity,
	dateTime: report.violationDate ?? report.createdAt,
	location: null,
	status: null,
	createdAt: report.createdAt,
});

// The bcew view returns timezone-naive datetimes (no trailing Z), so the shared
// cell's toLocalFormattedDate would read them as already-local and never convert.
// Tag them as the UTC instants they are so the local conversion happens. No-op if
// the value already carries a zone designator.
const asUtcInstant = (value: string): string => (/[zZ]|[+-]\d{2}:?\d{2}$/.test(value) ? value : `${value}Z`);

// GeoTab-sourced driving safety violations; carry no severity or review workflow.
// A blank Decision means it hasn't been acted on yet (Pending), otherwise Resolved.
const toSafetyViolationRow = (report: IRawSafetyViolationReport): IIncidentReportRow => ({
	id: report.id,
	recordNumber: report.id,
	type: INCIDENT_TYPE.DRIVING_SAFETY_VIOLATION,
	source: INCIDENT_SOURCE.GEOTAB,
	detail: report.description,
	employeeName: report.employeeName,
	truckNumber: report.truck,
	severity: null,
	dateTime: report.activeFrom ? asUtcInstant(report.activeFrom) : null,
	location: report.latitude !== null && report.longitude !== null ? `${report.latitude}, ${report.longitude}` : null,
	status: report.decision ? INCIDENT_REPORT_STATUS.RESOLVED : INCIDENT_REPORT_STATUS.PENDING,
	geotabId: report.geotabId,
	createdAt: asUtcInstant(report.activeFrom ?? report.recordLastChangedUtc),
});

export const buildIncidentReportRows = ({
	accidentReports,
	breakdownReports,
	violationReports,
	safetyViolationReports,
}: IIncidentReportsResponse): IIncidentReportRow[] =>
	[
		...accidentReports.map(toAccidentRow),
		...breakdownReports.map(toBreakdownRow),
		...violationReports.map(toViolationRow),
		...safetyViolationReports.map(toSafetyViolationRow),
	].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
