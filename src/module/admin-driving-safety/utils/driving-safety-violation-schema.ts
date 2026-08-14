import { z } from "zod";
import { getImageSchema } from "@/module/schedule-management/weekly-schedule-management/utils/mark-not-ready-form";
import { ALLOWED_DOCUMENT_FILE_TYPES } from "@/utils/constants";

// Office-entered record — no draft state, created directly on submit.
export const drivingSafetyViolationSchema = z.object({
	truckNumber: z.string().optional(),
	violationTypeId: z.string().optional(),
	severity: z.string().optional(),
	violationDate: z.date().optional(),
	violationTime: z.string().optional(),
	description: z.string().optional(),
	documents: z.array(getImageSchema(ALLOWED_DOCUMENT_FILE_TYPES)).optional(),
});

export type IDrivingSafetyViolationSchema = z.infer<typeof drivingSafetyViolationSchema>;

// Mirrors the backend's validateCreateViolationPayload required-field rules.
// `employeeId` isn't part of this schema — it's checked separately by the form
// itself (it lives outside react-hook-form, as local component state).
export const drivingSafetyViolationRequiredFieldsSchema = drivingSafetyViolationSchema.superRefine((data, ctx) => {
	if (!data.truckNumber) {
		ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Truck number is required", path: ["truckNumber"] });
	}
	if (!data.violationTypeId) {
		ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Violation type is required", path: ["violationTypeId"] });
	}
	if (!data.description) {
		ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Description is required", path: ["description"] });
	}
	if (!data.violationDate) {
		ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Date is required", path: ["violationDate"] });
	}
});
