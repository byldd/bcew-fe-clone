import { OTHER_VEHICLE_IMAGE_CATEGORY, VEHICLE_ACCIDENT_PHOTO_CATEGORY, YES_NO } from "../enums";
import { IAccidentImagePayload, IAccidentReportDetail } from "../types";
import { IAccidentReportSchema } from "./accident-report-schema";

const toYesNo = (value?: boolean | null): string => (value === true ? YES_NO.YES : value === false ? YES_NO.NO : "");

const toNumber = (value?: string | number | null): number | undefined =>
	value === null || value === undefined ? undefined : Number(value);

const stripImages = (images?: IAccidentImagePayload[]) => (images ?? []).map(({ keyFile, url }) => ({ keyFile, url }));

const photosByCategory = (photos: IAccidentReportDetail["photos"], category: VEHICLE_ACCIDENT_PHOTO_CATEGORY) =>
	stripImages(photos.filter((photo) => photo.category === category));

const imagesByCategory = (
	images: IAccidentReportDetail["otherVehicles"][number]["images"],
	category: OTHER_VEHICLE_IMAGE_CATEGORY
) => stripImages(images.filter((image) => image.category === category));

// Reverse of buildAccidentPayload — hydrates the form from a saved (draft) report.
export const mapReportToForm = (report: IAccidentReportDetail): IAccidentReportSchema => ({
	onJobSite: toYesNo(report.onJobSite),
	jobSiteType: report.jobSiteType ?? "",
	anotherVehicleInvolved: toYesNo(report.anotherVehicleInvolved),
	numberOfVehicles: report.otherVehicleCount ? String(report.otherVehicleCount) : "",
	personStruck: toYesNo(report.personStruck),

	truckNumber: report.truckNumber ?? "",
	vin: report.vin ?? "",
	licensePlate: report.licensePlate ?? "",

	accidentDate: report.accidentDate ? new Date(report.accidentDate) : undefined,
	accidentTime: report.accidentDate ?? "",
	location: report.location ?? "",
	nearestCrossStreet: report.nearestCrossStreet ?? "",
	speedLimit: toNumber(report.speedLimit),
	weather: report.weather ?? "",

	describeAccident: report.describeAccident ?? "",
	damageToBcewVehicle: report.damageToBcewVehicle ?? "",

	bcewVehiclePhotos: photosByCategory(report.photos, VEHICLE_ACCIDENT_PHOTO_CATEGORY.BCEW_VEHICLE),
	otherVehiclePropertyPhotos: photosByCategory(report.photos, VEHICLE_ACCIDENT_PHOTO_CATEGORY.OTHER_VEHICLE_PROPERTY),
	insuranceCorrespondence: photosByCategory(report.photos, VEHICLE_ACCIDENT_PHOTO_CATEGORY.INSURANCE_CORRESPONDENCE),

	policeContacted: toYesNo(report.policeContacted),
	policeDepartment: report.policeDepartment ?? "",
	policeReportNumber: report.policeReportNumber ?? "",

	bcewVehicleTowed: toYesNo(report.bcewVehicleTowed),
	towProviderName: report.towProviderName ?? "",
	towCostOnSpot: toNumber(report.towCostOnSpot),
	otherVehicleTowed: toYesNo(report.otherVehicleTowed),
	otherVehicleTowCost: toNumber(report.otherVehicleTowCost),
	vehicleImpounded: toYesNo(report.vehicleImpounded),
	impoundLotCost: toNumber(report.impoundLotCost),
	impoundReleaseCharges: toNumber(report.impoundReleaseCharges),

	medicalDrugScreen: report.medicalDrugScreen,
	drugScreenLocation: report.drugScreenLocation ?? "",
	medicalTreatmentLocation: report.medicalTreatmentLocation ?? "",
	isMedicalTreatmentLocationOther: report.isMedicalTreatmentLocationOther,
	wasDriverInjured: report.injury ? YES_NO.YES : "",

	isConfirmedAccurate: report.isConfirmedAccurate,

	otherVehicles: report.otherVehicles.map((vehicle) => ({
		make: vehicle.make ?? "",
		model: vehicle.model ?? "",
		whatWasStruck: vehicle.whatWasStruck ?? "",
		vin: vehicle.vin ?? "",
		driverFullName: vehicle.driverFullName ?? "",
		driverLicenseNumber: vehicle.driverLicenseNumber ?? "",
		refusedDriverLicense: vehicle.refusedDriverLicense,
		refusedInsuranceCard: vehicle.refusedInsuranceCard,
		refusedDriverLicensePhoto: vehicle.refusedDriverLicensePhoto,
		insuranceCardImages: imagesByCategory(vehicle.images, OTHER_VEHICLE_IMAGE_CATEGORY.INSURANCE_CARD),
		driverLicenseImages: imagesByCategory(vehicle.images, OTHER_VEHICLE_IMAGE_CATEGORY.DRIVERS_LICENSE),
		vehicleDamageImages: imagesByCategory(vehicle.images, OTHER_VEHICLE_IMAGE_CATEGORY.VEHICLE_DAMAGE),
	})),

	personInvolved: report.personInvolved
		? {
				whoWasStruck: report.personInvolved.whoWasStruck ?? "",
				employeeId: report.personInvolved.employeeId ?? "",
				employeeInjured: toYesNo(report.personInvolved.employeeInjured),
				fullName: report.personInvolved.fullName ?? "",
				phoneNumber: report.personInvolved.phoneNumber ?? "",
				injuryDescription: report.personInvolved.injuryDescription ?? "",
			}
		: undefined,

	propertyDamage: report.propertyDamage
		? {
				anotherCompanyProperty: toYesNo(report.propertyDamage.anotherCompanyProperty),
				builderProperty: toYesNo(report.propertyDamage.builderProperty),
				homeownerProperty: toYesNo(report.propertyDamage.homeownerProperty),
				companyName: report.propertyDamage.companyName ?? "",
				contactPersonName: report.propertyDamage.contactPersonName ?? "",
				contactPhoneNumber: report.propertyDamage.contactPhoneNumber ?? "",
				otherInformation: report.propertyDamage.otherInformation ?? "",
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
