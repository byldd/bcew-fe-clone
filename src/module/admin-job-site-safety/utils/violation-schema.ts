import { z } from "zod";
import { getImageSchema } from "@/module/schedule-management/weekly-schedule-management/utils/mark-not-ready-form";
import { ALLOWED_DOCUMENT_FILE_TYPES } from "@/utils/constants";

// Office-entered record — no draft state, created directly on submit.
export const violationSchema = z.object({
	jobDailyRecordId: z.string().optional(),
	description: z.string().optional(),
	violationDate: z.date().optional(),
	violationTime: z.string().optional(),
	severity: z.string().optional(),
	locationOnSite: z.string().optional(),
	photos: z.array(getImageSchema(ALLOWED_DOCUMENT_FILE_TYPES)).optional(),
});

export type IViolationSchema = z.infer<typeof violationSchema>;

// Mirrors the backend's validateCreateViolationPayload required-field rules.
// `employeeId` isn't part of this schema — it's checked separately by the form
// itself (it lives outside react-hook-form, as local component state).
export const violationRequiredFieldsSchema = violationSchema.superRefine((data, ctx) => {
	if (!data.jobDailyRecordId) {
		ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Jobsite is required", path: ["jobDailyRecordId"] });
	}
	if (!data.description) {
		ctx.addIssue({
			code: z.ZodIssueCode.custom,
			message: "Description of Violation is required",
			path: ["description"],
		});
	}
	if (!data.violationDate) {
		ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Date is required", path: ["violationDate"] });
	}
});
