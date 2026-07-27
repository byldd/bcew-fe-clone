import { z } from "zod";

export const teamTimeSchema = z
	.object({
		id: z.string(),
		name: z.string(),
		dayStartTime: z.string(),
		dayEndTime: z.string(),
		isPauseAllowed: z.boolean(),
	})
	.superRefine((data, ctx) => {
		if (data.dayStartTime >= data.dayEndTime) {
			ctx.addIssue({
				path: ["dayEndTime"],
				code: z.ZodIssueCode.custom,
				message: "End time must be greater than start time",
			});
		}
	});

export const teamsFormSchema = z.object({
	teams: z.array(teamTimeSchema),
});

export type TeamsFormValues = z.infer<typeof teamsFormSchema>;
