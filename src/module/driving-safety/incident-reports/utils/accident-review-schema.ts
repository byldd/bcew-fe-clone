import { z } from "zod";

const documentSchema = z.object({
	keyFile: z.string(),
	url: z.string(),
	file: z.instanceof(File).optional(),
});

export const accidentReviewSchema = z.object({
	violationTypeId: z.string().min(1, "Violation type is required"),
	overrideReason: z.string().optional(),
	repairEstimate: z.array(documentSchema),
	insuranceCorrespondence: z.array(documentSchema),
});

export type IAccidentReviewSchema = z.infer<typeof accidentReviewSchema>;
