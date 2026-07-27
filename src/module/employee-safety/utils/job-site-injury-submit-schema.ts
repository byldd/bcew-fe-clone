import { z } from "zod";
import { JOB_SITE_INJURY_MEDICAL_ACTION, YES_NO } from "../enums";
import { jobSiteInjurySchema } from "./job-site-injury-schema";

const isNonEmpty = (value?: string): boolean => !!value && value.trim().length > 0;

// Mirrors the backend's validateSubmitPayload conditional required-field rules
// (job-site-injury/utils/validations.ts) — everything except the confirmation
// checkbox, so this can double as the "is the form complete enough to submit" check.
export const jobSiteInjuryRequiredFieldsSchema = jobSiteInjurySchema.superRefine((data, ctx) => {
	if (!data.injuryDate) {
		ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Date of injury is required", path: ["injuryDate"] });
	}
	if (!isNonEmpty(data.injuryTime)) {
		ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Time of injury is required", path: ["injuryTime"] });
	}
	if (!isNonEmpty(data.jobDailyRecordId)) {
		ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Job site is required", path: ["jobDailyRecordId"] });
	}
	if (!isNonEmpty(data.howInjuryOccurred)) {
		ctx.addIssue({ code: z.ZodIssueCode.custom, message: "This field is required", path: ["howInjuryOccurred"] });
	}
	if (!isNonEmpty(data.bodyPartInjured)) {
		ctx.addIssue({ code: z.ZodIssueCode.custom, message: "This field is required", path: ["bodyPartInjured"] });
	}
	if (data.equipmentMalfunction === YES_NO.YES && !isNonEmpty(data.equipmentMalfunctionExplain)) {
		ctx.addIssue({
			code: z.ZodIssueCode.custom,
			message: "Please explain the malfunction",
			path: ["equipmentMalfunctionExplain"],
		});
	}

	const requiresTreatmentDetails =
		data.medicalAction === JOB_SITE_INJURY_MEDICAL_ACTION.TREATMENT_NEEDED ||
		data.medicalAction === JOB_SITE_INJURY_MEDICAL_ACTION.TREATMENT_AND_DRUG_SCREEN;
	if (requiresTreatmentDetails) {
		if (!isNonEmpty(data.medicalTreatmentLocation)) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Medical treatment location is required",
				path: ["medicalTreatmentLocation"],
			});
		}
		if (!data.treatmentStartDate) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Dates of treatment is required",
				path: ["treatmentStartDate"],
			});
		}
		if (!isNonEmpty(data.doctorsMedics)) {
			ctx.addIssue({ code: z.ZodIssueCode.custom, message: "This field is required", path: ["doctorsMedics"] });
		}
	}
});

export const jobSiteInjurySubmitSchema = jobSiteInjuryRequiredFieldsSchema.superRefine((data, ctx) => {
	if (data.isConfirmedAccurate !== true) {
		ctx.addIssue({
			code: z.ZodIssueCode.custom,
			message: "You must confirm the information is accurate",
			path: ["isConfirmedAccurate"],
		});
	}
});
