import { FALLBACK } from "@/module/job-level-details/constants";
import {
	IIncidentReportRow,
	IIncidentReportsResponse,
	IRawAccidentReport,
	IRawBreakdownReport,
	IRawLegacyAccidentReport,
	IRawLegacyBreakdownReport,
	IRawSafetyViolationReport,
	IRawViolationReport,
} from "../types";
import {
	ACCIDENT_REPORT_PREFIX,
	asUtcInstant,
	BREAKDOWN_REPORT_PREFIX,
	formatReportNumber,
	VIOLATION_REPORT_PREFIX,
} from "./constants";
import { INCIDENT_SOURCE, INCIDENT_TYPE } from "./enums";
import { resolveLegacyStatus } from "./legacy-accident";

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

const toSafetyViolationRow = (report: IRawSafetyViolationReport): IIncidentReportRow => ({
	id: report.id,
	recordNumber: report.geotabId,
	type: INCIDENT_TYPE.DRIVING_SAFETY_VIOLATION,
	source: INCIDENT_SOURCE.GEOTAB,
	detail: report.description,
	employeeName: report.employeeName,
	truckNumber: report.truck,
	severity: null,
	dateTime: report.activeFrom ? asUtcInstant(report.activeFrom) : null,
	location: report.latitude !== null && report.longitude !== null ? `${report.latitude}, ${report.longitude}` : null,
	status: null,
	statusLabel: report.decision,
	geotabId: report.geotabId,
	createdAt: asUtcInstant(report.activeFrom ?? report.recordLastChangedUtc),
});

const toLegacyAccidentRow = (report: IRawLegacyAccidentReport): IIncidentReportRow => {
	const id = report.id.trim();
	const dateTime = report.acc_dte ? asUtcInstant(report.acc_dte) : null;
	const { status, label } = resolveLegacyStatus(report.report_status);
	return {
		id,
		recordNumber: id,
		type: INCIDENT_TYPE.VEHICLE_ACCIDENT,
		source: INCIDENT_SOURCE.MANUAL,
		detail: report.eqpmnt_dam,
		employeeName: report.emp_nme,
		truckNumber: report.eqpmnt_recnum,
		severity: null,
		dateTime,
		location: report.acc_loc,
		status,
		statusLabel: label,
		isLegacyImport: true,
		createdAt: dateTime ?? new Date(0).toISOString(),
	};
};

const toLegacyBreakdownRow = (report: IRawLegacyBreakdownReport): IIncidentReportRow => {
	const dateTime = report.date ? asUtcInstant(report.date) : null;
	return {
		id: report.id,
		recordNumber: report.id,
		type: INCIDENT_TYPE.VEHICLE_BREAKDOWN,
		source: INCIDENT_SOURCE.MANUAL,
		detail: report.issue,
		employeeName: report.employeeName,
		truckNumber: report.eqpmnt_recnum,
		severity: null,
		dateTime,
		location: null,
		status: null,
		isLegacyImport: true,
		createdAt: dateTime ?? new Date(0).toISOString(),
	};
};

export const buildIncidentReportRows = ({
	accidentReports,
	breakdownReports,
	violationReports,
	safetyViolationReports,
	legacyAccidentReports,
	legacyBreakdownReports,
}: IIncidentReportsResponse): IIncidentReportRow[] =>
	[
		...accidentReports.map(toAccidentRow),
		...breakdownReports.map(toBreakdownRow),
		...violationReports.map(toViolationRow),
		...safetyViolationReports.map(toSafetyViolationRow),
		...legacyAccidentReports.map(toLegacyAccidentRow),
		...legacyBreakdownReports.map(toLegacyBreakdownRow),
	].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

export const displayYesNo = (value: boolean | null): string => (value === null ? FALLBACK : value ? "Yes" : "No");
