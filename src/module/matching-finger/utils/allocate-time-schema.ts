import { z } from "zod";
import { isTimeBefore } from "@/lib/utils/date";

export const allocateStopSchema = z
	.object({
		assignmentId: z.string(),
		didNotWorked: z.boolean(),
		selectedPairId: z.string().nullable(),
		startLogId: z.string().nullable(),
		endLogId: z.string().nullable(),
		startTime: z.string().nullable(),
		endTime: z.string().nullable(),
	})
	.superRefine((stop, ctx) => {
		if (stop.didNotWorked) return;

		if (!stop.startTime) {
			ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Start time is required", path: ["startTime"] });
		}

		if (!stop.endTime) {
			ctx.addIssue({ code: z.ZodIssueCode.custom, message: "End time is required", path: ["endTime"] });
		}

		if (stop.startTime && stop.endTime && !isTimeBefore(stop.startTime, stop.endTime)) {
			ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Start time must be before end time", path: ["endTime"] });
		}
	});

export const allocateTimeFormSchema = z.object({
	stops: z.array(allocateStopSchema),
});

export type IAllocateTimeFormSchema = z.infer<typeof allocateTimeFormSchema>;
