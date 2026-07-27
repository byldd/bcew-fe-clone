import { z } from "zod";
import { MIDDAY_STOP_TYPE } from "@/module/midday-stops/utils/enums";

export const foremanAddJobFormSchema = z
	.object({
		stopNumber: z.number().optional().nullable(),
		bcewSchlinExtendedId: z.number().optional().nullable(),
		bcewSchlinIdnum: z.string().optional().nullable(),
		bcewSrvinvIdnum: z.string().optional().nullable(),
		qcType: z.string().optional().nullable(),
		specialJobId: z.string().optional().nullable(),
		actrec: z.number().optional(),
		project: z.string().optional(),
		jobType: z.nativeEnum(MIDDAY_STOP_TYPE),
	})
	.superRefine((data, ctx) => {
		if (data.jobType === MIDDAY_STOP_TYPE.WORK_ORDER) {
			if (!data.bcewSrvinvIdnum) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "Select a work order",
					path: ["bcewSrvinvIdnum"],
				});
			}
		}

		if (data.jobType === MIDDAY_STOP_TYPE.PROJECT) {
			if (!data.actrec) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "Select a job",
					path: ["actrec"],
				});
			}
			if (!data.bcewSchlinExtendedId && !data.bcewSchlinIdnum) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "Select a phase",
					path: ["bcewSchlinIdnum"],
				});
			}

			if ((data.bcewSchlinExtendedId || data.bcewSchlinIdnum) && data.bcewSrvinvIdnum) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "Select only one of phase or work order",
					path: ["bcewSchlinIdnum"],
				});
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "Select only one of phase or work order",
					path: ["bcewSrvinvIdnum"],
				});
			}
		}
	});

export type IForemanAddJobFormSchema = z.infer<typeof foremanAddJobFormSchema>;
