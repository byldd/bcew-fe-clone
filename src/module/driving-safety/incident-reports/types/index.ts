import {
	MEDICAL_DRUG_SCREEN,
	VEHICLE_ACCIDENT_PHOTO_CATEGORY,
	WEATHER_CONDITION,
} from "@/module/employee-safety/enums";
import { IDrivingSafetyViolationType } from "@/module/driving-safety/policies/types";

import { INCIDENT_REPORT_STATUS, INCIDENT_SEVERITY, INCIDENT_SOURCE, INCIDENT_TYPE } from "../utils/enums";

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
	status: INCIDENT_REPORT_STATUS;
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

export interface IIncidentReportsResponse {
	accidentReports: IRawAccidentReport[];
	breakdownReports: IRawBreakdownReport[];
}

interface IAccidentReviewDocument {
	id: string;
	category: VEHICLE_ACCIDENT_PHOTO_CATEGORY;
	url: string;
	keyFile: string;
}

interface IAccidentReviewOtherVehicle {
	refusedToProvideInfo: boolean;
	make: string | null;
	model: string | null;
	whatWasStruck: string | null;
	vin: string | null;
	driverFullName: string | null;
	driverLicenseNumber: string | null;
	driverPhoneNumber: string | null;
	insuranceCompany: string | null;
	policyNumber: string | null;
	images: { id: string; url: string; keyFile: string }[];
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
	anotherVehicleInvolved: boolean;
	personStruck: boolean;

	truckNumber: string | null;
	vin: string | null;
	licensePlate: string | null;

	accidentDate: string | null;
	location: string | null;
	nearestCrossStreet: string | null;
	weather: WEATHER_CONDITION | null;

	describeAccident: string | null;
	damageToBcewVehicle: string | null;
	damageToOtherProperty: string | null;

	policeContacted: boolean;
	policeDepartment: string | null;
	policeReportNumber: string | null;

	bcewVehicleTowed: boolean;
	towProviderName: string | null;
	// Prisma Decimal columns — serialized as strings over the wire.
	towCostOnSpot: string | number | null;
	otherVehicleTowed: boolean;
	otherVehicleTowCost: string | number | null;
	vehicleImpounded: boolean;
	impoundLotCost: string | number | null;
	impoundReleaseCharges: string | number | null;

	medicalDrugScreen: MEDICAL_DRUG_SCREEN;
	drugScreenLocation: string | null;
	medicalTreatmentLocation: string | null;

	violationTypeId: string | null;
	pointsApplied: number | null;
	pointOverrideReason: string | null;

	submittedAt: string | null;
	reviewedAt: string | null;
	createdAt: string;

	user?: IIncidentReportNameRelation & { id: string };
	reviewedByUser?: IIncidentReportNameRelation & { id: string };
	violationType?: Pick<IDrivingSafetyViolationType, "id" | "name" | "points">;
	otherVehicle?: IAccidentReviewOtherVehicle | null;
	injury?: IAccidentReviewInjury | null;
	photos: IAccidentReviewDocument[];
}

export interface IApproveAccidentReportPayload {
	violationTypeId: string;
	overrideReason: string | null;
	documents: { category: VEHICLE_ACCIDENT_PHOTO_CATEGORY; keyFile: string }[];
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
