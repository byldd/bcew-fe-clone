import { INCIDENT_REPORT_STATUS } from "@/module/driving-safety/incident-reports/utils/enums";
import {
	MEDICAL_TREATMENT_LOCATION_OTHER,
	VEHICLE_ACCIDENT_PHOTO_CATEGORY,
	YES_NO,
} from "@/module/employee-safety/enums";
import { IAccidentImagePayload, IPropertyDamagePayload } from "@/module/employee-safety/types";
import { IFileUploadable } from "@/types/file-upload";
import { dateToUTCString } from "@/lib/utils/date";
import { IAdminCreateAccidentPayload } from "../types";
import { IVehicleAccidentRecordSchema } from "./vehicle-accident-record-schema";

const toBool = (value?: string): boolean | undefined => (value === undefined ? undefined : value === YES_NO.YES);

// Tri-state Yes/No: blank/undefined → null (unanswered), Yes → true, No → false.
const toBoolOrNull = (value?: string): boolean | null =>
	value === YES_NO.YES ? true : value === YES_NO.NO ? false : null;

const numOrNull = (value?: number | string): number | null => {
	if (value === undefined || value === null || value === "") return null;
	const num = Number(value);
	return Number.isFinite(num) ? num : null;
};

const stripImages = (images?: { keyFile: string; url: string }[]): IAccidentImagePayload[] =>
	(images ?? []).map(({ keyFile, url }) => ({ keyFile, url }));

const combineDateTime = (date?: Date, time?: string): string | null => {
	if (!date) return null;
	const result = new Date(date);
	if (time) {
		const parsed = new Date(time);
		if (!Number.isNaN(parsed.getTime())) {
			result.setHours(parsed.getUTCHours(), parsed.getUTCMinutes(), 0, 0);
		}
	}
	return dateToUTCString(result);
};

const buildPropertyDamage = (data: IVehicleAccidentRecordSchema): IPropertyDamagePayload | null => {
	const pd = data.propertyDamage;
	if (!pd) return null;
	const anotherCompanyProperty = toBool(pd.anotherCompanyProperty) ?? null;
	const collectsCompany = anotherCompanyProperty === true;
	return {
		anotherCompanyProperty,
		builderProperty: toBool(pd.builderProperty) ?? null,
		homeownerProperty: toBool(pd.homeownerProperty) ?? null,
		companyName: collectsCompany ? (pd.companyName ?? null) : null,
		contactPersonName: collectsCompany ? (pd.contactPersonName ?? null) : null,
		contactPhoneNumber: collectsCompany ? (pd.contactPhoneNumber ?? null) : null,
		otherInformation: collectsCompany ? (pd.otherInformation ?? null) : null,
	};
};

export const collectAccidentRecordImages = (data: IVehicleAccidentRecordSchema): IFileUploadable[] => [
	...(data.insuranceCorrespondence ?? []),
];

export const buildVehicleAccidentRecordPayload = (
	data: IVehicleAccidentRecordSchema,
	targetStatus: INCIDENT_REPORT_STATUS,
	requestedSections: string[]
): IAdminCreateAccidentPayload => {
	const onJobSite = toBool(data.onJobSite) ?? null;
	const anotherVehicleInvolved = toBool(data.anotherVehicleInvolved) ?? false;
	const medicalNeeded = data.medicalCareNeeded === YES_NO.YES;
	const isOtherLocation = medicalNeeded && data.medicalTreatmentLocation === MEDICAL_TREATMENT_LOCATION_OTHER;

	return {
		employeeId: data.employeeId ?? "",
		truckNumber: data.truckNumber ?? "",
		violationTypeId: data.violationTypeId || null,
		targetStatus,
		requestedSections,

		onJobSite,
		jobSiteType: onJobSite ? data.jobSiteType || null : null,
		anotherVehicleInvolved,
		otherVehicleCount: anotherVehicleInvolved ? numOrNull(data.numberOfVehicles) : null,
		personStruck: toBool(data.personStruck) ?? false,

		accidentDate: combineDateTime(data.accidentDate, data.accidentTime),
		location: data.location ?? null,
		nearestCrossStreet: data.nearestCrossStreet ?? null,
		speedLimit: numOrNull(data.speedLimit),
		weather: data.weather || null,

		policeContacted: toBool(data.policeContacted) ?? false,
		policeDepartment: data.policeDepartment ?? null,
		policeReportNumber: data.policeReportNumber ?? null,

		bcewVehicleTowed: toBoolOrNull(data.bcewVehicleTowed),
		towProviderName: data.towProviderName ?? null,
		towCostOnSpot: numOrNull(data.towCostOnSpot),
		otherVehicleTowed: toBoolOrNull(data.otherVehicleTowed),
		otherVehicleTowCost: numOrNull(data.otherVehicleTowCost),
		vehicleImpounded: toBoolOrNull(data.vehicleImpounded),
		impoundLotCost: numOrNull(data.impoundLotCost),
		impoundReleaseCharges: numOrNull(data.impoundReleaseCharges),

		drugScreenNeeded: toBoolOrNull(data.drugScreenNeeded),
		medicalCareNeeded: toBoolOrNull(data.medicalCareNeeded),
		medicalTreatmentLocation: medicalNeeded
			? isOtherLocation
				? (data.medicalTreatmentLocationOther ?? null)
				: (data.medicalTreatmentLocation ?? null)
			: null,
		isMedicalTreatmentLocationOther: isOtherLocation,

		propertyDamage: buildPropertyDamage(data),
		photos: stripImages(data.insuranceCorrespondence).map((image) => ({
			...image,
			category: VEHICLE_ACCIDENT_PHOTO_CATEGORY.INSURANCE_CORRESPONDENCE,
		})),
	};
};
