import { z } from "zod";

export const fingerprintRequestSchema = z
	.object({
		startTime: z.string().min(1, "Start time is required."),
		endTime: z.string().min(1, "End time is required."),
		lateReason: z.string().optional(),
		earlyReason: z.string().optional(),
		note: z.string().optional(),
		isLateStart: z.boolean(),
		isEarlyQuit: z.boolean(),
	})
	.superRefine((data, ctx) => {
		if (data.isLateStart && !data.lateReason?.trim()) {
			ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Late start reason is required.", path: ["lateReason"] });
		}
		if (data.isEarlyQuit && !data.earlyReason?.trim()) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Early quit reason is required.",
				path: ["earlyReason"],
			});
		}
		if (!data.isLateStart && !data.isEarlyQuit && !data.note?.trim()) {
			ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Note is required.", path: ["note"] });
		}
	});

export type IFingerprintRequestFormSchema = z.infer<typeof fingerprintRequestSchema>;
