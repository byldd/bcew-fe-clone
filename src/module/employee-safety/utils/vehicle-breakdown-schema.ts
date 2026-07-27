import { z } from "zod";

export const vehicleBreakdownSchema = z.object({
	truckNumber: z.string().min(1, { message: "Truck number is required" }),
	issueCategoryId: z.string().min(1, { message: "Issue category is required" }),
	issueTypeId: z.string().min(1, { message: "Issue type is required" }),
	description: z.string().optional(),
});

export type IVehicleBreakdownSchema = z.infer<typeof vehicleBreakdownSchema>;
