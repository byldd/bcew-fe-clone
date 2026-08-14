import { z } from "zod";

export const adminVehicleBreakdownSchema = z
	.object({
		truckNumber: z.string().min(1, { message: "Truck number is required" }),
		issueCategoryId: z.string().min(1, { message: "Issue category is required" }),
		issueTypeId: z.string().min(1, { message: "Issue type is required" }),
		description: z.string().optional(),
		bcewVehicleTowed: z.boolean(),
		costOnSpot: z.string().optional(),
	})
	// Cost is only asked for when the vehicle was towed, and then it's required.
	.superRefine((data, ctx) => {
		if (data.bcewVehicleTowed && !data.costOnSpot?.trim()) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				path: ["costOnSpot"],
				message: "Cost is required when the vehicle was towed",
			});
		}
	});

export type IAdminVehicleBreakdownSchema = z.infer<typeof adminVehicleBreakdownSchema>;
