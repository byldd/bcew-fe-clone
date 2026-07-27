import { z } from "zod";
import { E_WEEKEND_WORKING_MODE } from "../types/schedule-configuration";
import { setTime } from "@/lib/utils/date";

export const updateScheduleConfigFormSchema = z
	.object({
		isSaturdayWorking: z.boolean(),
		isSundayWorking: z.boolean(),
		saturdayWorkingMode: z.nativeEnum(E_WEEKEND_WORKING_MODE),
		saturdayWorkingUsersIds: z.array(z.string()),

		sameAsSaturday: z.boolean().optional(),

		sundayWorkingMode: z.nativeEnum(E_WEEKEND_WORKING_MODE),
		sundayWorkingUsersIds: z.array(z.string()),
		specialJobs: z.array(
			z.object({
				id: z.string().optional(),
				isVisible: z.boolean(),
				name: z.string().min(1, "Name is required"),
				isDeleted: z.boolean(),
				sequence: z.number().optional(),
				teamIds: z.array(z.string()).optional(),
				zones: z
					.array(
						z.object({
							geoTabId: z.string(),
							name: z.string(),
							address: z.string(),
							isCurrent: z.boolean().optional(),
						})
					)
					.optional(),
			})
		),
	})
	.superRefine(
		(
			{
				saturdayWorkingMode,
				saturdayWorkingUsersIds,
				sundayWorkingMode,
				sundayWorkingUsersIds,
				isSaturdayWorking,
				isSundayWorking,
				sameAsSaturday,
				specialJobs,
			},
			ctx
		) => {
			if (
				saturdayWorkingMode === E_WEEKEND_WORKING_MODE.VOLUNTARY &&
				isSaturdayWorking &&
				saturdayWorkingUsersIds.length === 0
			) {
				ctx.addIssue({
					path: ["saturdayWorkingUsersIds"],
					code: z.ZodIssueCode.custom,
					message: "Please select voluntary users",
				});
			}
			if (
				sundayWorkingMode === E_WEEKEND_WORKING_MODE.VOLUNTARY &&
				isSundayWorking &&
				sundayWorkingUsersIds.length === 0 &&
				!sameAsSaturday
			) {
				ctx.addIssue({
					path: ["sundayWorkingUsersIds"],
					code: z.ZodIssueCode.custom,
					message: "Please select voluntary users",
				});
			}
			const nameMap = new Map<string, boolean>();
			specialJobs
				?.filter((specialJob) => !specialJob.isDeleted)
				.forEach((specialJob, index) => {
					if (nameMap.has(specialJob.name)) {
						ctx.addIssue({
							path: [`specialJobs.${index}.name`],
							code: z.ZodIssueCode.custom,
							message: "Names should be unique",
						});
					}
					nameMap.set(specialJob.name, true);
				});
		}
	);

export const updateScheduleDayTimeConfigFormSchema = z
	.object({
		dayStartTime: z.string().min(1, "Day start time is required"),
		dayEndTime: z.string().min(1, "Day end time is required"),
		dayConfigFrom: z.date(),
		dayConfigTo: z.date(),
		note: z.string().optional(),
	})
	.superRefine(({ dayConfigFrom, dayConfigTo, dayStartTime, dayEndTime }, ctx) => {
		if (dayConfigFrom > dayConfigTo) {
			ctx.addIssue({
				path: ["dayConfigFrom"],
				code: z.ZodIssueCode.custom,
				message: "From date must be before to date",
			});
		}
		if (setTime(new Date(), dayStartTime) >= setTime(new Date(), dayEndTime)) {
			ctx.addIssue({
				path: ["dayStartTime"],
				code: z.ZodIssueCode.custom,
				message: "Start time must be before end time",
			});
		}
	});

export type IUpdateScheduleConfigFormSchema = z.infer<typeof updateScheduleConfigFormSchema>;
export type IUpdateScheduleDayTimeConfigFormSchema = z.infer<typeof updateScheduleDayTimeConfigFormSchema>;
