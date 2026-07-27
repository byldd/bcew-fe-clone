import { getImageSchema } from "@/module/schedule-management/weekly-schedule-management/utils/mark-not-ready-form";
import z from "zod";

/**
 * When subcontractor admin/crew or technician mark a job as not ready.
 */
export const markNotReadyFormSchema = z
	.object({
		isReady: z.boolean({
			required_error: "Please select an option",
		}),
		isClean: z.boolean({
			required_error: "Please select an option",
		}),
		note: z.string().optional(),
		images: z.array(getImageSchema()),
	})
	.superRefine((data, ctx) => {
		if (!data.isReady || !data.isClean) {
			if (data.images.length === 0) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "Please upload image",
					path: ["images"],
				});
			}
			if (!data.note) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "Please add note",
					path: ["note"],
				});
			}
		}
	});

export type IMarkNotReadyFormSchema = z.infer<typeof markNotReadyFormSchema>;
