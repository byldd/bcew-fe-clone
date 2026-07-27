import z from "zod";

export const rosterTimeSchema = z
	.object({
		dayStartTime: z.string().nonempty("Start time is required"),
		dayEndTime: z.string().nonempty("End time is required"),
		applyWholeWeek: z.boolean().optional(),
	})
	.superRefine((data, ctx) => {
		if (data.dayStartTime && data.dayEndTime) {
			if (data.dayStartTime >= data.dayEndTime) {
				ctx.addIssue({
					path: ["dayEndTime"],
					code: z.ZodIssueCode.custom,
					message: "End time must be greater than start time",
				});
			}
		}
	});

export type RosterTimeForm = z.infer<typeof rosterTimeSchema>;
