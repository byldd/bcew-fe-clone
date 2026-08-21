import {
	MEDICAL_TREATMENT_LOCATION_OTHER,
	VEHICLE_ACCIDENT_PHOTO_CATEGORY,
	YES_NO,
} from "@/module/employee-safety/enums";
import { IAdminAccidentDraft } from "../types";
import { IVehicleAccidentRecordSchema } from "./vehicle-accident-record-schema";

const toYesNo = (value?: boolean | null): string => (value === true ? YES_NO.YES : value === false ? YES_NO.NO : "");

const toNumber = (value?: string | number | null): number | undefined =>
	value === null || value === undefined || value === "" ? undefined : Number(value);

export const mapDraftToRecordForm = (draft: IAdminAccidentDraft, employeeId: string): IVehicleAccidentRecordSchema => {
	const insuranceCorrespondence = draft.photos
		.filter((photo) => photo.category === VEHICLE_ACCIDENT_PHOTO_CATEGORY.INSURANCE_CORRESPONDENCE)
		.map(({ keyFile, url }) => ({ keyFile, url }));

	return {
		employeeId,
		truckNumber: draft.truckNumber ?? "",

		onJobSite: toYesNo(draft.onJobSite),
		jobSiteType: draft.jobSiteType ?? "",
		anotherVehicleInvolved: toYesNo(draft.anotherVehicleInvolved),
		numberOfVehicles: draft.otherVehicleCount ? String(draft.otherVehicleCount) : "",
		personStruck: toYesNo(draft.personStruck),

		accidentDate: draft.accidentDate ? new Date(draft.accidentDate) : undefined,
		accidentTime: draft.accidentDate ?? "",
		location: draft.location ?? "",
		nearestCrossStreet: draft.nearestCrossStreet ?? "",
		speedLimit: toNumber(draft.speedLimit),
		weather: draft.weather ?? "",

		propertyDamage: draft.propertyDamage
			? {
					anotherCompanyProperty: toYesNo(draft.propertyDamage.anotherCompanyProperty),
					builderProperty: toYesNo(draft.propertyDamage.builderProperty),
					homeownerProperty: toYesNo(draft.propertyDamage.homeownerProperty),
					companyName: draft.propertyDamage.companyName ?? "",
					contactPersonName: draft.propertyDamage.contactPersonName ?? "",
					contactPhoneNumber: draft.propertyDamage.contactPhoneNumber ?? "",
					otherInformation: draft.propertyDamage.otherInformation ?? "",
				}
			: undefined,

		policeContacted: toYesNo(draft.policeContacted),
		policeDepartment: draft.policeDepartment ?? "",
		policeReportNumber: draft.policeReportNumber ?? "",

		bcewVehicleTowed: toYesNo(draft.bcewVehicleTowed),
		towProviderName: draft.towProviderName ?? "",
		towCostOnSpot: toNumber(draft.towCostOnSpot),
		otherVehicleTowed: toYesNo(draft.otherVehicleTowed),
		otherVehicleTowCost: toNumber(draft.otherVehicleTowCost),
		vehicleImpounded: toYesNo(draft.vehicleImpounded),
		impoundLotCost: toNumber(draft.impoundLotCost),
		impoundReleaseCharges: toNumber(draft.impoundReleaseCharges),

		drugScreenNeeded: toYesNo(draft.drugScreenNeeded),
		medicalCareNeeded: toYesNo(draft.medicalCareNeeded),
		medicalTreatmentLocation: draft.isMedicalTreatmentLocationOther
			? MEDICAL_TREATMENT_LOCATION_OTHER
			: (draft.medicalTreatmentLocation ?? ""),
		medicalTreatmentLocationOther: draft.isMedicalTreatmentLocationOther ? (draft.medicalTreatmentLocation ?? "") : "",

		violationTypeId: draft.violationTypeId ?? "",

		insuranceCorrespondence,
	};
};
