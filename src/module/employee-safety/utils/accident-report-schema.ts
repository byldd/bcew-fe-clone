import { z } from "zod";
import { getImageSchema } from "@/module/schedule-management/weekly-schedule-management/utils/mark-not-ready-form";
import { ALLOWED_DOCUMENT_FILE_TYPES } from "@/utils/constants";
import { isFutureDate } from "@/lib/utils/date";
import { ACCIDENT_SECTION, PERSON_STRUCK_TYPE, YES_NO } from "../enums";
import { getAccidentSectionVisibility } from "./accident-section-visibility";

// Nested per other-vehicle block (one per vehicle when another vehicle was involved).
export const otherVehicleSchema = z.object({
	make: z.string().optional(),
	model: z.string().optional(),
	whatWasStruck: z.string().optional(),
	vin: z.string().optional(),
	driverFullName: z.string().optional(),
	driverLicenseNumber: z.string().optional(),
	refusedDriverLicense: z.boolean().optional(),
	refusedInsuranceCard: z.boolean().optional(),
	refusedDriverLicensePhoto: z.boolean().optional(),
	insuranceCardImages: z.array(getImageSchema(ALLOWED_DOCUMENT_FILE_TYPES)).optional(),
	driverLicenseImages: z.array(getImageSchema(ALLOWED_DOCUMENT_FILE_TYPES)).optional(),
	vehicleDamageImages: z.array(getImageSchema(ALLOWED_DOCUMENT_FILE_TYPES)).optional(),
});

// Nested "Person Involved" block (rendered when a person was struck).
// Employee branch uses employeeId + employeeInjured; other-person branch uses fullName + phoneNumber.
export const personStruckSchema = z.object({
	whoWasStruck: z.string().optional(),
	employeeId: z.string().optional(),
	employeeInjured: z.string().optional(),
	fullName: z.string().optional(),
	phoneNumber: z.string().optional(),
	injuryDescription: z.string().optional(),
});

// Nested "Follow Up Questions" block (property damage). Company details are captured
// only when another company's non-vehicle property was struck.
export const propertyDamageSchema = z.object({
	anotherCompanyProperty: z.string().optional(),
	companyName: z.string().optional(),
	contactPersonName: z.string().optional(),
	contactPhoneNumber: z.string().optional(),
	otherInformation: z.string().optional(),
	builderProperty: z.string().optional(),
	homeownerProperty: z.string().optional(),
});

// Optional "Add Injury Details" block.
export const injurySchema = z.object({
	bodyPartInjured: z.string().optional(),
	natureOfInjury: z.string().optional(),
	painLevel: z.string().optional(),
	firstAidProvided: z.boolean().optional(),
	treatingPhysicianClinic: z.string().optional(),
	isTreatingPhysicianClinicOther: z.boolean().optional(),
	didLeaveWork: z.boolean().optional(),
	workRestrictions: z.string().optional(),
	expectedReturnToWorkDate: z.date().optional(),
	additionalNotes: z.string().optional(),
});

// Draft-friendly: everything optional. The conditional required-field rules are
// enforced server-side on submit; the client mirrors them before calling submit.
export const accidentReportSchema = z.object({
	// A few quick questions ("Yes" / "No")
	onJobSite: z.string().optional(),
	jobSiteType: z.string().optional(),
	anotherVehicleInvolved: z.string().optional(),
	numberOfVehicles: z.string().optional(),
	personStruck: z.string().optional(),

	// BCEW vehicle
	truckNumber: z.string().optional(),
	vin: z.string().optional(),
	licensePlate: z.string().optional(),

	// Accident details
	accidentDate: z.date().optional(),
	accidentTime: z.string().optional(),
	location: z.string().optional(),
	nearestCrossStreet: z.string().optional(),
	weather: z.string().optional(),

	// What happened
	describeAccident: z.string().optional(),
	damageToBcewVehicle: z.string().optional(),

	// Required / supporting photos
	bcewVehiclePhotos: z.array(getImageSchema()).optional(),
	otherVehiclePropertyPhotos: z.array(getImageSchema()).optional(),
	insuranceCorrespondence: z.array(getImageSchema(ALLOWED_DOCUMENT_FILE_TYPES)).optional(),

	// Police ("Yes" / "No")
	policeContacted: z.string().optional(),
	policeDepartment: z.string().optional(),
	policeReportNumber: z.string().optional(),

	// Tow & impound ("Yes" / "No")
	bcewVehicleTowed: z.string().optional(),
	towProviderName: z.string().optional(),
	towCostOnSpot: z.coerce.number().optional(),
	otherVehicleTowed: z.string().optional(),
	otherVehicleTowCost: z.coerce.number().optional(),
	vehicleImpounded: z.string().optional(),
	impoundLotCost: z.coerce.number().optional(),
	impoundReleaseCharges: z.coerce.number().optional(),

	// Medical & drug screen
	medicalDrugScreen: z.string().optional(),
	drugScreenLocation: z.string().optional(),
	medicalTreatmentLocation: z.string().optional(),
	isMedicalTreatmentLocationOther: z.boolean().optional(),

	// Nested blocks
	otherVehicles: z.array(otherVehicleSchema).optional(),
	injury: injurySchema.optional(),
	personInvolved: personStruckSchema.optional(),
	propertyDamage: propertyDamageSchema.optional(),

	// Confirmation
	isConfirmedAccurate: z.boolean().optional(),
});

export type IAccidentReportSchema = z.infer<typeof accidentReportSchema>;

const REQUIRED = "This field is required";

const isBlank = (value?: string | null): boolean => !value || value.trim().length === 0;

// A valid VIN is exactly 17 chars, letters (excluding I, O, Q) and digits.
const VIN_PATTERN = /^[A-HJ-NPR-Z0-9]{17}$/i;
const isValidVin = (value?: string | null): boolean => VIN_PATTERN.test((value ?? "").trim());

// When `enforcedSections` is passed (technician completing an admin "ask" request),
// required rules apply only to those sections; non-askable sections (quick questions,
// other vehicle, person involved, injury) are skipped since the admin owns them.
const applyRequiredFieldRules = (
	data: IAccidentReportSchema,
	ctx: z.RefinementCtx,
	enforcedSections?: Set<ACCIDENT_SECTION>
) => {
	const require = (path: (string | number)[], condition: boolean, message = REQUIRED) => {
		if (condition) ctx.addIssue({ code: z.ZodIssueCode.custom, path, message });
	};
	// Askable sections: enforce when not in ask-mode, or when this section was asked.
	const enforces = (section: ACCIDENT_SECTION) => !enforcedSections || enforcedSections.has(section);
	// Non-askable groups: only enforced in the normal (non-ask) submit.
	const enforcesBase = !enforcedSections;

	if (enforcesBase) {
		require(["onJobSite"], isBlank(data.onJobSite));
		require(["anotherVehicleInvolved"], isBlank(data.anotherVehicleInvolved));
		require(["personStruck"], isBlank(data.personStruck));
	}

	// Company details are required only when another company's property was struck.
	if (enforces(ACCIDENT_SECTION.FOLLOW_UP) && data.propertyDamage?.anotherCompanyProperty === YES_NO.YES) {
		require(["propertyDamage", "companyName"], isBlank(data.propertyDamage?.companyName));
	}

	if (enforces(ACCIDENT_SECTION.ACCIDENT_DETAILS)) {
		require(["accidentDate"], !data.accidentDate);
		require(["accidentDate"], !!data.accidentDate &&
			isFutureDate(data.accidentDate), "An accident cannot occur in the future");
		require(["accidentTime"], isBlank(data.accidentTime));
		require(["location"], isBlank(data.location));
	}

	if (enforces(ACCIDENT_SECTION.WHAT_HAPPENED)) {
		require(["describeAccident"], isBlank(data.describeAccident));
	}

	if (enforces(ACCIDENT_SECTION.REQUIRED_PHOTOS)) {
		require(["bcewVehiclePhotos"], !data.bcewVehiclePhotos?.length, "At least one photo is required");
	}

	if (enforcedSections?.has(ACCIDENT_SECTION.TOW_IMPOUND)) {
		if (data.bcewVehicleTowed === YES_NO.YES) {
			require(["towProviderName"], isBlank(data.towProviderName));
			require(["towCostOnSpot"], data.towCostOnSpot == null);
		}
		if (data.otherVehicleTowed === YES_NO.YES) {
			require(["otherVehicleTowCost"], data.otherVehicleTowCost == null);
		}
		if (data.vehicleImpounded === YES_NO.YES) {
			require(["impoundLotCost"], data.impoundLotCost == null);
			require(["impoundReleaseCharges"], data.impoundReleaseCharges == null);
		}
	}

	if (enforcesBase && data.anotherVehicleInvolved === YES_NO.YES) {
		require(["numberOfVehicles"], isBlank(data.numberOfVehicles));
	}

	// Per-vehicle details are an askable section (admin can request just this in ask-mode).
	if (enforces(ACCIDENT_SECTION.OTHER_VEHICLE) && data.anotherVehicleInvolved === YES_NO.YES) {
		(data.otherVehicles ?? []).forEach((vehicle, index) => {
			require(["otherVehicles", index, "make"], isBlank(vehicle?.make));
			require(["otherVehicles", index, "model"], isBlank(vehicle?.model));
			require(["otherVehicles", index, "whatWasStruck"], isBlank(vehicle?.whatWasStruck));
			require(["otherVehicles", index, "vin"], !isBlank(vehicle?.vin) &&
				!isValidVin(vehicle?.vin), "Enter a valid 17-character VIN");
			// Driver's license # and the two ID photos are required unless the other
			// party refused to provide them.
			if (!vehicle?.refusedDriverLicense) {
				require(["otherVehicles", index, "driverLicenseNumber"], isBlank(vehicle?.driverLicenseNumber));
			}
			if (!vehicle?.refusedInsuranceCard) {
				require(["otherVehicles", index, "insuranceCardImages"], !vehicle?.insuranceCardImages
					?.length, "At least one photo is required");
			}
			if (!vehicle?.refusedDriverLicensePhoto) {
				require(["otherVehicles", index, "driverLicenseImages"], !vehicle?.driverLicenseImages
					?.length, "At least one photo is required");
			}
		});
	}

	// The Person Involved section shows whenever a person was struck (on- or off-site);
	// its fields are only required when that section is actually visible.
	if (enforces(ACCIDENT_SECTION.PERSON_INVOLVED) && getAccidentSectionVisibility(data).personInvolved) {
		const person = data.personInvolved;
		// Who was struck starts unselected — the technician must pick a branch first.
		require(["personInvolved", "whoWasStruck"], isBlank(person?.whoWasStruck));
		if (person?.whoWasStruck === PERSON_STRUCK_TYPE.OTHER) {
			require(["personInvolved", "employeeInjured"], isBlank(person?.employeeInjured));
			// Injury description only shows, and is only required, when the person was injured.
			if (person?.employeeInjured === YES_NO.YES) {
				require(["personInvolved", "injuryDescription"], isBlank(person?.injuryDescription));
			}
		} else if (person?.whoWasStruck === PERSON_STRUCK_TYPE.EMPLOYEE) {
			require(["personInvolved", "employeeId"], isBlank(person?.employeeId));
			require(["personInvolved", "employeeInjured"], isBlank(person?.employeeInjured));
			// Injury description only shows, and is only required, when the employee was injured.
			if (person?.employeeInjured === YES_NO.YES) {
				require(["personInvolved", "injuryDescription"], isBlank(person?.injuryDescription));
			}
		}
	}

	if (enforces(ACCIDENT_SECTION.POLICE) && data.policeContacted === YES_NO.YES) {
		require(["policeDepartment"], isBlank(data.policeDepartment));
	}

	if (enforcesBase && !isBlank(data.injury?.bodyPartInjured)) {
		const injury = data.injury;
		require(["injury", "natureOfInjury"], isBlank(injury?.natureOfInjury));
		require(["injury", "painLevel"], isBlank(injury?.painLevel));
		require(["injury", "treatingPhysicianClinic"], isBlank(injury?.treatingPhysicianClinic));
		require(["injury", "firstAidProvided"], typeof injury?.firstAidProvided !== "boolean");
		require(["injury", "expectedReturnToWorkDate"], !!injury?.didLeaveWork && !injury?.expectedReturnToWorkDate);
	}
};

export const accidentRequiredFieldsSchema = accidentReportSchema.superRefine(applyRequiredFieldRules);

export const accidentSubmitSchema = accidentReportSchema.superRefine((data, ctx) => {
	applyRequiredFieldRules(data, ctx);

	if (data.isConfirmedAccurate !== true) {
		ctx.addIssue({
			code: z.ZodIssueCode.custom,
			path: ["isConfirmedAccurate"],
			message: "You must confirm the information is accurate before submitting",
		});
	}
});

// Submit validation when the technician is completing an admin "ask" request:
// only the requested sections' required fields are enforced, and no accuracy
// confirmation is needed.
export const buildAirSubmitSchema = (requestedSections: Set<ACCIDENT_SECTION>) =>
	accidentReportSchema.superRefine((data, ctx) => applyRequiredFieldRules(data, ctx, requestedSections));
