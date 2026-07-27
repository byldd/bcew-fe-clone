import { z } from "zod";
import { TimeSource } from "../enums";

export const rosterDaySchema = z
	.object({
		id: z.string(),
		dayStartTime: z.string(),
		dayEndTime: z.string(),
		timeSource: z.nativeEnum(TimeSource),
	})
	.superRefine((data, ctx) => {
		if (data.timeSource === TimeSource.CUSTOM) {
			if (data.dayStartTime > data.dayEndTime) {
				ctx.addIssue({
					path: ["dayEndTime"],
					code: z.ZodIssueCode.custom,
					message: "End time must be greater than or equal to start time",
				});
			}
		}
	});

export const rosterSyncSchema = z.object({
	days: z.array(rosterDaySchema),
});

export type RosterSyncFormValues = z.infer<typeof rosterSyncSchema>;
