import { z } from "zod";

export const breakdownReviewSchema = z.object({
	bcewVehicleTowed: z.boolean(),
	costOnSpot: z
		.string()
		.refine((value) => value.trim() === "" || Number(value) >= 0, { message: "Enter a valid cost" }),
});

export type IBreakdownReviewSchema = z.infer<typeof breakdownReviewSchema>;
