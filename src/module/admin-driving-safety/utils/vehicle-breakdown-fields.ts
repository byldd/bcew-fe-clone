import { FIELD_VARIANT, LABEL_POSITION, type FormFieldConfig, type IOptions } from "@/components/common/form/types";
import { IAdminVehicleBreakdownSchema } from "./vehicle-breakdown-schema";

type BreakdownField = FormFieldConfig<IAdminVehicleBreakdownSchema>;

export const toBreakdownOptions = (items: { id: string; name: string }[]): IOptions[] =>
	items.map(({ id, name }) => ({ label: name, value: id }));

export const truckField: BreakdownField = {
	name: "truckNumber",
	fieldVariant: FIELD_VARIANT.INPUT,
	label: "Truck Number*",
	placeholder: "Type Here",
	className: "h-10",
};

export const buildIssueCategoryField = (options: IOptions[]): BreakdownField => ({
	name: "issueCategoryId",
	fieldVariant: FIELD_VARIANT.SELECT,
	label: "Category*",
	placeholder: "Select Category",
	options,
});

export const buildIssueTypeField = (options: IOptions[]): BreakdownField => ({
	name: "issueTypeId",
	fieldVariant: FIELD_VARIANT.SELECT,
	label: "Issue*",
	placeholder: "Select Issue",
	options,
});

export const breakdownDescriptionField: BreakdownField = {
	name: "description",
	fieldVariant: FIELD_VARIANT.TEXTAREA,
	label: "Description",
	placeholder: "Enter here",
};

export const bcewVehicleTowedField: BreakdownField = {
	name: "bcewVehicleTowed",
	fieldVariant: FIELD_VARIANT.TOGGLE,
	label: " Vehicle Towed",
	labelPosition: LABEL_POSITION.LEFT,
};

export const costOnSpotField: BreakdownField = {
	name: "costOnSpot",
	fieldVariant: FIELD_VARIANT.CURRENCY_INPUT,
	label: "Cost (if paid on the spot)*",
	placeholder: "$0.00",
};
