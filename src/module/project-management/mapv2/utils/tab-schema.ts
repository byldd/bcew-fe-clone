import { z } from "zod";

// `mapZoneTypeId` (not `id`) deliberately - react-hook-form's useFieldArray reserves `id` on
// each row for its own internal React key, so naming our own identifier `id` here would get
// silently overwritten.
export const tabFormSchema = z.object({
	name: z.string().min(1, "Tab name is required"),
	types: z
		.array(
			z.object({
				mapZoneTypeId: z.string().optional(),
				name: z.string().min(1, "Zone type name is required"),
			})
		)
		.min(1, "Add at least one zone type")
		.superRefine((types, ctx) => {
			const seen = new Set<string>();
			types.forEach((type, index) => {
				const key = type.name.trim().toLowerCase();
				if (seen.has(key)) {
					ctx.addIssue({ code: z.ZodIssueCode.custom, path: [index, "name"], message: "Duplicate zone type name" });
				}
				seen.add(key);
			});
		}),
});

export type ITabFormSchema = z.infer<typeof tabFormSchema>;
