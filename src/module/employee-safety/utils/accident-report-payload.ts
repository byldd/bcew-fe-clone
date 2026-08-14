import { OTHER_VEHICLE_IMAGE_CATEGORY, PERSON_STRUCK_TYPE, VEHICLE_ACCIDENT_PHOTO_CATEGORY, YES_NO } from "../enums";
import { IFileUploadable } from "@/types/file-upload";
import { dateToUTCString } from "@/lib/utils/date";
import {
	IAccidentImagePayload,
	IInjuryPayload,
	IOtherVehiclePayload,
	IPersonInvolvedPayload,
	IPropertyDamagePayload,
	ISaveAccidentPayload,
} from "../types";
import { IAccidentReportSchema } from "./accident-report-schema";
import { getAccidentSectionVisibility } from "./accident-section-visibility";

type FormImage = { keyFile: string; url: string };

const toBool = (value?: string): boolean | undefined => (value === undefined ? undefined : value === YES_NO.YES);

const numOrNull = (value?: number | string): number | null => {
	if (value === undefined || value === null || value === "") return null;
	const num = Number(value);
	return Number.isFinite(num) ? num : null;
};

const stripImages = (images?: FormImage[]): IAccidentImagePayload[] =>
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

type OtherVehicle = NonNullable<IAccidentReportSchema["otherVehicles"]>[number];

const buildOtherVehicleImages = (vehicle: OtherVehicle): IOtherVehiclePayload["images"] => [
	...stripImages(vehicle.insuranceCardImages).map((image) => ({
		...image,
		category: OTHER_VEHICLE_IMAGE_CATEGORY.INSURANCE_CARD,
	})),
	...stripImages(vehicle.driverLicenseImages).map((image) => ({
		...image,
		category: OTHER_VEHICLE_IMAGE_CATEGORY.DRIVERS_LICENSE,
	})),
	...stripImages(vehicle.vehicleDamageImages).map((image) => ({
		...image,
		category: OTHER_VEHICLE_IMAGE_CATEGORY.VEHICLE_DAMAGE,
	})),
];

const buildOtherVehicles = (data: IAccidentReportSchema): IOtherVehiclePayload[] => {
	if (toBool(data.anotherVehicleInvolved) !== true) return [];
	const count = Number(data.numberOfVehicles) || 0;
	return (data.otherVehicles ?? []).slice(0, count).map((vehicle) => ({
		make: vehicle.make ?? null,
		model: vehicle.model ?? null,
		whatWasStruck: vehicle.whatWasStruck ?? null,
		vin: vehicle.vin ?? null,
		driverFullName: vehicle.driverFullName ?? null,
		driverLicenseNumber: vehicle.driverLicenseNumber ?? null,
		refusedDriverLicense: vehicle.refusedDriverLicense ?? false,
		refusedInsuranceCard: vehicle.refusedInsuranceCard ?? false,
		refusedDriverLicensePhoto: vehicle.refusedDriverLicensePhoto ?? false,
		images: buildOtherVehicleImages(vehicle),
	}));
};

const buildPersonInvolved = (data: IAccidentReportSchema): IPersonInvolvedPayload | null => {
	if (!getAccidentSectionVisibility(data).personInvolved || !data.personInvolved) return null;
	const person = data.personInvolved;
	const isEmployee = person.whoWasStruck === PERSON_STRUCK_TYPE.EMPLOYEE;
	const isOther = person.whoWasStruck === PERSON_STRUCK_TYPE.OTHER;
	const injured = toBool(person.employeeInjured) ?? null;
	// Both branches capture an injury description only when the person was injured.
	const injuryDescription = injured === true ? (person.injuryDescription ?? null) : null;
	return {
		whoWasStruck: person.whoWasStruck ?? null,
		employeeId: isEmployee ? (person.employeeId ?? null) : null,
		employeeInjured: injured,
		fullName: isOther ? (person.fullName ?? null) : null,
		phoneNumber: isOther ? (person.phoneNumber ?? null) : null,
		injuryDescription,
	};
};

const buildPropertyDamage = (data: IAccidentReportSchema): IPropertyDamagePayload | null => {
	const pd = data.propertyDamage;
	if (!pd) return null;
	const anotherCompanyProperty = toBool(pd.anotherCompanyProperty) ?? null;
	// Company details only carry through when another company's property was struck.
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

const buildInjury = (data: IAccidentReportSchema): IInjuryPayload | null => {
	const injury = data.injury;
	if (!injury?.bodyPartInjured) return null;
	return {
		bodyPartInjured: injury.bodyPartInjured,
		natureOfInjury: injury.natureOfInjury ?? null,
		painLevel: injury.painLevel ?? null,
		firstAidProvided: injury.firstAidProvided ?? null,
		treatingPhysicianClinic: injury.treatingPhysicianClinic ?? null,
		isTreatingPhysicianClinicOther: injury.isTreatingPhysicianClinicOther ?? false,
		didLeaveWork: injury.didLeaveWork ?? false,
		workRestrictions: injury.workRestrictions ?? null,
		expectedReturnToWorkDate: injury.expectedReturnToWorkDate ? injury.expectedReturnToWorkDate.toISOString() : null,
		additionalNotes: injury.additionalNotes ?? null,
	};
};

const buildPhotos = (data: IAccidentReportSchema): (IAccidentImagePayload & { category: string })[] => [
	...stripImages(data.bcewVehiclePhotos).map((image) => ({
		...image,
		category: VEHICLE_ACCIDENT_PHOTO_CATEGORY.BCEW_VEHICLE,
	})),
	...stripImages(data.otherVehiclePropertyPhotos).map((image) => ({
		...image,
		category: VEHICLE_ACCIDENT_PHOTO_CATEGORY.OTHER_VEHICLE_PROPERTY,
	})),
	...stripImages(data.insuranceCorrespondence).map((image) => ({
		...image,
		category: VEHICLE_ACCIDENT_PHOTO_CATEGORY.INSURANCE_CORRESPONDENCE,
	})),
];

// Every image field on the form, flattened for the S3 presign/upload pass.
// ImageUpload only stages files in form state — nothing reaches S3 without this.
export const collectAccidentImages = (data: IAccidentReportSchema): IFileUploadable[] => [
	...(data.bcewVehiclePhotos ?? []),
	...(data.otherVehiclePropertyPhotos ?? []),
	...(data.insuranceCorrespondence ?? []),
	...(data.otherVehicles ?? []).flatMap((vehicle) => [
		...(vehicle.insuranceCardImages ?? []),
		...(vehicle.driverLicenseImages ?? []),
		...(vehicle.vehicleDamageImages ?? []),
	]),
];

export const buildAccidentPayload = (data: IAccidentReportSchema): ISaveAccidentPayload => ({
	onJobSite: toBool(data.onJobSite) ?? null,
	jobSiteType: toBool(data.onJobSite) ? data.jobSiteType || null : null,
	anotherVehicleInvolved: toBool(data.anotherVehicleInvolved),
	otherVehicleCount: toBool(data.anotherVehicleInvolved) ? Number(data.numberOfVehicles) || null : null,
	personStruck: toBool(data.personStruck),

	truckNumber: data.truckNumber ?? null,
	vin: data.vin ?? null,
	licensePlate: data.licensePlate ?? null,

	accidentDate: combineDateTime(data.accidentDate, data.accidentTime),
	location: data.location ?? null,
	nearestCrossStreet: data.nearestCrossStreet ?? null,
	weather: data.weather || null,

	describeAccident: data.describeAccident ?? null,
	damageToBcewVehicle: data.damageToBcewVehicle ?? null,

	policeContacted: toBool(data.policeContacted) ?? false,
	policeDepartment: data.policeDepartment ?? null,
	policeReportNumber: data.policeReportNumber ?? null,

	bcewVehicleTowed: toBool(data.bcewVehicleTowed) ?? null,
	towProviderName: data.towProviderName ?? null,
	towCostOnSpot: numOrNull(data.towCostOnSpot),
	otherVehicleTowed: toBool(data.otherVehicleTowed) ?? null,
	otherVehicleTowCost: numOrNull(data.otherVehicleTowCost),
	vehicleImpounded: toBool(data.vehicleImpounded) ?? null,
	impoundLotCost: numOrNull(data.impoundLotCost),
	impoundReleaseCharges: numOrNull(data.impoundReleaseCharges),

	medicalDrugScreen: data.medicalDrugScreen || undefined,
	drugScreenLocation: data.drugScreenLocation ?? null,
	medicalTreatmentLocation: data.medicalTreatmentLocation ?? null,
	isMedicalTreatmentLocationOther: data.isMedicalTreatmentLocationOther ?? false,

	isConfirmedAccurate: data.isConfirmedAccurate ?? false,

	otherVehicles: buildOtherVehicles(data),
	personInvolved: buildPersonInvolved(data),
	propertyDamage: buildPropertyDamage(data),
	injury: buildInjury(data),
	photos: buildPhotos(data),
});
