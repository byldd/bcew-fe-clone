import { FIELD_VARIANT, type FormFieldConfig, type IOptions } from "@/components/common/form/types";
import { toFormattedDate } from "@/lib/utils/date";
import { DATE_FORMAT } from "@/types/date";
import { JOB_SITE_INJURY_MEDICAL_ACTION, YES_NO } from "../enums";
import { IJobSiteInjurySchema } from "./job-site-injury-schema";

// Shared by the Job Site Injury (technician + admin) and Job Site Safety
// Violation forms — all three gate their job-site select on the same
// assigned-jobs lookup.
export const buildNoJobAssignmentMessage = (date: Date): string =>
	`No job assignment found for ${toFormattedDate(date, DATE_FORMAT.MM_SLASH_DD_YYYY)}.`;

type JobSiteInjuryField = FormFieldConfig<IJobSiteInjurySchema>;

export const equipmentMalfunctionOptions: IOptions[] = [
	{ label: "Yes", value: YES_NO.YES },
	{ label: "No", value: YES_NO.NO },
];

export const medicalActionOptions: IOptions[] = [
	{ label: "No Action", value: JOB_SITE_INJURY_MEDICAL_ACTION.NO_ACTION },
	{ label: "Treatment Needed", value: JOB_SITE_INJURY_MEDICAL_ACTION.TREATMENT_NEEDED },
	{ label: "Treatment + Drug Screen", value: JOB_SITE_INJURY_MEDICAL_ACTION.TREATMENT_AND_DRUG_SCREEN },
];

export const buildJobSiteField = (options: IOptions[], hasInjuryDate: boolean): JobSiteInjuryField => ({
	name: "jobDailyRecordId",
	fieldVariant: FIELD_VARIANT.SELECT,
	label: "Where did the Injury Occur?*",
	placeholder: "Select job Site",
	disabled: !hasInjuryDate,
	options,
});

export const incidentDetailFields: JobSiteInjuryField[] = [
	{
		name: "howInjuryOccurred",
		fieldVariant: FIELD_VARIANT.TEXTAREA,
		label: "How did the Injury Occur?*",
		placeholder: "Describe how it happened",
	},
	{
		name: "bodyPartInjured",
		fieldVariant: FIELD_VARIANT.INPUT,
		label: "What body part is Injured?*",
		placeholder: "Name the parts",
	},
];

export const equipmentMalfunctionField: JobSiteInjuryField = {
	name: "equipmentMalfunction",
	fieldVariant: FIELD_VARIANT.RADIO_GROUP,
	label: "Did Equipment Malfunction?",
	options: equipmentMalfunctionOptions,
};

export const equipmentMalfunctionExplainField: JobSiteInjuryField = {
	name: "equipmentMalfunctionExplain",
	fieldVariant: FIELD_VARIANT.TEXTAREA,
	label: "Explain*",
	placeholder: "Enter here",
};

export const medicalActionField: JobSiteInjuryField = {
	name: "medicalAction",
	fieldVariant: FIELD_VARIANT.RADIO_GROUP,
	options: medicalActionOptions,
	className: "flex-col flex-nowrap gap-3 items-start",
};

export const doctorsMedicsField: JobSiteInjuryField = {
	name: "doctorsMedics",
	fieldVariant: FIELD_VARIANT.INPUT,
	label: "Doctors / Medics*",
	placeholder: "Names",
};

export const recommendationFields: JobSiteInjuryField[] = [
	{
		name: "immediateAction",
		fieldVariant: FIELD_VARIANT.TEXTAREA,
		label: "Immediate action taken to prevent recurrence",
		placeholder: "Immediate action",
	},
	{
		name: "permanentSolution",
		fieldVariant: FIELD_VARIANT.TEXTAREA,
		label: "Can you identify a permanent solution",
		placeholder: "Permanent solution",
	},
];
