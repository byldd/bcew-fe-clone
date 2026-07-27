import { z } from "zod";
import { allocateStopSchema } from "@/module/matching-finger/utils/allocate-time-schema";

const pauseEntrySchema = z.object({
	id: z.string().optional(),
	pauseStartTime: z.string(),
	pauseEndTime: z.string().nullable().optional(),
});

export const fingerprintPreviewFormSchema = z
	.object({
		stops: z.array(allocateStopSchema),
		hasPause: z.boolean(),
		pauseTimes: z.array(pauseEntrySchema),
		pauseReason: z.string(),
	})
	.superRefine((data, ctx) => {
		if (data.hasPause && data.pauseTimes.length > 0 && !data.pauseReason.trim()) {
			ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Pause reason is required", path: ["pauseReason"] });
		}
	});

export type IFingerprintPreviewFormSchema = z.infer<typeof fingerprintPreviewFormSchema>;
