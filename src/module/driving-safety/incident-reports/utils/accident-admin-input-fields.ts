import { FIELD_VARIANT, type FormFieldConfig, type IOptions } from "@/components/common/form/types";
import { yesNoOptions } from "@/module/employee-safety/utils/accident-report-fields";

import { IAccidentReviewSchema } from "./accident-review-schema";

type ReviewField = FormFieldConfig<IAccidentReviewSchema>;

export const bcewTowedField: ReviewField = {
	name: "bcewVehicleTowed",
	fieldVariant: FIELD_VARIANT.RADIO_GROUP,
	label: "Was the BCEW Vehicle Towed?",
	options: yesNoOptions,
};

export const towProviderField: ReviewField = {
	name: "towProviderName",
	fieldVariant: FIELD_VARIANT.INPUT,
	label: "Tow Provider Name",
	placeholder: "Type here",
};

export const towCostField: ReviewField = {
	name: "towCostOnSpot",
	fieldVariant: FIELD_VARIANT.CURRENCY_INPUT,
	label: "Tow cost",
	placeholder: "$0.00",
};

export const otherVehicleTowedField: ReviewField = {
	name: "otherVehicleTowed",
	fieldVariant: FIELD_VARIANT.RADIO_GROUP,
	label: "Was the other Vehicle Towed?",
	options: yesNoOptions,
};

export const otherVehicleTowCostField: ReviewField = {
	name: "otherVehicleTowCost",
	fieldVariant: FIELD_VARIANT.CURRENCY_INPUT,
	label: "Other vehicle Tow Cost",
	placeholder: "$0.00",
};

export const impoundedField: ReviewField = {
	name: "vehicleImpounded",
	fieldVariant: FIELD_VARIANT.RADIO_GROUP,
	label: "Was the BCEW Vehicle Impounded?",
	options: yesNoOptions,
};

export const impoundLotCostField: ReviewField = {
	name: "impoundLotCost",
	fieldVariant: FIELD_VARIANT.CURRENCY_INPUT,
	label: "Impound Lot Cost",
	className: "h-10 rounded-[8px]",
	placeholder: "$0.00",
};

export const impoundReleaseChargesField: ReviewField = {
	name: "impoundReleaseCharges",
	fieldVariant: FIELD_VARIANT.CURRENCY_INPUT,
	label: "Impound Release Charges",
	className: "h-10 rounded-[8px]",
	placeholder: "$0.00",
};

export const drugScreenNeededField: ReviewField = {
	name: "drugScreenNeeded",
	fieldVariant: FIELD_VARIANT.RADIO_GROUP,
	options: yesNoOptions,
};

export const medicalCareNeededField: ReviewField = {
	name: "medicalCareNeeded",
	fieldVariant: FIELD_VARIANT.RADIO_GROUP,
	options: yesNoOptions,
};

export const buildMedicalTreatmentLocationField = (options: IOptions[]): ReviewField => ({
	name: "medicalTreatmentLocation",
	fieldVariant: FIELD_VARIANT.SELECT,
	label: "Medical Treatment Location",
	placeholder: "Select",
	className: "h-10 rounded-[8px]",
	options,
});

export const medicalTreatmentLocationOtherField: ReviewField = {
	name: "medicalTreatmentLocationOther",
	fieldVariant: FIELD_VARIANT.INPUT,
	label: "Enter Location*",
	placeholder: "Type here",
	className: "h-10 rounded-[8px]",
};
