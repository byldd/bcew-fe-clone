import { z } from "zod";
import { E_ALERT_RECIPIENT } from "../types/alert";

export const sendAlertFormSchema = z
	.object({
		recipient: z.enum([
			E_ALERT_RECIPIENT.ALL,
			E_ALERT_RECIPIENT.TEAM,
			E_ALERT_RECIPIENT.INDIVIDUAL,
			E_ALERT_RECIPIENT.CREW,
			E_ALERT_RECIPIENT.SUB_CONTRACTOR,
		]),
		teamIds: z.array(z.string())?.optional(),
		userIds: z.array(z.string())?.optional(),
		crewIds: z.array(z.string())?.optional(),
		subContractorIds: z.array(z.string())?.optional(),
		message: z.string().min(1, "Message is required"),
	})
	.superRefine((data, ctx) => {
		if (data.recipient === E_ALERT_RECIPIENT.TEAM && !data.teamIds?.length) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Team is required",
				path: ["teamIds"],
			});
		}
		if (data.recipient === E_ALERT_RECIPIENT.INDIVIDUAL && !data.userIds?.length) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Individual is required",
				path: ["individualIds"],
			});
		}
		if (data.recipient === E_ALERT_RECIPIENT.CREW && !data.crewIds?.length) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Crew is required",
				path: ["crewIds"],
			});
		}
		if (data.recipient === E_ALERT_RECIPIENT.SUB_CONTRACTOR && !data.subContractorIds?.length) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Sub Contractor is required",
				path: ["subContractorIds"],
			});
		}
	});

export type ISendAlertFormSchema = z.infer<typeof sendAlertFormSchema>;
