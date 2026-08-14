import { z } from "zod";
import { getImageSchema } from "@/module/schedule-management/weekly-schedule-management/utils/mark-not-ready-form";
import { ALLOWED_DOCUMENT_FILE_TYPES } from "@/utils/constants";

// Draft-friendly: everything optional. Required-field rules are enforced server-side
// on submit; the client mirrors them before calling submit.
export const jobSiteInjurySchema = z.object({
	// Incident details
	injuryDate: z.date().optional(),
	injuryTime: z.string().optional(),
	jobDailyRecordId: z.string().optional(),
	howInjuryOccurred: z.string().optional(),
	bodyPartInjured: z.string().optional(),
	equipmentMalfunction: z.string().optional(),
	equipmentMalfunctionExplain: z.string().optional(),

	// Medical details
	medicalAction: z.string().optional(),
	medicalTreatmentLocation: z.string().optional(),
	isMedicalTreatmentLocationOther: z.boolean().optional(),
	treatmentStartDate: z.date().optional(),
	treatmentEndDate: z.date().optional(),
	doctorsMedics: z.string().optional(),
	drugScreenLocation: z.string().optional(),

	// Recommendations
	immediateAction: z.string().optional(),
	permanentSolution: z.string().optional(),

	// Documents
	photos: z.array(getImageSchema(ALLOWED_DOCUMENT_FILE_TYPES)).optional(),

	// Confirmation
	isConfirmedAccurate: z.boolean().optional(),
});

export type IJobSiteInjurySchema = z.infer<typeof jobSiteInjurySchema>;
