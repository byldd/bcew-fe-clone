import { z } from "zod";
import { getImageSchema } from "@/module/schedule-management/weekly-schedule-management/utils/mark-not-ready-form";
import { ALLOWED_DOCUMENT_FILE_TYPES } from "@/utils/constants";
import { YES_NO } from "../enums";

// Nested other-vehicle block (rendered when another vehicle was involved).
export const otherVehicleSchema = z.object({
	make: z.string().optional(),
	model: z.string().optional(),
	whatWasStruck: z.string().optional(),
	vin: z.string().optional(),
	driverFullName: z.string().optional(),
	driverLicenseNumber: z.string().optional(),
	driverPhoneNumber: z.string().optional(),
	insuranceCompany: z.string().optional(),
	policyNumber: z.string().optional(),
	images: z.array(getImageSchema(ALLOWED_DOCUMENT_FILE_TYPES)).optional(),
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
	anotherVehicleInvolved: z.string().optional(),
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
	damageToOtherProperty: z.string().optional(),

	// Required / supporting photos
	bcewVehiclePhotos: z.array(getImageSchema()).optional(),
	otherVehiclePropertyPhotos: z.array(getImageSchema()).optional(),
	insuranceCorrespondence: z.array(getImageSchema(ALLOWED_DOCUMENT_FILE_TYPES)).optional(),

	// Police ("Yes" / "No")
	policeContacted: z.string().optional(),
	policeDepartment: z.string().optional(),
	policeReportNumber: z.string().optional(),

	// Tow & impound
	bcewVehicleTowed: z.boolean().optional(),
	towProviderName: z.string().optional(),
	towCostOnSpot: z.coerce.number().optional(),
	otherVehicleTowed: z.boolean().optional(),
	otherVehicleTowCost: z.coerce.number().optional(),
	vehicleImpounded: z.boolean().optional(),
	impoundLotCost: z.coerce.number().optional(),
	impoundReleaseCharges: z.coerce.number().optional(),

	// Medical & drug screen
	medicalDrugScreen: z.string().optional(),
	drugScreenLocation: z.string().optional(),
	medicalTreatmentLocation: z.string().optional(),
	isMedicalTreatmentLocationOther: z.boolean().optional(),

	// Nested blocks
	otherVehicle: otherVehicleSchema.optional(),
	injury: injurySchema.optional(),

	// Confirmation
	isConfirmedAccurate: z.boolean().optional(),
});

export type IAccidentReportSchema = z.infer<typeof accidentReportSchema>;

const REQUIRED = "This field is required";

const isBlank = (value?: string | null): boolean => !value || value.trim().length === 0;

// A valid VIN is exactly 17 chars, letters (excluding I, O, Q) and digits.
const VIN_PATTERN = /^[A-HJ-NPR-Z0-9]{17}$/i;
const isValidVin = (value?: string | null): boolean => VIN_PATTERN.test((value ?? "").trim());

// Digits with common phone separators only — rejects any alphabetic input.
const PHONE_PATTERN = /^\+?[0-9\s().-]{7,}$/;
const isValidPhone = (value?: string | null): boolean => {
	const trimmed = (value ?? "").trim();
	if (!PHONE_PATTERN.test(trimmed)) return false;
	const digits = trimmed.replace(/\D/g, "");
	return digits.length >= 7 && digits.length <= 15;
};

const applyRequiredFieldRules = (data: IAccidentReportSchema, ctx: z.RefinementCtx) => {
	const require = (path: (string | number)[], condition: boolean, message = REQUIRED) => {
		if (condition) ctx.addIssue({ code: z.ZodIssueCode.custom, path, message });
	};

	require(["onJobSite"], isBlank(data.onJobSite));
	require(["anotherVehicleInvolved"], isBlank(data.anotherVehicleInvolved));
	require(["personStruck"], isBlank(data.personStruck));

	require(["accidentDate"], !data.accidentDate);
	require(["accidentTime"], isBlank(data.accidentTime));
	require(["location"], isBlank(data.location));

	require(["describeAccident"], isBlank(data.describeAccident));
	require(["damageToOtherProperty"], isBlank(data.damageToOtherProperty));

	require(["bcewVehiclePhotos"], !data.bcewVehiclePhotos?.length, "At least one photo is required");
	require(["otherVehiclePropertyPhotos"], !data.otherVehiclePropertyPhotos?.length, "At least one photo is required");

	if (data.anotherVehicleInvolved === YES_NO.YES) {
		const otherVehicle = data.otherVehicle;
		require(["otherVehicle", "make"], isBlank(otherVehicle?.make));
		require(["otherVehicle", "model"], isBlank(otherVehicle?.model));
		require(["otherVehicle", "whatWasStruck"], isBlank(otherVehicle?.whatWasStruck));
		require(["otherVehicle", "vin"], !isBlank(otherVehicle?.vin) &&
			!isValidVin(otherVehicle?.vin), "Enter a valid 17-character VIN");
		require(["otherVehicle", "driverPhoneNumber"], !isBlank(otherVehicle?.driverPhoneNumber) &&
			!isValidPhone(otherVehicle?.driverPhoneNumber), "Enter a valid phone number");
	}

	if (data.policeContacted === YES_NO.YES) {
		require(["policeDepartment"], isBlank(data.policeDepartment));
	}

	if (!isBlank(data.injury?.bodyPartInjured)) {
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
