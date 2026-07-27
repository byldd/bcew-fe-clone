import { z } from "zod";
import { MAX_DESCRIPTION_LENGTH, MAX_IMAGES } from "../utils/consttants";

export const imageSchema = z.object({
	keyFile: z.string(),
	file: z.any().optional(),
	url: z.string(),
});

export const missingItemFormSchema = z.object({
	description: z
		.string()
		.trim()
		.min(1, "Description is required")
		.max(MAX_DESCRIPTION_LENGTH, `Description must be at most ${MAX_DESCRIPTION_LENGTH} characters`),
	quantity: z.coerce
		.number({ invalid_type_error: "Quantity is required" })
		.int("Quantity must be a whole number")
		.positive("Quantity must be greater than 0"),
	images: z.array(imageSchema).max(MAX_IMAGES, `A maximum of ${MAX_IMAGES} images is allowed`),
});

export type MissingItemFormValues = z.infer<typeof missingItemFormSchema>;
