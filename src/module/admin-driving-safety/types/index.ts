import { INCIDENT_REPORT_STATUS } from "@/module/driving-safety/incident-reports/utils/enums";
import { IAccidentImagePayload, IAccidentReportDetail, IPropertyDamagePayload } from "@/module/employee-safety/types";

export type IAdminCreateBreakdownPayload = {
	truckNumber: string;
	issueCategoryId: string;
	issueTypeId: string;
	description?: string;
	bcewVehicleTowed: boolean;
	costOnSpot: number | null;
};

export type IFleetTruckOption = {
	truckNumber: string;
	eqpmntRecnum: number | null;
};

export type ICreateDrivingSafetyViolationPayload = {
	employeeId: string;
	truckNumber: string;
	violationTypeId: string;
	severity?: string;
	violationDate: string;
	description: string;
	documents: { keyFile: string; url: string }[];
};

export type IDrivingSafetyViolationReport = {
	id: string;
	reportId: number;
};

export type IAdminAccidentTruckOption = {
	truckNumber: string;
	vin: string | null;
	licensePlate: string | null;
	eqpmntRecnum: number | null;
};

export type IAdminCreateAccidentPayload = {
	employeeId: string;
	truckNumber: string;
	violationTypeId: string | null;
	targetStatus: INCIDENT_REPORT_STATUS;
	requestedSections: string[];

	onJobSite: boolean | null;
	jobSiteType: string | null;
	anotherVehicleInvolved: boolean;
	otherVehicleCount: number | null;
	personStruck: boolean;

	accidentDate: string | null;
	location: string | null;
	nearestCrossStreet: string | null;
	weather: string | null;

	policeContacted: boolean;
	policeDepartment: string | null;
	policeReportNumber: string | null;

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

	propertyDamage: IPropertyDamagePayload | null;
	photos: (IAccidentImagePayload & { category: string })[];
};

export type IAdminCreatedAccident = {
	id: string;
	reportId: number;
};

// Admin-created draft loaded for editing ("Continue"). Adds the office-only fields
// the review shape doesn't expose (reporter user + selected violation type).
export type IAdminAccidentDraft = IAccidentReportDetail & {
	userId: string | null;
	violationTypeId: string | null;
};
