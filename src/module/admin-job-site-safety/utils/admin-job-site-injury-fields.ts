import { FIELD_VARIANT, type FormFieldConfig, type IOptions } from "@/components/common/form/types";
import { IJobSiteInjurySchema } from "@/module/employee-safety/utils/job-site-injury-schema";
import { equipmentMalfunctionField } from "@/module/employee-safety/utils/job-site-injury-fields";

// Unlike the technician form (gated on the injury date alone), the admin job-site
// select also needs an employee picked first, so it's a local variant rather than
// reusing employee-safety's buildJobSiteField with a misleading placeholder.
export const buildAdminJobSiteField = (
	options: IOptions[],
	canSelectJobSite: boolean
): FormFieldConfig<IJobSiteInjurySchema> => ({
	name: "jobDailyRecordId",
	fieldVariant: FIELD_VARIANT.SELECT,
	label: "Where did the Injury Occur?*",
	placeholder: canSelectJobSite ? "Select job Site" : "Select employee and date of injury first",
	disabled: !canSelectJobSite,
	options,
});

// A saved report keeps whatever job site it was filed against, but the assigned
// jobs list is rebuilt live from the employee's schedule for that day — an
// assignment that has since changed leaves the saved job with no option to
// match, and the select falls back to its placeholder. Adding it back keeps the
// edit form showing what was actually reported.
export const withSavedJobSiteOption = (
	options: IOptions[],
	savedJobDailyRecordId?: string | null,
	savedJobSiteName?: string | null
): IOptions[] => {
	if (!savedJobDailyRecordId) return options;
	if (options.some((option) => option.value === savedJobDailyRecordId)) return options;
	return [...options, { label: savedJobSiteName ?? "Reported job site", value: savedJobDailyRecordId }];
};

// The technician form leaves this answer optional; the admin form requires it,
// so it carries its own label rather than changing the shared field.
export const adminEquipmentMalfunctionField: FormFieldConfig<IJobSiteInjurySchema> = {
	...equipmentMalfunctionField,
	label: "Did Equipment Malfunction?*",
};

export const drugScreenLocationField: FormFieldConfig<IJobSiteInjurySchema> = {
	name: "drugScreenLocation",
	fieldVariant: FIELD_VARIANT.INPUT,
	label: "Drug Screen Location",
	placeholder: "Where the drug screen was done",
	className: "h-10",
};

export const medicalTreatmentLocationOtherField: FormFieldConfig<IJobSiteInjurySchema> = {
	name: "medicalTreatmentLocation",
	fieldVariant: FIELD_VARIANT.INPUT,
	label: "Enter medical treatment location*",
	placeholder: "Type here",
	className: "h-10",
};
