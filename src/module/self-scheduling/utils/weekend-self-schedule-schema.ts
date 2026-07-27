import { z } from "zod";
import { MIDDAY_STOP_TYPE } from "@/module/midday-stops/utils/enums";
import { getTodayDate, toDate } from "@/lib/utils/date";
import { QC_JOB_TYPE } from "@/module/schedule-management/weekly-schedule-management/types/schedule-interface";

export const weekendSelfScheduleSchema = () =>
	z
		.object({
			jobs: z.array(
				z.object({
					jobType: z.nativeEnum(MIDDAY_STOP_TYPE),

					project: z.string().optional(),
					actrec: z.number().optional(),

					specialJobId: z.string().optional().nullable(),

					bcewSchlinExtendedId: z.number().optional().nullable(),
					bcewSchlinIdnum: z.string().optional().nullable(),
					bcewSrvinvIdnum: z.string().optional().nullable(),
					qcType: z.nativeEnum(QC_JOB_TYPE).optional().nullable(),

					date: z.string().optional().nullable(),
					startTime: z.string().optional().nullable(),
					endTime: z.string().optional().nullable(),

					note: z.string().optional().nullable(),
				})
			),
		})

		.superRefine((data, ctx) => {
			data?.jobs?.forEach((job, index) => {
				// PROJECT FLOW
				if (job.jobType === MIDDAY_STOP_TYPE.PROJECT) {
					if (!job.project) {
						ctx.addIssue({
							code: z.ZodIssueCode.custom,
							message: "Select a project",
							path: [`jobs.${index}.project`],
						});
					}

					if (!job.actrec) {
						ctx.addIssue({
							code: z.ZodIssueCode.custom,
							message: "Select a job",
							path: [`jobs.${index}.actrec`],
						});
					}
				}

				// WORK ORDER FLOW
				if (job.jobType === MIDDAY_STOP_TYPE.WORK_ORDER) {
					if (!job.bcewSrvinvIdnum) {
						ctx.addIssue({
							code: z.ZodIssueCode.custom,
							message: "Work Order is required",
							path: [`jobs.${index}.bcewSrvinvIdnum`],
						});
					}
				}

				// SPECIAL JOB FLOW
				if (job.jobType === MIDDAY_STOP_TYPE.SPECIAL_JOB) {
					if (!job.specialJobId) {
						ctx.addIssue({
							code: z.ZodIssueCode.custom,
							message: "Select a special job",
							path: [`jobs.${index}.specialJobId`],
						});
					}
				}

				// PHASE VALIDATION
				if (job.actrec) {
					if (!job.bcewSchlinExtendedId && !job.bcewSchlinIdnum) {
						ctx.addIssue({
							code: z.ZodIssueCode.custom,
							message: "Select a phase",
							path: [`jobs.${index}.bcewSchlinIdnum`],
						});
					}

					if ((job.bcewSchlinExtendedId || job.bcewSchlinIdnum) && job.bcewSrvinvIdnum) {
						ctx.addIssue({
							code: z.ZodIssueCode.custom,
							message: "Select only one of phase or work order",
							path: [`jobs.${index}.bcewSchlinIdnum`],
						});
					}
				}

				if (!job.date) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						message: "Select a date",
						path: [`jobs.${index}.date`],
					});
				}

				if (job.date && toDate(job.date) < getTodayDate()) {
					if (!job.startTime) {
						ctx.addIssue({
							code: z.ZodIssueCode.custom,
							message: "Start time is required",
							path: [`jobs.${index}.startTime`],
						});
					}

					if (!job.endTime) {
						ctx.addIssue({
							code: z.ZodIssueCode.custom,
							message: "End time is required",
							path: [`jobs.${index}.endTime`],
						});
					}

					if (job.startTime && job.endTime) {
						const start = toDate(job.startTime);
						const end = toDate(job.endTime);

						if (start >= end) {
							ctx.addIssue({
								code: z.ZodIssueCode.custom,
								message: "Start time must be less than end time",
								path: [`jobs.${index}.startTime`],
							});
						}
					}
				}
			});
		});

export type IweekendSelfScheduleSchema = z.infer<ReturnType<typeof weekendSelfScheduleSchema>>;
