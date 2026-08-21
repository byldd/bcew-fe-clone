import {
	JOB_SITE_TYPE,
	MEDICAL_DRUG_SCREEN,
	OTHER_VEHICLE_IMAGE_CATEGORY,
	PERSON_STRUCK_TYPE,
	VEHICLE_ACCIDENT_PHOTO_CATEGORY,
	WEATHER_CONDITION,
} from "@/module/employee-safety/enums";
import { IDrivingSafetyViolationType } from "@/module/driving-safety/policies/types";

import {
	INCIDENT_ACTOR_ROLE,
	INCIDENT_AUDIT_ACTION,
	INCIDENT_REPORT_STATUS,
	INCIDENT_SEVERITY,
	INCIDENT_SOURCE,
	INCIDENT_TYPE,
	SECOND_REVIEW_ACTION,
	THIRD_REVIEW_ACTION,
} from "../utils/enums";

export interface IUpdateIncidentSeverityPayload {
	id: string;
	type: INCIDENT_TYPE;
	severity: INCIDENT_SEVERITY;
}

export interface IIncidentReportRow {
	id: string;
	recordNumber: string;
	type: INCIDENT_TYPE;
	source: INCIDENT_SOURCE;
	detail: string | null;
	employeeName: string | null;
	truckNumber: string | null;
	severity: INCIDENT_SEVERITY | null;
	dateTime: string | null;
	location: string | null;
	// Violations have no review workflow, so they carry no status.
	status: INCIDENT_REPORT_STATUS | null;
	statusLabel?: string | null;
	geotabId?: string | null;
	isLegacyImport?: boolean;
	createdAt: string;
}

interface IIncidentReportNameRelation {
	name: string;
}

export interface IRawAccidentReport {
	id: string;
	reportId: number;
	status: INCIDENT_REPORT_STATUS;
	severity: INCIDENT_SEVERITY | null;
	source: INCIDENT_SOURCE | null;
	truckNumber: string | null;
	describeAccident: string | null;
	location: string | null;
	accidentDate: string | null;
	createdAt: string;
	user: IIncidentReportNameRelation | null;
}

export interface IRawBreakdownReport {
	id: string;
	reportId: number;
	incidentStatus: INCIDENT_REPORT_STATUS;
	severity: INCIDENT_SEVERITY | null;
	source: INCIDENT_SOURCE | null;
	truckNumber: string | null;
	description: string | null;
	createdAt: string;
	user: IIncidentReportNameRelation | null;
	issueType: IIncidentReportNameRelation | null;
}

export interface IRawViolationReport {
	id: string;
	reportId: number;
	severity: INCIDENT_SEVERITY | null;
	truckNumber: string | null;
	description: string | null;
	violationDate: string | null;
	createdAt: string;
	user: IIncidentReportNameRelation | null;
	violationType: IIncidentReportNameRelation | null;
}

// GeoTab safety-violation feed (legacy bcew view). No review workflow — its Decision
// column stands in for status (unresolved → Pending, otherwise Resolved).
export interface IRawSafetyViolationReport {
	id: string;
	geotabId: string;
	employeeName: string | null;
	truck: string | null;
	description: string | null;
	activeFrom: string | null;
	latitude: number | null;
	longitude: number | null;
	decision: string | null;
	recordLastChangedUtc: string;
}

export interface IRawLegacyAccidentReport {
	id: string;
	emp_nme: string | null;
	eqpmnt_recnum: string | null;
	eqpmnt_dam: string | null;
	acc_loc: string | null;
	acc_dte: string | null;
	report_status: number | null;
}

export interface IRawLegacyBreakdownReport {
	id: string;
	eqpmnt_recnum: string;
	request: string | null;
	date: string | null;
	issue: string | null;
	Notes: string | null;
	add_dte: string | null;
	employeeName: string | null;
}

export interface IIncidentReportsResponse {
	accidentReports: IRawAccidentReport[];
	breakdownReports: IRawBreakdownReport[];
	violationReports: IRawViolationReport[];
	safetyViolationReports: IRawSafetyViolationReport[];
	legacyAccidentReports: IRawLegacyAccidentReport[];
	legacyBreakdownReports: IRawLegacyBreakdownReport[];
}

interface IAccidentReviewDocument {
	id: string;
	category: VEHICLE_ACCIDENT_PHOTO_CATEGORY;
	url: string;
	keyFile: string;
}

interface IAccidentReviewOtherVehicle {
	make: string | null;
	model: string | null;
	whatWasStruck: string | null;
	vin: string | null;
	driverFullName: string | null;
	driverLicenseNumber: string | null;
	refusedDriverLicense: boolean;
	refusedInsuranceCard: boolean;
	refusedDriverLicensePhoto: boolean;
	images: { id: string; url: string; keyFile: string; category: OTHER_VEHICLE_IMAGE_CATEGORY | null }[];
}

interface IAccidentReviewPropertyDamage {
	anotherCompanyProperty: boolean | null;
	companyName: string | null;
	contactPersonName: string | null;
	contactPhoneNumber: string | null;
	otherInformation: string | null;
	builderProperty: boolean | null;
	homeownerProperty: boolean | null;
}

interface IAccidentReviewPersonInvolved {
	whoWasStruck: PERSON_STRUCK_TYPE | null;
	employeeId: string | null;
	employeeInjured: boolean | null;
	fullName: string | null;
	phoneNumber: string | null;
	injuryDescription: string | null;
}

interface IAccidentReviewInjury {
	bodyPartInjured: string;
	natureOfInjury: string;
	painLevel: string;
	firstAidProvided: boolean;
	treatingPhysicianClinic: string;
	didLeaveWork: boolean;
	workRestrictions: string | null;
	additionalNotes: string | null;
}

// Everything the admin accident review page renders.
export interface IAccidentReviewDetail {
	id: string;
	reportId: number;
	status: INCIDENT_REPORT_STATUS;
	severity: INCIDENT_SEVERITY | null;
	source: INCIDENT_SOURCE | null;

	onJobSite: boolean | null;
	jobSiteType: JOB_SITE_TYPE | null;
	anotherVehicleInvolved: boolean;
	otherVehicleCount: number | null;
	personStruck: boolean;

	truckNumber: string | null;
	vin: string | null;
	licensePlate: string | null;
	driverLicenseNumber: string | null;

	accidentDate: string | null;
	location: string | null;
	nearestCrossStreet: string | null;
	speedLimit: number | null;
	weather: WEATHER_CONDITION | null;

	describeAccident: string | null;
	damageToBcewVehicle: string | null;
	damageToOtherProperty: string | null;

	policeContacted: boolean;
	policeDepartment: string | null;
	policeReportNumber: string | null;

	// null = the admin has not answered yet (distinct from an explicit "No" / false).
	bcewVehicleTowed: boolean | null;
	towProviderName: string | null;
	// Prisma Decimal columns — serialized as strings over the wire.
	towCostOnSpot: string | number | null;
	otherVehicleTowed: boolean | null;
	otherVehicleTowCost: string | number | null;
	vehicleImpounded: boolean | null;
	impoundLotCost: string | number | null;
	impoundReleaseCharges: string | number | null;

	medicalDrugScreen: MEDICAL_DRUG_SCREEN;
	drugScreenNeeded: boolean | null;
	medicalCareNeeded: boolean | null;
	drugScreenLocation: string | null;
	medicalTreatmentLocation: string | null;
	isMedicalTreatmentLocationOther: boolean | null;

	violationTypeId: string | null;
	pointsApplied: number | null;
	pointOverrideReason: string | null;

	submittedAt: string | null;
	reviewedAt: string | null;
	createdAt: string;

	user?: IIncidentReportNameRelation & { id: string; cellPhone: string | null };
	reviewedByUser?: IIncidentReportNameRelation & { id: string };
	violationType?: Pick<IDrivingSafetyViolationType, "id" | "name" | "points">;
	otherVehicles: IAccidentReviewOtherVehicle[];
	propertyDamage?: IAccidentReviewPropertyDamage | null;
	personInvolved?: IAccidentReviewPersonInvolved | null;
	injury?: IAccidentReviewInjury | null;
	photos: IAccidentReviewDocument[];
}

export interface IApproveAccidentReportPayload {
	violationTypeId: string;
	overrideReason: string | null;
	documents: { category: VEHICLE_ACCIDENT_PHOTO_CATEGORY; keyFile: string }[];
}

export interface ISafetyViolationDetail {
	id: string;
	geotabId: string;
	employeeName: string | null;
	truck: string | null;
	violationType: string | null;
	description: string | null;
	pointWeight: number | null;
	activeFrom: string | null;
	decision: string | null;
	latitude: number | null;
	longitude: number | null;
}

export interface IRawLegacyOtherVehicle {
	ID: string;
	Year: string | null;
	MakeModel: string | null;
	VIN: string | null;
	Damage: string | null;
	oth_drv_nme: string | null;
	oth_drv_lic: string | null;
	oth_drv_phn: string | null;
	oth_drv_ins_cmp: string | null;
	oth_drv_ins_num: string | null;
	oth_veh_tow: boolean | null;
}

export interface IRawLegacyAccidentDetail {
	id: string;
	emp_nme: string | null;
	emp_add: string | null;
	emp_phn: string | null;
	emp_lic: string | null;
	eqpmnt_recnum: string | null;
	eqpmnt_vin: string | null;
	eqpmnt_lic: string | null;
	eqpmnt_dam: string | null;
	acc_loc: string | null;
	cross_st: string | null;
	acc_dte: string | null;
	weather: string | null;
	pol_cont: string | null;
	pol_dept: string | null;
	pol_rep_num: string | null;
	wit_nme: string | null;
	wit_add: string | null;
	wit_phn: string | null;
	drug_scr: string | null;
	med_treat: string | null;
	med_treat_loc: string | null;
	injury_report: string | null;
	veh_tow: boolean | null;
	report_status: number | null;
	FM_OtherVehiclesTable: IRawLegacyOtherVehicle[];
}

export interface ILegacyOtherVehicle {
	id: string;
	year: string | null;
	makeModel: string | null;
	vin: string | null;
	damage: string | null;
	driverName: string | null;
	driverLicense: string | null;
	driverPhone: string | null;
	insuranceCompany: string | null;
	insuranceNumber: string | null;
	vehicleTowed: boolean | null;
}

export interface ILegacyAccidentDetail {
	id: string;
	employeeName: string | null;
	employeeAddress: string | null;
	employeePhone: string | null;
	employeeLicense: string | null;
	truckNumber: string | null;
	vin: string | null;
	licensePlate: string | null;
	vehicleDamage: string | null;
	location: string | null;
	crossStreet: string | null;
	accidentDate: string | null;
	weather: string | null;
	policeContacted: string | null;
	policeDepartment: string | null;
	policeReportNumber: string | null;
	witnessName: string | null;
	witnessAddress: string | null;
	witnessPhone: string | null;
	drugScreen: string | null;
	medicalTreatment: string | null;
	medicalTreatmentLocation: string | null;
	injuryReport: string | null;
	vehicleTowed: boolean | null;
	status: INCIDENT_REPORT_STATUS;
	statusLabel: string;
	otherVehicles: ILegacyOtherVehicle[];
}

export interface IRawLegacyBreakdownDetail extends IRawLegacyBreakdownReport {
	complete: number | null;
}

export interface ILegacyBreakdownDetail {
	id: string;
	recordNumber: string;
	truckNumber: string | null;
	employeeName: string | null;
	issue: string | null;
	description: string | null;
	notes: string | null;
	date: string | null;
}

export interface IViolationReportDetail {
	id: string;
	reportId: number;
	truckNumber: string | null;
	severity: INCIDENT_SEVERITY | null;
	points: number | null;
	violationDate: string | null;
	description: string | null;
	createdAt: string;
	user: IIncidentReportNameRelation | null;
	violationType: IIncidentReportNameRelation | null;
	documents: { id: string; url: string; keyFile: string }[];
}

export interface IBreakdownReportDetail {
	id: string;
	reportId: number;
	truckNumber: string | null;
	description: string | null;
	bcewVehicleTowed: boolean;
	costOnSpot: string | null;
	createdAt: string;
	user: IIncidentReportNameRelation | null;
	issueCategory: IIncidentReportNameRelation | null;
	issueType: IIncidentReportNameRelation | null;
}

export interface IUpdateBreakdownCostPayload {
	costOnSpot: number | null;
	bcewVehicleTowed: boolean;
}

// Tow/impound & medical inputs the admin fills in before the first review.
// The Yes/No questions are nullable: null = unanswered, true = Yes, false = No.
export interface IAccidentAdminInputs {
	bcewVehicleTowed: boolean | null;
	towProviderName: string | null;
	towCostOnSpot: number | null;
	otherVehicleTowed: boolean | null;
	otherVehicleTowCost: number | null;
	vehicleImpounded: boolean | null;
	impoundLotCost: number | null;
	impoundReleaseCharges: number | null;
	drugScreenNeeded: boolean | null;
	medicalCareNeeded: boolean | null;
	medicalTreatmentLocation: string | null;
	isMedicalTreatmentLocationOther: boolean;
}

export interface IAssignSecondReviewPayload extends Omit<IApproveAccidentReportPayload, "violationTypeId"> {
	violationTypeId: string | null;
	adminInputs?: IAccidentAdminInputs;
}

export interface IRequestTechnicianInfoPayload extends IAssignSecondReviewPayload {
	requestedSections: string[];
}

export interface ISecondReviewActionPayload extends Partial<IAssignSecondReviewPayload> {
	action: SECOND_REVIEW_ACTION;
}

export interface IInsuranceEmailContent {
	intro: string;
	closing: string;
}

export interface IThirdReviewActionPayload extends Partial<IAssignSecondReviewPayload> {
	action: THIRD_REVIEW_ACTION;
	emailContent?: IInsuranceEmailContent;
}

export interface IInsuranceEmailDraft {
	from: string;
	to: string;
	cc: string;
	subject: string;
	intro: string;
	closing: string;
	bodyHtml: string;
}

export interface IAuditFieldChange {
	fieldName: string;
	fromValue: string;
	toValue: string;
}

export interface IAccidentAuditEntry {
	id: string;
	action: INCIDENT_AUDIT_ACTION;
	role: INCIDENT_ACTOR_ROLE;
	actorName: string | null;
	fieldName: string | null;
	fromValue: string | null;
	toValue: string | null;
	changes: IAuditFieldChange[] | null;
	createdAt: string;
}
