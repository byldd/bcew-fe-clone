import { FIELD_VARIANT, type FormFieldConfig, type IOptions } from "@/components/common/form/types";
import { INCIDENT_SEVERITY } from "@/module/driving-safety/incident-reports/utils/enums";
import { INCIDENT_SEVERITY_META } from "@/module/driving-safety/incident-reports/utils/constants";
import { IDrivingSafetyViolationSchema } from "./driving-safety-violation-schema";

type ViolationField = FormFieldConfig<IDrivingSafetyViolationSchema>;

export const buildTruckField = (options: IOptions[]): ViolationField => ({
	name: "truckNumber",
	fieldVariant: FIELD_VARIANT.SELECT,
	label: "Truck Number*",
	placeholder: "Select Truck",
	options,
});

export const buildViolationTypeField = (options: IOptions[]): ViolationField => ({
	name: "violationTypeId",
	fieldVariant: FIELD_VARIANT.SELECT,
	label: "Violation Type*",
	placeholder: "Please select violation type",
	options,
});

export const severityOptions: IOptions[] = Object.values(INCIDENT_SEVERITY).map((severity) => ({
	label: INCIDENT_SEVERITY_META[severity].label,
	value: severity,
}));

export const severityField: ViolationField = {
	name: "severity",
	fieldVariant: FIELD_VARIANT.SELECT,
	label: "Severity",
	placeholder: "Select Severity",
	options: severityOptions,
};

export const descriptionField: ViolationField = {
	name: "description",
	fieldVariant: FIELD_VARIANT.TEXTAREA,
	label: "Description of Violation*",
	placeholder: "Enter here",
};
