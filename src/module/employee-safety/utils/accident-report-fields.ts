import { FIELD_VARIANT, LABEL_POSITION, type FormFieldConfig, type IOptions } from "@/components/common/form/types";
import { getTodayDate } from "@/lib/utils/date";
import { JOB_SITE_TYPE, PERSON_STRUCK_TYPE, YES_NO } from "../enums";
import { IAccidentReportSchema } from "./accident-report-schema";

type AccidentField = FormFieldConfig<IAccidentReportSchema>;

export const yesNoOptions: IOptions[] = [
	{ label: "Yes", value: YES_NO.YES },
	{ label: "No", value: YES_NO.NO },
];

export const jobSiteTypeOptions: IOptions[] = [
	{ label: "BCEW Site", value: JOB_SITE_TYPE.BCEW_SITE },
	{ label: "Contractor Site", value: JOB_SITE_TYPE.CONTRACTOR_SITE },
];

export const onJobSiteField: AccidentField = {
	name: "onJobSite",
	fieldVariant: FIELD_VARIANT.RADIO_GROUP,
	label: "Did the accident occur on a job site?*",
	options: yesNoOptions,
};

// Rendered only when onJobSite = Yes.
export const jobSiteTypeField: AccidentField = {
	name: "jobSiteType",
	fieldVariant: FIELD_VARIANT.RADIO_GROUP,
	label: "Which type of Job-Site was it?",
	options: jobSiteTypeOptions,
};

export const quickQuestionsFields: AccidentField[] = [
	{
		name: "anotherVehicleInvolved",
		fieldVariant: FIELD_VARIANT.RADIO_GROUP,
		label: "Was another vehicle involved?*",
		options: yesNoOptions,
	},
	{
		name: "personStruck",
		fieldVariant: FIELD_VARIANT.RADIO_GROUP,
		label: "Was a person struck?*",
		options: yesNoOptions,
	},
];

export const accidentDateField: AccidentField = {
	name: "accidentDate",
	fieldVariant: FIELD_VARIANT.DATE,
	label: "Date of Accident*",
	placeholder: "MM/DD/YY",
	// An accident cannot occur in the future.
	disabledDate: { after: getTodayDate() },
};

export const buildAccidentDetailFields = (weatherOptions: IOptions[]): AccidentField[] => [
	{
		name: "location",
		fieldVariant: FIELD_VARIANT.INPUT,
		label: "Location of Accident*",
		placeholder: "Type here",
	},
	{
		name: "nearestCrossStreet",
		fieldVariant: FIELD_VARIANT.INPUT,
		label: "Nearest Cross Street",
		placeholder: "Type here",
	},
	{
		name: "weather",
		fieldVariant: FIELD_VARIANT.SELECT,
		label: "Weather Condition",
		placeholder: "Select",
		options: weatherOptions,
	},
];

export const whatHappenedFields: AccidentField[] = [
	{
		name: "describeAccident",
		fieldVariant: FIELD_VARIANT.TEXTAREA,
		label: "Briefly describe how the accident happened*",
		placeholder: "Type here",
	},
	{
		name: "damageToBcewVehicle",
		fieldVariant: FIELD_VARIANT.TEXTAREA,
		label: "What damage was caused to the BCEW vehicle?",
		placeholder: "Type here",
	},
];

export const bcewVehiclePhotosField: AccidentField = {
	name: "bcewVehiclePhotos",
	fieldVariant: FIELD_VARIANT.MULTI_IMAGE,
	label: "Photos of the BCEW Vehicle*",
	description: "Take photos of all damage from multiple angles, including wide and close-up views",
};

export const otherVehiclePropertyPhotosField: AccidentField = {
	name: "otherVehiclePropertyPhotos",
	fieldVariant: FIELD_VARIANT.MULTI_IMAGE,
	label: "Photos of Damage to any other Property Struck (if applicable)",
};

export const insuranceCorrespondenceField: AccidentField = {
	name: "insuranceCorrespondence",
	fieldVariant: FIELD_VARIANT.MULTI_DOCUMENT,
};

// "How many Vehicles are Involved" — shown when another vehicle was involved.
export const numberOfVehiclesOptions: IOptions[] = Array.from({ length: 10 }, (_, index) => ({
	label: String(index + 1),
	value: String(index + 1),
}));

export const numberOfVehiclesField: AccidentField = {
	name: "numberOfVehicles",
	fieldVariant: FIELD_VARIANT.SEARCHABLE_SELECT,
	label: "How many Vehicles are Involved*",
	placeholder: "Select",
	options: numberOfVehiclesOptions,
};

// Per-vehicle detail fields — names are indexed into the otherVehicles array.
export const buildOtherVehicleFields = (index: number) =>
	({
		make: {
			name: `otherVehicles.${index}.make`,
			fieldVariant: FIELD_VARIANT.INPUT,
			label: "Make*",
			placeholder: "Type here",
		},
		model: {
			name: `otherVehicles.${index}.model`,
			fieldVariant: FIELD_VARIANT.INPUT,
			label: "Model*",
			placeholder: "Type here",
		},
		whatWasStruck: {
			name: `otherVehicles.${index}.whatWasStruck`,
			fieldVariant: FIELD_VARIANT.INPUT,
			label: "What was Struck*",
			placeholder: "Type here",
		},
		vin: {
			name: `otherVehicles.${index}.vin`,
			fieldVariant: FIELD_VARIANT.INPUT,
			label: "VIN",
			placeholder: "Type here",
			inputProps: { maxLength: 17 },
		},
		driverFullName: {
			name: `otherVehicles.${index}.driverFullName`,
			fieldVariant: FIELD_VARIANT.INPUT,
			label: "Driver's Full Name",
			placeholder: "Type here",
		},
		driverLicenseNumber: {
			name: `otherVehicles.${index}.driverLicenseNumber`,
			fieldVariant: FIELD_VARIANT.INPUT,
			label: "Driver's License #",
			placeholder: "Type here",
		},
	}) satisfies Record<string, AccidentField>;

export const buildOtherVehicleImageFields = (index: number) =>
	({
		insuranceCard: {
			name: `otherVehicles.${index}.insuranceCardImages`,
			fieldVariant: FIELD_VARIANT.MULTI_IMAGE,
			label: "Photo of Insurance Card",
		},
		driverLicense: {
			name: `otherVehicles.${index}.driverLicenseImages`,
			fieldVariant: FIELD_VARIANT.MULTI_IMAGE,
			label: "Photo of Driver's License",
		},
		vehicleDamage: {
			name: `otherVehicles.${index}.vehicleDamageImages`,
			fieldVariant: FIELD_VARIANT.MULTI_IMAGE,
			label: "Photos of Other Vehicle Damage",
		},
	}) satisfies Record<string, AccidentField>;

// ── Person involved (shown when a person was struck) ──
export const whoWasStruckOptions: IOptions[] = [
	{ label: "Employee", value: PERSON_STRUCK_TYPE.EMPLOYEE },
	{ label: "Other Person", value: PERSON_STRUCK_TYPE.OTHER },
];

export const personStruckFields = {
	whoWasStruck: {
		name: "personInvolved.whoWasStruck",
		fieldVariant: FIELD_VARIANT.RADIO_GROUP,
		label: "Who was struck?*",
		options: whoWasStruckOptions,
	},
	employeeInjured: {
		name: "personInvolved.employeeInjured",
		fieldVariant: FIELD_VARIANT.RADIO_GROUP,
		label: "Was the employee injured?*",
		options: yesNoOptions,
	},
	employeeInjuryDescription: {
		name: "personInvolved.injuryDescription",
		fieldVariant: FIELD_VARIANT.TEXTAREA,
		label: "Describe the injury*",
		placeholder: "How did the incident happened?",
	},
	fullName: {
		name: "personInvolved.fullName",
		fieldVariant: FIELD_VARIANT.INPUT,
		label: "Full Name (if known)",
		placeholder: "Type here",
	},
	phoneNumber: {
		name: "personInvolved.phoneNumber",
		fieldVariant: FIELD_VARIANT.INPUT,
		label: "Phone Number (if available)",
		placeholder: "Type here",
	},
	personInjured: {
		name: "personInvolved.employeeInjured",
		fieldVariant: FIELD_VARIANT.RADIO_GROUP,
		label: "Was the person injured?*",
		options: yesNoOptions,
	},
	injuryDescription: {
		name: "personInvolved.injuryDescription",
		fieldVariant: FIELD_VARIANT.TEXTAREA,
		label: "Describe the Injury*",
		placeholder: "How did the incident happened?",
	},
} satisfies Record<string, AccidentField>;

// Employee dropdown — options are the live employee list, injected at render time.
export const buildPersonInvolvedEmployeeField = (options: IOptions[]): AccidentField => ({
	name: "personInvolved.employeeId",
	fieldVariant: FIELD_VARIANT.SEARCHABLE_SELECT,
	label: "Employee's Full Name*",
	placeholder: "Type here",
	options,
});

// ── Follow Up Questions (property damage) ──
export const followUpFields = {
	anotherCompanyProperty: {
		name: "propertyDamage.anotherCompanyProperty",
		fieldVariant: FIELD_VARIANT.RADIO_GROUP,
		label: "Was another company's non-vehicle property struck?",
		options: yesNoOptions,
	},
	companyName: {
		name: "propertyDamage.companyName",
		fieldVariant: FIELD_VARIANT.INPUT,
		label: "Company Name*",
		placeholder: "Type here",
	},
	contactPersonName: {
		name: "propertyDamage.contactPersonName",
		fieldVariant: FIELD_VARIANT.INPUT,
		label: "Contact Person's Name",
		placeholder: "Type here",
	},
	contactPhoneNumber: {
		name: "propertyDamage.contactPhoneNumber",
		fieldVariant: FIELD_VARIANT.INPUT,
		label: "Phone Number (if available)",
		placeholder: "Type here",
	},
	otherInformation: {
		name: "propertyDamage.otherInformation",
		fieldVariant: FIELD_VARIANT.TEXTAREA,
		label: "Any Other Information",
		placeholder: "Type here",
	},
	builderProperty: {
		name: "propertyDamage.builderProperty",
		fieldVariant: FIELD_VARIANT.RADIO_GROUP,
		label: "Was the Builder's Property Struck?",
		options: yesNoOptions,
	},
	homeownerProperty: {
		name: "propertyDamage.homeownerProperty",
		fieldVariant: FIELD_VARIANT.RADIO_GROUP,
		label: "Was the Homeowner's Non-Vehicle Property Struck?",
		options: yesNoOptions,
	},
} satisfies Record<string, AccidentField>;

// ── Tow & Impound (shown when an admin asks the technician to complete it) ──
export const towToggleFields = {
	bcewVehicleTowed: {
		name: "bcewVehicleTowed",
		fieldVariant: FIELD_VARIANT.RADIO_GROUP,
		label: "Was the BCEW Vehicle Towed?",
		options: yesNoOptions,
	},
	otherVehicleTowed: {
		name: "otherVehicleTowed",
		fieldVariant: FIELD_VARIANT.RADIO_GROUP,
		label: "Was the other vehicle towed?",
		options: yesNoOptions,
	},
	vehicleImpounded: {
		name: "vehicleImpounded",
		fieldVariant: FIELD_VARIANT.RADIO_GROUP,
		label: "Was the BCEW vehicle impounded?",
		options: yesNoOptions,
	},
} satisfies Record<string, AccidentField>;

export const towProviderNameField: AccidentField = {
	name: "towProviderName",
	fieldVariant: FIELD_VARIANT.INPUT,
	label: "Tow provider name*",
	placeholder: "Provider",
};

export const towCostOnSpotField: AccidentField = {
	name: "towCostOnSpot",
	fieldVariant: FIELD_VARIANT.CURRENCY_INPUT,
	label: "Cost (if paid on the spot)*",
	placeholder: "$0.00",
};

export const otherVehicleTowCostField: AccidentField = {
	name: "otherVehicleTowCost",
	fieldVariant: FIELD_VARIANT.CURRENCY_INPUT,
	label: "Other vehicle tow cost*",
	placeholder: "$0.00",
	note: "Reported to the other party's insurance when BCEW is not at fault.",
};

export const impoundLotCostField: AccidentField = {
	name: "impoundLotCost",
	fieldVariant: FIELD_VARIANT.CURRENCY_INPUT,
	label: "Impound lot cost*",
	placeholder: "$0.00",
};

export const impoundReleaseChargesField: AccidentField = {
	name: "impoundReleaseCharges",
	fieldVariant: FIELD_VARIANT.CURRENCY_INPUT,
	label: "Release charges*",
	placeholder: "$0.00",
};

// ── Police contacted ──
export const policeContactedField: AccidentField = {
	name: "policeContacted",
	fieldVariant: FIELD_VARIANT.RADIO_GROUP,
	options: yesNoOptions,
};

export const policeFields: AccidentField[] = [
	{
		name: "policeDepartment",
		fieldVariant: FIELD_VARIANT.INPUT,
		label: "Police Department*",
		placeholder: "Type here",
	},
	{
		name: "policeReportNumber",
		fieldVariant: FIELD_VARIANT.INPUT,
		label: "Police Report Number (Optional)",
		placeholder: "Type here",
	},
];

// ── Injury details (page) ──
export const injuryBodyPartField: AccidentField = {
	name: "injury.bodyPartInjured",
	fieldVariant: FIELD_VARIANT.INPUT,
	label: "Which body part is Injured?*",
	placeholder: "Type here",
};

export const injuryNatureField: AccidentField = {
	name: "injury.natureOfInjury",
	fieldVariant: FIELD_VARIANT.INPUT,
	label: "Nature of Injury?*",
	placeholder: "Type here",
};

export const buildInjuryPainLevelField = (options: IOptions[]): AccidentField => ({
	name: "injury.painLevel",
	fieldVariant: FIELD_VARIANT.SELECT,
	label: "Pain Level*",
	placeholder: "Select",
	options,
});

export const injuryDidLeaveWorkToggleField: AccidentField = {
	name: "injury.didLeaveWork",
	fieldVariant: FIELD_VARIANT.TOGGLE,
	label: "Did You Leave Work?",
	labelPosition: LABEL_POSITION.LEFT,
};

export const injuryWorkRestrictionsField: AccidentField = {
	name: "injury.workRestrictions",
	fieldVariant: FIELD_VARIANT.INPUT,
	label: "Work Restrictions if Any",
	placeholder: "Type here",
};

export const injuryExpectedReturnDateField: AccidentField = {
	name: "injury.expectedReturnToWorkDate",
	fieldVariant: FIELD_VARIANT.DATE,
	label: "Expected Return to Work*",
	placeholder: "MM/DD/YY",
};

export const injuryAdditionalNotesField: AccidentField = {
	name: "injury.additionalNotes",
	fieldVariant: FIELD_VARIANT.TEXTAREA,
	label: "Additional Notes",
	placeholder: "Type here",
};
