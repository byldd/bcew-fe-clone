import { FIELD_VARIANT, type FormFieldConfig, type IOptions } from "@/components/common/form/types";
import { INCIDENT_SEVERITY } from "@/module/driving-safety/incident-reports/utils/enums";
import { INCIDENT_SEVERITY_META } from "@/module/driving-safety/incident-reports/utils/constants";
import { IViolationSchema } from "./violation-schema";

export const severityOptions: IOptions[] = Object.values(INCIDENT_SEVERITY).map((severity) => ({
	label: INCIDENT_SEVERITY_META[severity].label,
	value: severity,
}));

export const severityField: FormFieldConfig<IViolationSchema> = {
	name: "severity",
	fieldVariant: FIELD_VARIANT.SELECT,
	label: "Severity",
	placeholder: "Select Severity",
	options: severityOptions,
};

export const descriptionField: FormFieldConfig<IViolationSchema> = {
	name: "description",
	fieldVariant: FIELD_VARIANT.TEXTAREA,
	label: "Description of Violation*",
	placeholder: "Enter here",
};

export const locationOnSiteField: FormFieldConfig<IViolationSchema> = {
	name: "locationOnSite",
	fieldVariant: FIELD_VARIANT.INPUT,
	label: "Location on Site",
	placeholder: "e.g. Unit B05",
	className: "h-10 rounded-[8px]",
};

// Gated on an employee + date being picked first, same as the Job Site Injury form.
export const buildViolationJobSiteField = (
	options: IOptions[],
	canSelectJobSite: boolean
): FormFieldConfig<IViolationSchema> => ({
	name: "jobDailyRecordId",
	fieldVariant: FIELD_VARIANT.SELECT,
	label: "Jobsite*",
	placeholder: canSelectJobSite ? "Select Job" : "Select employee and date first",
	disabled: !canSelectJobSite,
	options,
	className: "h-10 rounded-[8px]",
});
