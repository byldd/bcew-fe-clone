import { z } from "zod";
import { MIDDAY_STOP_REQUEST_TYPE, MIDDAY_STOP_TYPE } from "./enums";
import { toDate } from "@/lib/utils/date";
import { QC_JOB_TYPE } from "@/module/schedule-management/weekly-schedule-management/types/schedule-interface";

export const verifyMDTRPayloadZod = (
	data: {
		startTime: string;
		endTime: string;
	},
	ctx: z.RefinementCtx,
	rosterStartTime?: string | Date,
	rosterEndTime?: string | Date
) => {
	if (!rosterStartTime || !rosterEndTime) {
		ctx.addIssue({
			code: z.ZodIssueCode.custom,
			message: "No schedule available",
		});
		return;
	}
	if (!data.startTime) {
		ctx.addIssue({
			path: ["startTime"],
			code: z.ZodIssueCode.custom,
			message: "Start time is required",
		});
	}
	if (!data.endTime) {
		ctx.addIssue({
			path: ["endTime"],
			code: z.ZodIssueCode.custom,
			message: "End time is required",
		});
		return;
	}

	const startTime = toDate(data.startTime);
	const endTime = toDate(data.endTime);
	const rosterStart = toDate(rosterStartTime);
	const rosterEnd = toDate(rosterEndTime);

	if (startTime >= rosterEnd) {
		ctx.addIssue({
			path: ["startTime"],
			code: z.ZodIssueCode.custom,
			message: "Start Time must be less than the roster end time",
		});
	}

	if (endTime <= rosterStart) {
		ctx.addIssue({
			path: ["endTime"],
			code: z.ZodIssueCode.custom,
			message: "End time must be greater than roster start time",
		});
	}

	if (startTime >= endTime) {
		ctx.addIssue({
			path: ["startTime"],
			code: z.ZodIssueCode.custom,
			message: "Start time must be less than end time",
		});
	}

	if (startTime < rosterStart) {
		ctx.addIssue({
			path: ["startTime"],
			code: z.ZodIssueCode.custom,
			message: "Start time must be greater than or equal to roster start time",
		});
	}

	if (endTime > rosterEnd) {
		ctx.addIssue({
			path: ["endTime"],
			code: z.ZodIssueCode.custom,
			message: "End time must be less than or equal to roster end time",
		});
	}
};

export const middayStopsFormSchema = ({ minStartTime, maxEndTime }: { minStartTime: string; maxEndTime: string }) =>
	z
		.object({
			requestType: z.enum([
				MIDDAY_STOP_REQUEST_TYPE.VEHICLE_BREAKDOWN,
				MIDDAY_STOP_REQUEST_TYPE.VEHICLE_MAINTENANCE,
				MIDDAY_STOP_REQUEST_TYPE.ADD_NEW_STOP,
				MIDDAY_STOP_REQUEST_TYPE.PAID_IDLE_TIME,
			]),
			note: z.string().optional(),
			startTime: z.string().min(1, "Start time is required"),
			endTime: z.string().min(1, "End time is required"),
		})
		.superRefine((data, ctx) => {
			verifyMDTRPayloadZod(data, ctx, minStartTime, maxEndTime);
		});

export type IMiddayStopsFormSchema = z.infer<ReturnType<typeof middayStopsFormSchema>>;

export const addNewMiddayJobFormSchema = ({ minStartTime, maxEndTime }: { minStartTime: string; maxEndTime: string }) =>
	z
		.object({
			stopType: z.nativeEnum(MIDDAY_STOP_TYPE),
			stopNumber: z.number().optional().nullable(),
			bcewSchlinExtendedId: z.number().optional().nullable(),
			bcewSchlinIdnum: z.string().optional().nullable(),
			bcewSrvinvIdnum: z.string().optional().nullable(),
			qcType: z.nativeEnum(QC_JOB_TYPE).nullable(),
			specialJobId: z.string().optional().nullable(),
			actrec: z.number().optional(),
			project: z.string().min(1, "Select a project"),
			note: z.string().optional(),
			startTime: z.string().min(1, "Start time is required"),
			endTime: z.string().min(1, "End time is required"),
		})
		.superRefine((data, ctx) => {
			if (data.stopType === MIDDAY_STOP_TYPE.PROJECT) {
				if (!data.project) {
					ctx.addIssue({
						path: ["project"],
						message: "Select a project",
						code: z.ZodIssueCode.custom,
					});
				}
				if (!data.actrec) {
					ctx.addIssue({
						path: ["actrec"],
						message: "Select a job",
						code: z.ZodIssueCode.custom,
					});
				}
			}

			if (data.stopType === MIDDAY_STOP_TYPE.WORK_ORDER) {
				if (!data.bcewSrvinvIdnum) {
					ctx.addIssue({
						path: ["bcewSrvinvIdnum"],
						message: "Work order is required",
						code: z.ZodIssueCode.custom,
					});
				}
			}

			if (data.stopType === MIDDAY_STOP_TYPE.SPECIAL_JOB) {
				if (!data.specialJobId) {
					ctx.addIssue({
						path: ["specialJobId"],
						message: "Select a special job",
						code: z.ZodIssueCode.custom,
					});
				}
			}

			if (data.actrec) {
				if (!data.bcewSchlinExtendedId && !data.bcewSchlinIdnum) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						message: "Select a phase or work order",
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
			verifyMDTRPayloadZod(data, ctx, minStartTime, maxEndTime);
		});

export type IAddNewMiddayJobFormSchema = z.infer<ReturnType<typeof addNewMiddayJobFormSchema>>;
