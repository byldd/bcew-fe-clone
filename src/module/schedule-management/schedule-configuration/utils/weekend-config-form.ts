import z from "zod";
import { E_WEEKEND_WORKING_MODE } from "../../weekly-schedule-management/types/schedule-configuration";
import { isWeekendDate } from "@/lib/utils/date";

export const weekendConfigFormSchema = z
	.object({
		userIds: z.array(z.string()).optional(),
		mode: z.nativeEnum(E_WEEKEND_WORKING_MODE).optional(),
		teamIds: z.array(z.string()).optional(),
		crewIds: z.array(z.string()).optional(),
		phaseIds: z.array(z.string()).optional(),
		note: z.string().optional(),
		requiredMemberCount: z.number().nullable().optional(),
		date: z.string().optional(),
	})
	.superRefine((data, ctx) => {
		if (!data.date) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Select working day",
				path: ["date"],
			});
		}

		if (data.date && !isWeekendDate(data.date)) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Select weekend day",
				path: ["date"],
			});
		}

		if (!data.mode) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Select working mode",
				path: ["mode"],
			});
		}

		if (data.mode != E_WEEKEND_WORKING_MODE.NOT_WORKING) {
			if (!data.userIds?.length) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "Select members",
					path: ["userIds"],
				});
			}
		}

		if (data.mode == E_WEEKEND_WORKING_MODE.VOLUNTARY) {
			if (!data.requiredMemberCount) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "Required member count is required",
					path: ["requiredMemberCount"],
				});
			}

			if ((data.requiredMemberCount || 0) < 0) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "Required member count cannot be less than 0",
					path: ["requiredMemberCount"],
				});
			}

			if (data.requiredMemberCount && (data.userIds?.length || 0) < data.requiredMemberCount) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "Select at least required number of members",
					path: ["userIds"],
				});
			}
		}
	});

export type IWeekendConfigFormSchema = z.infer<typeof weekendConfigFormSchema>;

export const getActiveWeekendDates = (todayDate: Date) => {
	const today = new Date(todayDate);
	const day = today.getDay(); // 0 = Sun, 6 = Sat

	const saturday = new Date(today);
	const sunday = new Date(today);

	if (day === 6) {
		// Today is Saturday → today & tomorrow
		sunday.setDate(today.getDate() + 1);
	} else if (day === 0) {
		// Today is Sunday → yesterday & today
		saturday.setDate(today.getDate() - 1);
	} else {
		// Weekday → next Saturday & Sunday
		const daysUntilSaturday = 6 - day;

		saturday.setDate(today.getDate() + daysUntilSaturday);
		sunday.setDate(today.getDate() + daysUntilSaturday + 1);
	}

	return {
		saturday,
		sunday,
	};
};
