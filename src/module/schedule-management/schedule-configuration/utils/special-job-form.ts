import z from "zod";

export const specialJobFormSchema = z
	.object({
		specialJobs: z.array(
			z.object({
				id: z.string().optional(),
				isVisible: z.boolean(),
				name: z.string().min(1, "Name is required"),
				isDeleted: z.boolean(),
				sequence: z.number().optional(),
				teamIds: z.array(z.string()).optional(),
				zones: z
					.array(
						z.object({
							geoTabId: z.string(),
							name: z.string(),
							address: z.string(),
							isCurrent: z.boolean().optional(),
						})
					)
					.optional(),
			})
		),
	})

	.superRefine(({ specialJobs }, ctx) => {
		const nameMap = new Map<string, boolean>();
		specialJobs
			?.filter((specialJob) => !specialJob.isDeleted)
			.forEach((specialJob, index) => {
				if (nameMap.has(specialJob.name)) {
					ctx.addIssue({
						path: [`specialJobs.${index}.name`],
						code: z.ZodIssueCode.custom,
						message: "Names should be unique",
					});
				}
				nameMap.set(specialJob.name, true);
			});

		specialJobs?.forEach((specialJob, index) => {
			if (!specialJob.teamIds || specialJob.teamIds.length === 0) {
				ctx.addIssue({
					path: [`specialJobs.${index}.teamIds`],
					code: z.ZodIssueCode.custom,
					message: "Select at least one team",
				});
			}
		});
	});

export type ISpecialJobFormSchema = z.infer<typeof specialJobFormSchema>;
