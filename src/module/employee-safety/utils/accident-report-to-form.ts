import { VEHICLE_ACCIDENT_PHOTO_CATEGORY, YES_NO } from "../enums";
import { IAccidentImagePayload, IAccidentReportDetail } from "../types";
import { IAccidentReportSchema } from "./accident-report-schema";

const toYesNo = (value?: boolean | null): string => (value === true ? YES_NO.YES : value === false ? YES_NO.NO : "");

const toNumber = (value?: string | number | null): number | undefined =>
	value === null || value === undefined ? undefined : Number(value);

const stripImages = (images?: IAccidentImagePayload[]) => (images ?? []).map(({ keyFile, url }) => ({ keyFile, url }));

const photosByCategory = (photos: IAccidentReportDetail["photos"], category: VEHICLE_ACCIDENT_PHOTO_CATEGORY) =>
	stripImages(photos.filter((photo) => photo.category === category));

// Reverse of buildAccidentPayload — hydrates the form from a saved (draft) report.
export const mapReportToForm = (report: IAccidentReportDetail): IAccidentReportSchema => ({
	onJobSite: toYesNo(report.onJobSite),
	anotherVehicleInvolved: toYesNo(report.anotherVehicleInvolved),
	personStruck: toYesNo(report.personStruck),

	truckNumber: report.truckNumber ?? "",
	vin: report.vin ?? "",
	licensePlate: report.licensePlate ?? "",

	accidentDate: report.accidentDate ? new Date(report.accidentDate) : undefined,
	accidentTime: report.accidentDate ?? "",
	location: report.location ?? "",
	nearestCrossStreet: report.nearestCrossStreet ?? "",
	weather: report.weather ?? "",

	describeAccident: report.describeAccident ?? "",
	damageToBcewVehicle: report.damageToBcewVehicle ?? "",
	damageToOtherProperty: report.damageToOtherProperty ?? "",

	bcewVehiclePhotos: photosByCategory(report.photos, VEHICLE_ACCIDENT_PHOTO_CATEGORY.BCEW_VEHICLE),
	otherVehiclePropertyPhotos: photosByCategory(report.photos, VEHICLE_ACCIDENT_PHOTO_CATEGORY.OTHER_VEHICLE_PROPERTY),
	insuranceCorrespondence: photosByCategory(report.photos, VEHICLE_ACCIDENT_PHOTO_CATEGORY.INSURANCE_CORRESPONDENCE),

	policeContacted: toYesNo(report.policeContacted),
	policeDepartment: report.policeDepartment ?? "",
	policeReportNumber: report.policeReportNumber ?? "",

	bcewVehicleTowed: report.bcewVehicleTowed,
	towProviderName: report.towProviderName ?? "",
	towCostOnSpot: toNumber(report.towCostOnSpot),
	otherVehicleTowed: report.otherVehicleTowed,
	otherVehicleTowCost: toNumber(report.otherVehicleTowCost),
	vehicleImpounded: report.vehicleImpounded,
	impoundLotCost: toNumber(report.impoundLotCost),
	impoundReleaseCharges: toNumber(report.impoundReleaseCharges),

	medicalDrugScreen: report.medicalDrugScreen,
	drugScreenLocation: report.drugScreenLocation ?? "",
	medicalTreatmentLocation: report.medicalTreatmentLocation ?? "",
	isMedicalTreatmentLocationOther: report.isMedicalTreatmentLocationOther,

	isConfirmedAccurate: report.isConfirmedAccurate,

	otherVehicle: report.otherVehicle
		? {
				make: report.otherVehicle.make ?? "",
				model: report.otherVehicle.model ?? "",
				whatWasStruck: report.otherVehicle.whatWasStruck ?? "",
				vin: report.otherVehicle.vin ?? "",
				driverFullName: report.otherVehicle.driverFullName ?? "",
				driverLicenseNumber: report.otherVehicle.driverLicenseNumber ?? "",
				driverPhoneNumber: report.otherVehicle.driverPhoneNumber ?? "",
				insuranceCompany: report.otherVehicle.insuranceCompany ?? "",
				policyNumber: report.otherVehicle.policyNumber ?? "",
				images: stripImages(report.otherVehicle.images),
			}
		: undefined,

	injury: report.injury
		? {
				bodyPartInjured: report.injury.bodyPartInjured,
				natureOfInjury: report.injury.natureOfInjury,
				painLevel: report.injury.painLevel,
				firstAidProvided: report.injury.firstAidProvided,
				treatingPhysicianClinic: report.injury.treatingPhysicianClinic,
				isTreatingPhysicianClinicOther: report.injury.isTreatingPhysicianClinicOther,
				didLeaveWork: report.injury.didLeaveWork,
				workRestrictions: report.injury.workRestrictions ?? "",
				expectedReturnToWorkDate: report.injury.expectedReturnToWorkDate
					? new Date(report.injury.expectedReturnToWorkDate)
					: undefined,
				additionalNotes: report.injury.additionalNotes ?? "",
			}
		: undefined,
});
