import { IJobSiteInjuryReportDetail, ISaveJobSiteInjuryPayload } from "@/module/employee-safety/types";
import { REPORT_SOURCE, SAFETY_REPORT_STATUS } from "@/module/employee-safety/enums";
import { INCIDENT_SEVERITY } from "@/module/driving-safety/incident-reports/utils/enums";
import { JOB_SITE_SAFETY_LIFECYCLE_EVENT, JOB_SITE_SAFETY_REPORT_TYPE } from "../enums";

// Active employee for the "Select Employee" dropdown, with the same
// Occupation/Phone/Date of birth/Date of hire fields the technician form shows for itself.
export type IActiveEmployeeContact = {
	employeeId: string;
	userId: string;
	name: string;
	cellPhone: string | null;
	occupation: string | null;
	hireDate: string | null;
	dateOfBirth: string | null;
};

export type IAdminSaveJobSiteInjuryPayload = ISaveJobSiteInjuryPayload & {
	employeeId: string;
};

export type ICreateViolationPayload = {
	employeeId: string;
	jobDailyRecordId: string | null;
	description: string | null;
	violationDate: string | null;
	severity?: string;
	locationOnSite: string | null;
	photos: { keyFile: string; url: string }[];
};

export type IJobSiteSafetyViolation = {
	id: string;
	reportId: number;
	status: string;
};

export interface IReportEmployeeRelation {
	name: string;
}

export interface IJobSiteSafetyEmailDraft {
	from: string;
	to: string;
	cc: string;
	subject: string;
	intro: string;
	closing: string;
}

export interface IRawJobSiteInjuryReport {
	id: string;
	reportId: number;
	status: SAFETY_REPORT_STATUS;
	source: REPORT_SOURCE | null;
	approvedForInsuranceAt: string | null;
	injuryDate: string | null;
	howInjuryOccurred: string | null;
	createdAt: string;
	jobSiteName: string | null;
	user: IReportEmployeeRelation | null;
}

export interface IRawJobSiteSafetyViolation {
	id: string;
	reportId: number;
	status: SAFETY_REPORT_STATUS;
	source: REPORT_SOURCE | null;
	approvedForInsuranceAt: string | null;
	violationDate: string;
	description: string;
	severity?: INCIDENT_SEVERITY | null;
	createdAt: string;
	jobSiteName: string | null;
	user: IReportEmployeeRelation | null;
}

export interface IJobSiteSafetyDashboardResponse {
	injuryReports: IRawJobSiteInjuryReport[];
	violations: IRawJobSiteSafetyViolation[];
}

// Admin view of a submitted injury report — the base detail plus the relations
// only the admin's GET-by-id endpoint resolves (employee name, report number, job site).
export type IJobSiteInjuryReviewDetail = Omit<IJobSiteInjuryReportDetail, "status"> & {
	status: SAFETY_REPORT_STATUS;
	reportId: number;
	createdAt: string;
	jobSiteName: string | null;
	user: IReportEmployeeRelation | null;
};

export interface IJobSiteSafetyDashboardRow {
	id: string;
	recordNumber: string;
	source: REPORT_SOURCE;
	type: JOB_SITE_SAFETY_REPORT_TYPE;
	employeeName: string | null;
	jobSiteName: string | null;
	detail: string;
	dateTime: string;
	status: SAFETY_REPORT_STATUS;
	approvedForInsuranceAt: string | null;
	createdAt: string;
}

// Full injury report returned by GET /admin/job-site-safety/job-site-injury/:id
// — used both by the Review page display and the Continue/Edit resume flow.
export type IAdminJobSiteInjuryReportDetail = Omit<IJobSiteInjuryReportDetail, "status"> & {
	employeeId: string | null;
	reportId: number;
	status: SAFETY_REPORT_STATUS;
	source: REPORT_SOURCE | null;
	createdAt: string;
	approvedForInsuranceAt: string | null;
	jobSiteName: string | null;
	lifecycleEvents: ILifecycleEvent[];
};

export interface ILifecycleChange {
	label: string;
	fromValue: string | null;
	toValue: string | null;
}

export interface ILifecycleEvent {
	id: string;
	type: JOB_SITE_SAFETY_LIFECYCLE_EVENT;
	actorRoleName: string | null;
	createdAt: string;
	actorUser: IReportEmployeeRelation | null;
	changes: ILifecycleChange[];
}

export interface IViolationReportDetail {
	id: string;
	reportId: number;
	status: SAFETY_REPORT_STATUS;
	source: REPORT_SOURCE | null;
	description: string;
	violationDate: string;
	severity: INCIDENT_SEVERITY | null;
	locationOnSite: string | null;
	createdAt: string;
	approvedForInsuranceAt: string | null;
	employeeId: string | null;
	jobDailyRecordId: string | null;
	jobSiteName: string | null;
	user: IReportEmployeeRelation | null;
	photos: { id: string; url: string; keyFile: string }[];
	lifecycleEvents: ILifecycleEvent[];
}
