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

	// Inputs the admin fills in before sending for the President's review.
	bcewVehicleTowed: z.string().optional(),
	towProviderName: z.string().optional(),
	towCostOnSpot: z.coerce.number().optional(),
	otherVehicleTowed: z.string().optional(),
	otherVehicleTowCost: z.coerce.number().optional(),
	vehicleImpounded: z.string().optional(),
	impoundLotCost: z.coerce.number().optional(),
	impoundReleaseCharges: z.coerce.number().optional(),

	drugScreenNeeded: z.string().optional(),
	medicalCareNeeded: z.string().optional(),
	medicalTreatmentLocation: z.string().optional(),
	medicalTreatmentLocationOther: z.string().optional(),

	emailFrom: z.string().optional(),
	emailTo: z.string().optional(),
	emailCc: z.string().optional(),
	emailSubject: z.string().optional(),
	emailIntro: z.string().optional(),
	emailClosing: z.string().optional(),
});

export type IAccidentReviewSchema = z.infer<typeof accidentReviewSchema>;
