import { z } from "zod";
import { isSameTime, isTimeBefore } from "@/lib/utils/date";
import { extendedTimeType } from "./enums";
import { IRoster } from "@/module/schedule-management/roster-time-configuration/types";

export const extendedTimeFormSchema = ({
	rosterStartTime,
	rosterEndTime,
	rosterTime,
}: {
	rosterStartTime: string;
	rosterEndTime: string;
	rosterTime: IRoster | undefined;
}) =>
	z
		.object({
			id: z.string().optional(),
			assignmentId: z.string().optional(),
			requestId: z.string().optional(),
			startTime: z.string().optional(),
			endTime: z.string().optional(),
			extendedReason: z.string().min(1, "Reason is required"),
			extendedType: z.nativeEnum(extendedTimeType),
			note: z.string().max(2000, "Maximum 500 characters").optional(),
			jobStartTime: z.string().optional(),
			jobEndTime: z.string().optional(),
			jobDailyRecordId: z.string().optional(),
			stopName: z.string().optional(),
		})
		.superRefine((data, ctx) => {
			const { startTime, endTime, extendedType, jobStartTime, jobEndTime } = data;

			if (!rosterStartTime || !rosterEndTime) {
				ctx.addIssue({
					path: ["startTime"],
					code: z.ZodIssueCode.custom,
					message: "Employee Roster times are missing",
				});
				return;
			}

			const extendedStart = extendedType !== extendedTimeType.LATE_RELEASE ? startTime : rosterStartTime;
			const extendedEnd = extendedType !== extendedTimeType.EARLY_START ? endTime : rosterEndTime;

			const isStartValid = isTimeBefore(extendedStart, rosterStartTime);
			const isEndValid = isTimeBefore(rosterEndTime, extendedEnd);

			if ((extendedType === extendedTimeType.EARLY_START || extendedType === extendedTimeType.BOTH) && !isStartValid) {
				ctx.addIssue({
					path: ["startTime"],
					code: z.ZodIssueCode.custom,
					message: "Early start time must be before roster start time",
				});
			}

			if ((extendedType === extendedTimeType.LATE_RELEASE || extendedType === extendedTimeType.BOTH) && !isEndValid) {
				ctx.addIssue({
					path: ["endTime"],
					code: z.ZodIssueCode.custom,
					message: "Request Time must be after roster end time",
				});
			}

			if (jobStartTime && jobEndTime) {
				if (isTimeBefore(jobEndTime, jobStartTime)) {
					ctx.addIssue({
						path: ["jobStartTime"],
						code: z.ZodIssueCode.custom,
						message: "Job start time must be before job end time",
					});
				}

				if (extendedType === extendedTimeType.EARLY_START) {
					if (!isSameTime(jobStartTime, startTime)) {
						ctx.addIssue({
							path: ["jobStartTime"],
							code: z.ZodIssueCode.custom,
							message: "Early job start time must be equal to extended start time",
						});
					}

					if (rosterTime && isTimeBefore(rosterTime.dayStartTime, jobStartTime)) {
						ctx.addIssue({
							path: ["jobStartTime"],
							code: z.ZodIssueCode.custom,
							message: "Early job start time must be before roster start time",
						});
					}
				}

				if (extendedType === extendedTimeType.LATE_RELEASE) {
					if (!isSameTime(jobEndTime, endTime)) {
						ctx.addIssue({
							path: ["jobEndTime"],
							code: z.ZodIssueCode.custom,
							message: "Late job end time must be equal to extended end time",
						});
					}

					if (rosterTime && isTimeBefore(jobEndTime, rosterTime.dayEndTime)) {
						ctx.addIssue({
							path: ["jobEndTime"],
							code: z.ZodIssueCode.custom,
							message: "Late job end time must be after roster end time",
						});
					}
				}
			}
		});

export type IExtendedTimeFormSchema = z.infer<ReturnType<typeof extendedTimeFormSchema>>;
