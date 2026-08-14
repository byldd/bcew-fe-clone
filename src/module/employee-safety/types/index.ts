import { FieldPath, UseFormReturn } from "react-hook-form";
import { INCIDENT_REPORT_STATUS } from "@/module/driving-safety/incident-reports/utils/enums";

import { TECHNICIAN_REPORT_STATUS } from "../enums";
import { IAccidentReportSchema } from "../utils/accident-report-schema";

export enum MATERIAL_JOB_PHASE {
	SERVICE = "SERVICE",
	ROUGH = "ROUGH",
	FINAL = "FINAL",
	SECOND_HIT = "SECOND_HIT",
	SLAB_ROUGH = "SLAB_ROUGH",
}

export type IAssignedJob = {
	jobDailyRecordId: string;
	jobName: string | null;
	jobPhase: MATERIAL_JOB_PHASE | null;
};

export type ITodayJobForeman = IAssignedJob & {
	foremanId: string;
	foremanName: string | null;
	foremanPhone: string | null;
};

export type IEmergencyContact = {
	name: string;
	phone: string;
};

export type IEmergencyCallDirections = {
	intro: string;
	steps: string[];
	closing: string;
};

// A portal user with the "Foreman" role, for the injury report's Step 1 call list.
export type IForemanContact = {
	id: string;
	name: string;
	cellPhone: string | null;
};

export type IFormOption = {
	value: string;
	label: string;
};

export type ISafetyFormOptions = {
	weatherConditions: IFormOption[];
	painLevels: IFormOption[];
	medicalDrugScreen: IFormOption[];
};

export type IMedicalTreatmentLocation = {
	id: string;
	name: string;
};

// Vehicle assigned to the logged-in technician, resolved server-side from the
// fleet view, plus the driver's own license number. Shown read-only on the form.
export type IAssignedVehicle = {
	truckNumber: string | null;
	eqpmntRecnum: number | null;
	vin: string | null;
	licensePlate: string | null;
	driverLicenseNumber: string | null;
};

export type IVehicleAccidentReport = {
	id: string;
	reportId: number;
	status: INCIDENT_REPORT_STATUS;
};

export type IVehicleBreakdownPayload = {
	truckNumber: string;
	issueCategoryId: string;
	issueTypeId: string;
	description?: string;
};

// Full accident report returned by GET /vehicle-accident/:id (used to resume a draft).
export type IAccidentReportDetail = {
	id: string;
	status: INCIDENT_REPORT_STATUS;
	requestedSections: string | null;
	onJobSite: boolean | null;
	jobSiteType: string | null;
	anotherVehicleInvolved: boolean;
	personStruck: boolean;
	truckNumber: string | null;
	vin: string | null;
	licensePlate: string | null;
	accidentDate: string | null;
	location: string | null;
	nearestCrossStreet: string | null;
	weather: string | null;
	describeAccident: string | null;
	damageToBcewVehicle: string | null;
	policeContacted: boolean;
	policeDepartment: string | null;
	policeReportNumber: string | null;
	bcewVehicleTowed: boolean | null;
	towProviderName: string | null;
	towCostOnSpot: string | number | null;
	otherVehicleTowed: boolean | null;
	otherVehicleTowCost: string | number | null;
	vehicleImpounded: boolean | null;
	impoundLotCost: string | number | null;
	impoundReleaseCharges: string | number | null;
	medicalDrugScreen: string;
	drugScreenNeeded: boolean | null;
	medicalCareNeeded: boolean | null;
	drugScreenLocation: string | null;
	medicalTreatmentLocation: string | null;
	isMedicalTreatmentLocationOther: boolean;
	isConfirmedAccurate: boolean;
	otherVehicleCount: number | null;
	otherVehicles: {
		orderIndex: number;
		make: string | null;
		model: string | null;
		whatWasStruck: string | null;
		vin: string | null;
		driverFullName: string | null;
		driverLicenseNumber: string | null;
		refusedDriverLicense: boolean;
		refusedInsuranceCard: boolean;
		refusedDriverLicensePhoto: boolean;
		images: (IAccidentImagePayload & { category: string | null })[];
	}[];
	personInvolved: {
		whoWasStruck: string | null;
		employeeId: string | null;
		employeeInjured: boolean | null;
		fullName: string | null;
		phoneNumber: string | null;
		injuryDescription: string | null;
	} | null;
	propertyDamage: {
		anotherCompanyProperty: boolean | null;
		builderProperty: boolean | null;
		homeownerProperty: boolean | null;
		companyName: string | null;
		contactPersonName: string | null;
		contactPhoneNumber: string | null;
		otherInformation: string | null;
	} | null;
	injury: {
		bodyPartInjured: string;
		natureOfInjury: string;
		painLevel: string;
		firstAidProvided: boolean;
		treatingPhysicianClinic: string;
		isTreatingPhysicianClinicOther: boolean;
		didLeaveWork: boolean;
		workRestrictions: string | null;
		expectedReturnToWorkDate: string | null;
		additionalNotes: string | null;
	} | null;
	photos: (IAccidentImagePayload & { category: string })[];
};

export type IMyRecordsParams = {
	startDate: Date | null;
	endDate: Date | null;
};

export type IMyRecordsParamsInput = Partial<IMyRecordsParams>;

// A row in the technician's "My Records" list (mirrors backend MyRecordItem).
export type IMyRecord = {
	id: string;
	type: string;
	title: string;
	status: TECHNICIAN_REPORT_STATUS;
	reportNumber: string | null;
	truckNumber: string | null;
	createdAt: string;
	submittedAt: string | null;
};

export type IAccidentImagePayload = {
	keyFile: string;
	url: string;
};

export type IOtherVehiclePayload = {
	make?: string | null;
	model?: string | null;
	whatWasStruck?: string | null;
	vin?: string | null;
	driverFullName?: string | null;
	driverLicenseNumber?: string | null;
	refusedDriverLicense?: boolean;
	refusedInsuranceCard?: boolean;
	refusedDriverLicensePhoto?: boolean;
	images?: (IAccidentImagePayload & { category: string })[];
};

export type IPersonInvolvedPayload = {
	whoWasStruck?: string | null;
	employeeId?: string | null;
	employeeInjured?: boolean | null;
	fullName?: string | null;
	phoneNumber?: string | null;
	injuryDescription?: string | null;
};

export type IPropertyDamagePayload = {
	anotherCompanyProperty?: boolean | null;
	builderProperty?: boolean | null;
	homeownerProperty?: boolean | null;
	companyName?: string | null;
	contactPersonName?: string | null;
	contactPhoneNumber?: string | null;
	otherInformation?: string | null;
};

export type IInjuryPayload = {
	bodyPartInjured?: string | null;
	natureOfInjury?: string | null;
	painLevel?: string | null;
	firstAidProvided?: boolean | null;
	treatingPhysicianClinic?: string | null;
	isTreatingPhysicianClinicOther?: boolean;
	didLeaveWork?: boolean;
	workRestrictions?: string | null;
	expectedReturnToWorkDate?: string | null;
	additionalNotes?: string | null;
};

export type ISaveAccidentPayload = {
	onJobSite?: boolean | null;
	jobSiteType?: string | null;
	anotherVehicleInvolved?: boolean;
	otherVehicleCount?: number | null;
	personStruck?: boolean;

	truckNumber?: string | null;
	vin?: string | null;
	licensePlate?: string | null;

	accidentDate?: string | null;
	location?: string | null;
	nearestCrossStreet?: string | null;
	weather?: string | null;

	describeAccident?: string | null;
	damageToBcewVehicle?: string | null;

	policeContacted?: boolean;
	policeDepartment?: string | null;
	policeReportNumber?: string | null;

	bcewVehicleTowed?: boolean | null;
	towProviderName?: string | null;
	towCostOnSpot?: number | null;
	otherVehicleTowed?: boolean | null;
	otherVehicleTowCost?: number | null;
	vehicleImpounded?: boolean | null;
	impoundLotCost?: number | null;
	impoundReleaseCharges?: number | null;

	medicalDrugScreen?: string;
	drugScreenLocation?: string | null;
	medicalTreatmentLocation?: string | null;
	isMedicalTreatmentLocationOther?: boolean;

	isConfirmedAccurate?: boolean;

	otherVehicles?: IOtherVehiclePayload[] | null;
	personInvolved?: IPersonInvolvedPayload | null;
	propertyDamage?: IPropertyDamagePayload | null;
	injury?: IInjuryPayload | null;
	photos?: (IAccidentImagePayload & { category: string })[];
};

export type IJobSiteInjuryReport = {
	id: string;
	reportId: number;
	status: string;
};

// ── API payload (mirrors the backend SaveJobSiteInjuryDraftPayload) ──
export type IJobSiteInjuryImagePayload = {
	keyFile: string;
	url: string;
};

// Full injury report returned by GET /job-site-injury/:id (used to resume a draft).
export type IJobSiteInjuryReportDetail = {
	id: string;
	status: string;
	injuryDate: string | null;
	howInjuryOccurred: string | null;
	bodyPartInjured: string | null;
	equipmentMalfunction: boolean;
	equipmentMalfunctionExplain: string | null;
	jobDailyRecordId: string | null;
	medicalAction: string;
	medicalTreatmentLocation: string | null;
	isMedicalTreatmentLocationOther: boolean;
	treatmentStartDate: string | null;
	treatmentEndDate: string | null;
	doctorsMedics: string | null;
	drugScreenLocation: string | null;
	immediateAction: string | null;
	permanentSolution: string | null;
	isConfirmedAccurate: boolean;
	photos: IJobSiteInjuryImagePayload[];
};

export type ISaveJobSiteInjuryPayload = {
	injuryDate?: string | null;
	howInjuryOccurred?: string | null;
	bodyPartInjured?: string | null;
	equipmentMalfunction?: boolean;
	equipmentMalfunctionExplain?: string | null;

	jobDailyRecordId?: string | null;

	medicalAction?: string;
	medicalTreatmentLocation?: string | null;
	isMedicalTreatmentLocationOther?: boolean;
	treatmentStartDate?: string | null;
	treatmentEndDate?: string | null;
	doctorsMedics?: string | null;
	drugScreenLocation?: string | null;

	immediateAction?: string | null;
	permanentSolution?: string | null;

	isConfirmedAccurate?: boolean;

	photos?: IJobSiteInjuryImagePayload[];
};

export type IVehicleDocumentsVehicle = {
	truckNumber: string;
	eqpmntRecnum: number | null;
	vin: string | null;
	licensePlate: string | null;
	year: string | null;
	make: string | null;
	model: string | null;
	registrationDate: string | null;
};

export type IFleetInsurance = {
	carrier: string;
	naicNumber: string | null;
	policyNumber: string;
	effectiveFrom: string;
	effectiveTo: string;
	agencyName: string | null;
	agencyPhone: string | null;
	insuredName: string | null;
	insuredAddress: string | null;
};

export type IVehicleDocuments = {
	vehicle: IVehicleDocumentsVehicle;
	insurance: IFleetInsurance | null;
};

export type IBreakdownIssueType = {
	id: string;
	name: string;
};

export type IBreakdownIssueCategory = {
	id: string;
	name: string;
	issueTypes: IBreakdownIssueType[];
};

export type IBreakdownFormOptions = {
	categories: IBreakdownIssueCategory[];
};

export type TreatmentLocationSelectProps = {
	form: UseFormReturn<IAccidentReportSchema>;
	name: FieldPath<IAccidentReportSchema>;
	otherFlagName: FieldPath<IAccidentReportSchema>;
	label: string;
	locations: IMedicalTreatmentLocation[];
	disabled?: boolean;
};
