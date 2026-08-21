import { FIELD_VARIANT, type FormFieldConfig, type IOptions } from "@/components/common/form/types";
import { IBreakdownIssueType } from "../types";
import { IVehicleBreakdownSchema } from "./vehicle-breakdown-schema";

type BreakdownField = FormFieldConfig<IVehicleBreakdownSchema>;

export const toBreakdownOptions = (items: { id: string; name: string }[] | IBreakdownIssueType[]): IOptions[] =>
	items.map(({ id, name }) => ({ label: name, value: id })).sort((a, b) => a.label.localeCompare(b.label));

export const truckField: BreakdownField = {
	name: "truckNumber",
	fieldVariant: FIELD_VARIANT.INPUT,
	label: "Truck Number*",
	placeholder: "Type here",
	numericOnly: true,
};

export const buildIssueCategoryField = (options: IOptions[]): BreakdownField => ({
	name: "issueCategoryId",
	fieldVariant: FIELD_VARIANT.SELECT,
	label: "Issue Category*",
	placeholder: "Select",
	options,
});

export const buildIssueTypeField = (options: IOptions[]): BreakdownField => ({
	name: "issueTypeId",
	fieldVariant: FIELD_VARIANT.SELECT,
	label: "Issue Type*",
	placeholder: "Select",
	options,
});

export const breakdownDescriptionField: BreakdownField = {
	name: "description",
	fieldVariant: FIELD_VARIANT.TEXTAREA,
	label: "Description",
	placeholder: "Type here",
};
