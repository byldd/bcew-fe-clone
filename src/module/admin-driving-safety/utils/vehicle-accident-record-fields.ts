import { FIELD_VARIANT, type FormFieldConfig, type IOptions } from "@/components/common/form/types";
import {
	jobSiteTypeOptions,
	numberOfVehiclesOptions,
	yesNoOptions,
} from "@/module/employee-safety/utils/accident-report-fields";
import { IVehicleAccidentRecordSchema } from "./vehicle-accident-record-schema";

type AccidentField = FormFieldConfig<IVehicleAccidentRecordSchema>;

export const buildEmployeeField = (options: IOptions[]): AccidentField => ({
	name: "employeeId",
	fieldVariant: FIELD_VARIANT.SEARCHABLE_SELECT,
	label: "Full Name*",
	placeholder: "Select employee",
	options,
});

export const truckNumberField: AccidentField = {
	name: "truckNumber",
	fieldVariant: FIELD_VARIANT.INPUT,
	label: "Truck Number*",
	placeholder: "e.g. 125",
};

export const onJobSiteField: AccidentField = {
	name: "onJobSite",
	fieldVariant: FIELD_VARIANT.RADIO_GROUP,
	label: "Did the accident occur on a job site?*",
	options: yesNoOptions,
};

export const jobSiteTypeField: AccidentField = {
	name: "jobSiteType",
	fieldVariant: FIELD_VARIANT.RADIO_GROUP,
	label: "Which type of Job-Site was it?",
	options: jobSiteTypeOptions,
};

export const anotherVehicleField: AccidentField = {
	name: "anotherVehicleInvolved",
	fieldVariant: FIELD_VARIANT.RADIO_GROUP,
	label: "Was another vehicle involved? *",
	options: yesNoOptions,
};

// Shown when another vehicle was involved (scenario 2).
export const numberOfVehiclesField: AccidentField = {
	name: "numberOfVehicles",
	fieldVariant: FIELD_VARIANT.SEARCHABLE_SELECT,
	label: "How many vehicles were involved?*",
	placeholder: "Select",
	options: numberOfVehiclesOptions,
};

export const personStruckField: AccidentField = {
	name: "personStruck",
	fieldVariant: FIELD_VARIANT.RADIO_GROUP,
	label: "Was a person struck? *",
	options: yesNoOptions,
};

export const locationField: AccidentField = {
	name: "location",
	fieldVariant: FIELD_VARIANT.INPUT,
	label: "Location of Accident *",
	placeholder: "Type here",
	className: "h-10 rounded-[8px]",
};

export const nearestCrossStreetField: AccidentField = {
	name: "nearestCrossStreet",
	fieldVariant: FIELD_VARIANT.INPUT,
	label: "Nearest Cross Street",
	placeholder: "Type here",
	className: "h-10 rounded-[8px]",
};

export const buildWeatherField = (options: IOptions[]): AccidentField => ({
	name: "weather",
	fieldVariant: FIELD_VARIANT.SELECT,
	label: "Weather Condition",
	placeholder: "Select",
	options,
});

// ── Follow Up Questions ──
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
	contactPhoneNumber: {
		name: "propertyDamage.contactPhoneNumber",
		fieldVariant: FIELD_VARIANT.INPUT,
		label: "Phone Number (If available)",
		placeholder: "Type here",
	},
	contactPersonName: {
		name: "propertyDamage.contactPersonName",
		fieldVariant: FIELD_VARIANT.INPUT,
		label: "Contact Person's Name",
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

// ── Police ──
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
		label: "Do you have a police report number?",
		placeholder: "Report number here",
	},
];

// ── Tow & Impound ──
export const bcewTowedField: AccidentField = {
	name: "bcewVehicleTowed",
	fieldVariant: FIELD_VARIANT.RADIO_GROUP,
	label: "Was the BCEW Vehicle Towed?",
	options: yesNoOptions,
};

export const towProviderField: AccidentField = {
	name: "towProviderName",
	fieldVariant: FIELD_VARIANT.INPUT,
	label: "Tow provider name*",
	placeholder: "Provider",
};

export const towCostField: AccidentField = {
	name: "towCostOnSpot",
	fieldVariant: FIELD_VARIANT.CURRENCY_INPUT,
	label: "Cost (if paid on the spot)*",
	placeholder: "$0.00",
};

export const otherVehicleTowedField: AccidentField = {
	name: "otherVehicleTowed",
	fieldVariant: FIELD_VARIANT.RADIO_GROUP,
	label: "Was the other vehicle towed?",
	options: yesNoOptions,
};

export const otherVehicleTowCostField: AccidentField = {
	name: "otherVehicleTowCost",
	fieldVariant: FIELD_VARIANT.CURRENCY_INPUT,
	label: "Other vehicle tow cost*",
	placeholder: "$0.00",
	note: "Reported to the other party's insurance when BCEW is not at fault.",
};

export const impoundedField: AccidentField = {
	name: "vehicleImpounded",
	fieldVariant: FIELD_VARIANT.RADIO_GROUP,
	label: "Was the BCEW vehicle impounded?",
	options: yesNoOptions,
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

// ── Drug screen & Medical ──
export const drugScreenNeededField: AccidentField = {
	name: "drugScreenNeeded",
	fieldVariant: FIELD_VARIANT.RADIO_GROUP,
	options: yesNoOptions,
};

export const medicalCareNeededField: AccidentField = {
	name: "medicalCareNeeded",
	fieldVariant: FIELD_VARIANT.RADIO_GROUP,
	options: yesNoOptions,
};

export const buildMedicalTreatmentLocationField = (options: IOptions[]): AccidentField => ({
	name: "medicalTreatmentLocation",
	fieldVariant: FIELD_VARIANT.SELECT,
	label: "Medical Treatment Location*",
	placeholder: "Select",
	options,
});

// Shown only when "Other" is picked in the treatment-location select.
export const medicalTreatmentLocationOtherField: AccidentField = {
	name: "medicalTreatmentLocationOther",
	fieldVariant: FIELD_VARIANT.INPUT,
	label: "Enter Location*",
	placeholder: "Type here",
};

// ── Violation assessment ──
export const buildViolationTypeField = (options: IOptions[]): AccidentField => ({
	name: "violationTypeId",
	fieldVariant: FIELD_VARIANT.SELECT,
	label: "Violation type *",
	placeholder: "Select",
	options,
});
