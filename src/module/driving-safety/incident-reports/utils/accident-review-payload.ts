import {
	MEDICAL_TREATMENT_LOCATION_OTHER,
	VEHICLE_ACCIDENT_PHOTO_CATEGORY,
	YES_NO,
} from "@/module/employee-safety/enums";

import {
	IAccidentAdminInputs,
	IAccidentReviewDetail,
	IApproveAccidentReportPayload,
	IAssignSecondReviewPayload,
} from "../types";
import { IAccidentReviewSchema } from "./accident-review-schema";

type ReviewDocument = IAccidentReviewSchema["repairEstimate"][number];

const documentsForCategory = (
	report: IAccidentReviewDetail,
	category: VEHICLE_ACCIDENT_PHOTO_CATEGORY
): ReviewDocument[] =>
	report.photos.filter((photo) => photo.category === category).map(({ keyFile, url }) => ({ keyFile, url }));

// Tri-state Yes/No admin inputs: null (unanswered) ⇄ blank, true ⇄ Yes, false ⇄ No.
const toYesNo = (value: boolean | null): string => (value === true ? YES_NO.YES : value === false ? YES_NO.NO : "");

const toBoolOrNull = (value?: string): boolean | null =>
	value === YES_NO.YES ? true : value === YES_NO.NO ? false : null;

const toNumber = (value?: string | number | null): number | undefined =>
	value === null || value === undefined || value === "" ? undefined : Number(value);

const numOrNull = (value?: number | string): number | null => {
	if (value === undefined || value === null || value === "") return null;
	const num = Number(value);
	return Number.isFinite(num) ? num : null;
};

export const buildAccidentReviewDefaults = (report: IAccidentReviewDetail): IAccidentReviewSchema => ({
	violationTypeId: report.violationTypeId ?? report.violationType?.id ?? "",
	overrideReason: report.pointOverrideReason ?? "",
	repairEstimate: documentsForCategory(report, VEHICLE_ACCIDENT_PHOTO_CATEGORY.REPAIR_ESTIMATE),
	insuranceCorrespondence: documentsForCategory(report, VEHICLE_ACCIDENT_PHOTO_CATEGORY.INSURANCE_CORRESPONDENCE),

	bcewVehicleTowed: toYesNo(report.bcewVehicleTowed),
	towProviderName: report.towProviderName ?? "",
	towCostOnSpot: toNumber(report.towCostOnSpot),
	otherVehicleTowed: toYesNo(report.otherVehicleTowed),
	otherVehicleTowCost: toNumber(report.otherVehicleTowCost),
	vehicleImpounded: toYesNo(report.vehicleImpounded),
	impoundLotCost: toNumber(report.impoundLotCost),
	impoundReleaseCharges: toNumber(report.impoundReleaseCharges),

	drugScreenNeeded: toYesNo(report.drugScreenNeeded),
	medicalCareNeeded: toYesNo(report.medicalCareNeeded),
	medicalTreatmentLocation: report.isMedicalTreatmentLocationOther
		? MEDICAL_TREATMENT_LOCATION_OTHER
		: (report.medicalTreatmentLocation ?? ""),
	medicalTreatmentLocationOther: report.isMedicalTreatmentLocationOther ? (report.medicalTreatmentLocation ?? "") : "",
});

const buildAdminInputs = (values: IAccidentReviewSchema): IAccidentAdminInputs => {
	const bcewTowed = values.bcewVehicleTowed === YES_NO.YES;
	const otherTowed = values.otherVehicleTowed === YES_NO.YES;
	const impounded = values.vehicleImpounded === YES_NO.YES;
	const medicalNeeded = values.medicalCareNeeded === YES_NO.YES;
	const isOtherLocation = medicalNeeded && values.medicalTreatmentLocation === MEDICAL_TREATMENT_LOCATION_OTHER;

	return {
		bcewVehicleTowed: toBoolOrNull(values.bcewVehicleTowed),
		// Costs only travel when the answer is an explicit Yes.
		towProviderName: bcewTowed ? values.towProviderName?.trim() || null : null,
		towCostOnSpot: bcewTowed ? numOrNull(values.towCostOnSpot) : null,
		otherVehicleTowed: toBoolOrNull(values.otherVehicleTowed),
		otherVehicleTowCost: otherTowed ? numOrNull(values.otherVehicleTowCost) : null,
		vehicleImpounded: toBoolOrNull(values.vehicleImpounded),
		impoundLotCost: impounded ? numOrNull(values.impoundLotCost) : null,
		impoundReleaseCharges: impounded ? numOrNull(values.impoundReleaseCharges) : null,
		drugScreenNeeded: toBoolOrNull(values.drugScreenNeeded),
		medicalCareNeeded: toBoolOrNull(values.medicalCareNeeded),
		medicalTreatmentLocation: medicalNeeded
			? isOtherLocation
				? values.medicalTreatmentLocationOther?.trim() || null
				: values.medicalTreatmentLocation || null
			: null,
		isMedicalTreatmentLocationOther: isOtherLocation,
	};
};

export const collectReviewDocuments = (values: IAccidentReviewSchema): ReviewDocument[] => [
	...values.repairEstimate,
	...values.insuranceCorrespondence,
];

const buildPayloadDocuments = (values: IAccidentReviewSchema) => [
	...values.repairEstimate.map(({ keyFile }) => ({
		category: VEHICLE_ACCIDENT_PHOTO_CATEGORY.REPAIR_ESTIMATE,
		keyFile,
	})),
	...values.insuranceCorrespondence.map(({ keyFile }) => ({
		category: VEHICLE_ACCIDENT_PHOTO_CATEGORY.INSURANCE_CORRESPONDENCE,
		keyFile,
	})),
];

export const buildApprovePayload = (values: IAccidentReviewSchema): IApproveAccidentReportPayload => ({
	violationTypeId: values.violationTypeId,
	overrideReason: values.overrideReason?.trim() || null,
	documents: buildPayloadDocuments(values),
});

// Assign carries the same assessment plus the tow/impound & medical inputs the admin
// filled in; the violation may still be undecided.
export const buildAssignPayload = (values: IAccidentReviewSchema): IAssignSecondReviewPayload => ({
	violationTypeId: values.violationTypeId?.trim() || null,
	overrideReason: values.overrideReason?.trim() || null,
	documents: buildPayloadDocuments(values),
	adminInputs: buildAdminInputs(values),
});
