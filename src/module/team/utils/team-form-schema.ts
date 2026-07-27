import z from "zod";

export const teamSchema = z
	.object({
		name: z.string().trim().min(1, "Team name is required"),
		dayStartTime: z.string().min(1, "Day start time is required"),
		dayEndTime: z.string().min(1, "Day end time is required"),
		isPauseAllowed: z.boolean(),
	})
	.refine((data) => new Date(data.dayEndTime).getTime() > new Date(data.dayStartTime).getTime(), {
		message: "End time must be after start time",
		path: ["dayEndTime"],
	});

export type TeamFormValues = z.infer<typeof teamSchema>;
