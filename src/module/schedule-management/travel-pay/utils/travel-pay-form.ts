import { z } from "zod";
import { TRAVEL_PAY_REQUEST_STATUS } from "../types";

export const travelPayStatusFormSchema = z
	.object({
		status: z.string().min(1, "Status is required"),
		note: z.string().optional(),
	})
	.superRefine((data, ctx) => {
		if (data.status == TRAVEL_PAY_REQUEST_STATUS.REJECTED && !data.note) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Note is required when status is rejected",
				path: ["note"],
			});
		}
	});

export type ITravelPayStatusFormSchema = z.infer<typeof travelPayStatusFormSchema>;
