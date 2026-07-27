import { VEHICLE_ACCIDENT_PHOTO_CATEGORY, YES_NO } from "../enums";
import { IFileUploadable } from "@/types/file-upload";
import { IAccidentImagePayload, IInjuryPayload, IOtherVehiclePayload, ISaveAccidentPayload } from "../types";
import { IAccidentReportSchema } from "./accident-report-schema";

type FormImage = { keyFile: string; url: string };

const toBool = (value?: string): boolean | undefined => (value === undefined ? undefined : value === YES_NO.YES);

const numOrNull = (value?: number | string): number | null => {
	if (value === undefined || value === null || value === "") return null;
	const num = Number(value);
	return Number.isFinite(num) ? num : null;
};

const stripImages = (images?: FormImage[]): IAccidentImagePayload[] =>
	(images ?? []).map(({ keyFile, url }) => ({ keyFile, url }));

// `time` is the datetime emitted by TimeInput (wall-clock stored in UTC components);
// take the day from `date` and the hour/minute from `time`.
const combineDateTime = (date?: Date, time?: string): string | null => {
	if (!date) return null;
	const result = new Date(date);
	if (time) {
		const parsed = new Date(time);
		if (!Number.isNaN(parsed.getTime())) {
			result.setHours(parsed.getUTCHours(), parsed.getUTCMinutes(), 0, 0);
		}
	}
	return result.toISOString();
};

const buildOtherVehicle = (data: IAccidentReportSchema): IOtherVehiclePayload | null => {
	if (toBool(data.anotherVehicleInvolved) !== true || !data.otherVehicle) return null;
	const ov = data.otherVehicle;
	return {
		make: ov.make ?? null,
		model: ov.model ?? null,
		whatWasStruck: ov.whatWasStruck ?? null,
		vin: ov.vin ?? null,
		driverFullName: ov.driverFullName ?? null,
		driverLicenseNumber: ov.driverLicenseNumber ?? null,
		driverPhoneNumber: ov.driverPhoneNumber ?? null,
		insuranceCompany: ov.insuranceCompany ?? null,
		policyNumber: ov.policyNumber ?? null,
		images: stripImages(ov.images),
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
	...(data.otherVehicle?.images ?? []),
];

export const buildAccidentPayload = (data: IAccidentReportSchema): ISaveAccidentPayload => ({
	onJobSite: toBool(data.onJobSite) ?? null,
	anotherVehicleInvolved: toBool(data.anotherVehicleInvolved),
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
	damageToOtherProperty: data.damageToOtherProperty ?? null,

	policeContacted: toBool(data.policeContacted) ?? false,
	policeDepartment: data.policeDepartment ?? null,
	policeReportNumber: data.policeReportNumber ?? null,

	bcewVehicleTowed: data.bcewVehicleTowed ?? false,
	towProviderName: data.towProviderName ?? null,
	towCostOnSpot: numOrNull(data.towCostOnSpot),
	otherVehicleTowed: data.otherVehicleTowed ?? false,
	otherVehicleTowCost: numOrNull(data.otherVehicleTowCost),
	vehicleImpounded: data.vehicleImpounded ?? false,
	impoundLotCost: numOrNull(data.impoundLotCost),
	impoundReleaseCharges: numOrNull(data.impoundReleaseCharges),

	medicalDrugScreen: data.medicalDrugScreen || undefined,
	drugScreenLocation: data.drugScreenLocation ?? null,
	medicalTreatmentLocation: data.medicalTreatmentLocation ?? null,
	isMedicalTreatmentLocationOther: data.isMedicalTreatmentLocationOther ?? false,

	isConfirmedAccurate: data.isConfirmedAccurate ?? false,

	otherVehicle: buildOtherVehicle(data),
	injury: buildInjury(data),
	photos: buildPhotos(data),
});
