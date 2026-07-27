import z from "zod";
import { baseSchema } from "@/module/schedule-management/weekly-schedule-management/utils/create-daily-job-form";
import { getTodayDate } from "@/lib/utils/date";

export const createSubContractorDailyJobFormSchema = baseSchema
	.pick({
		jobName: true,
		jobRecNum: true,
		date: true,
		labelIds: true,
		subcontractorId: true,
		subcontactorCrewLeaderName: true,
	})
	.extend({
		subcontractorCrewId: z.string({
			required_error: "Crew is required",
		}),
	})
	.superRefine((data, ctx) => {
		if (data.date < getTodayDate()) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Date cannot be in the past",
				path: ["date"],
			});
		}

		if (!data.subcontractorCrewId) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Crew is required",
				path: ["subcontractorCrewId"],
			});
		}
	});

export type ICreateSubContractorDailyJobFormSchema = z.infer<typeof createSubContractorDailyJobFormSchema>;
