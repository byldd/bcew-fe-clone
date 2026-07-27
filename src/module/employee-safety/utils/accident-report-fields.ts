import { FIELD_VARIANT, LABEL_POSITION, type FormFieldConfig, type IOptions } from "@/components/common/form/types";
import { YES_NO } from "../enums";
import { IAccidentReportSchema } from "./accident-report-schema";

type AccidentField = FormFieldConfig<IAccidentReportSchema>;

export const yesNoOptions: IOptions[] = [
	{ label: "Yes", value: YES_NO.YES },
	{ label: "No", value: YES_NO.NO },
];

export const quickQuestionsFields: AccidentField[] = [
	{
		name: "onJobSite",
		fieldVariant: FIELD_VARIANT.RADIO_GROUP,
		label: "Did the accident occur on a job site?*",
		options: yesNoOptions,
	},
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
};

export const buildAccidentDetailFields = (weatherOptions: IOptions[]): AccidentField[] => [
	{
		name: "location",
		fieldVariant: FIELD_VARIANT.INPUT,
		label: "Location of Accident*",
		placeholder: "Where did this happened",
	},
	{
		name: "nearestCrossStreet",
		fieldVariant: FIELD_VARIANT.INPUT,
		label: "Nearest Cross Street",
		placeholder: "Type Here",
	},
	{
		name: "weather",
		fieldVariant: FIELD_VARIANT.SELECT,
		label: "What was the weather condition?",
		placeholder: "Select",
		options: weatherOptions,
	},
];

export const whatHappenedFields: AccidentField[] = [
	{
		name: "describeAccident",
		fieldVariant: FIELD_VARIANT.TEXTAREA,
		label: "Describe the accident*",
		description: "Briefly describe how the accident happened.",
		placeholder: "How did the incident happened?",
	},
	{
		name: "damageToBcewVehicle",
		fieldVariant: FIELD_VARIANT.TEXTAREA,
		label: "What damage was caused to the  vehicle?",
		placeholder: "Describe damage to our vehicle",
	},
	{
		name: "damageToOtherProperty",
		fieldVariant: FIELD_VARIANT.TEXTAREA,
		label: "Was another vehicle, object, or property damaged?*",
		description: "If yes, describe the damage.",
		placeholder: "Describe damage to other vehicle/object/property",
	},
];

export const bcewVehiclePhotosField: AccidentField = {
	name: "bcewVehiclePhotos",
	fieldVariant: FIELD_VARIANT.MULTI_IMAGE,
	label: "Photos of the  Vehicle*",
	description: "Take photos of all damage from multiple angles, including wide and close-up views",
};

export const otherVehiclePropertyPhotosField: AccidentField = {
	name: "otherVehiclePropertyPhotos",
	fieldVariant: FIELD_VARIANT.MULTI_IMAGE,
	label: "Photos of Other Vehicle / Object / Property*",
	description: "Take photos of all damage from multiple angles, including wide and close-up views",
};

export const insuranceCorrespondenceField: AccidentField = {
	name: "insuranceCorrespondence",
	fieldVariant: FIELD_VARIANT.MULTI_DOCUMENT,
};

// Conditional "Other Vehicle Involved" block — shown when another vehicle was involved.
export const otherVehicleFields = {
	make: { name: "otherVehicle.make", fieldVariant: FIELD_VARIANT.INPUT, label: "Make*", placeholder: "Type Here" },
	model: { name: "otherVehicle.model", fieldVariant: FIELD_VARIANT.INPUT, label: "Model*", placeholder: "Type Here" },
	whatWasStruck: {
		name: "otherVehicle.whatWasStruck",
		fieldVariant: FIELD_VARIANT.TEXTAREA,
		label: "What Was Struck*",
		placeholder: "Describe damage to other vehicle",
	},
	vin: {
		name: "otherVehicle.vin",
		fieldVariant: FIELD_VARIANT.INPUT,
		label: "VIN",
		placeholder: "Type Here",
		inputProps: { maxLength: 17 },
	},
	driverFullName: {
		name: "otherVehicle.driverFullName",
		fieldVariant: FIELD_VARIANT.INPUT,
		label: "Driver's Full Name",
		placeholder: "Type Here",
	},
	driverLicenseNumber: {
		name: "otherVehicle.driverLicenseNumber",
		fieldVariant: FIELD_VARIANT.INPUT,
		label: "Driver's License #",
		placeholder: "Type Here",
	},
	driverPhoneNumber: {
		name: "otherVehicle.driverPhoneNumber",
		fieldVariant: FIELD_VARIANT.INPUT,
		label: "Driver's Phone #",
		placeholder: "Type Here",
	},
	insuranceCompany: {
		name: "otherVehicle.insuranceCompany",
		fieldVariant: FIELD_VARIANT.INPUT,
		label: "Insurance Company",
		placeholder: "Insurance Carrier",
	},
	policyNumber: {
		name: "otherVehicle.policyNumber",
		fieldVariant: FIELD_VARIANT.INPUT,
		label: "Policy Number",
		placeholder: "Policy Number",
	},
} satisfies Record<string, AccidentField>;

export const otherVehiclePhotosField: AccidentField = {
	name: "otherVehicle.images",
	fieldVariant: FIELD_VARIANT.MULTI_DOCUMENT,
	label: "Upload Insurance Card & License",
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
		placeholder: "District called to scene",
	},
	{
		name: "policeReportNumber",
		fieldVariant: FIELD_VARIANT.INPUT,
		label: "Police Report Number (Optional)",
		placeholder: "Report number here",
	},
];

// ── Injury details (page) ──
export const injuryBodyPartField: AccidentField = {
	name: "injury.bodyPartInjured",
	fieldVariant: FIELD_VARIANT.INPUT,
	label: "Which body part is Injured?*",
	placeholder: "Type Here",
};

export const injuryNatureField: AccidentField = {
	name: "injury.natureOfInjury",
	fieldVariant: FIELD_VARIANT.INPUT,
	label: "Nature of Injury?*",
	placeholder: "Type Here",
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
	placeholder: "Type Here",
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
	placeholder: "Type Here",
};
