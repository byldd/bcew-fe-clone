import z from "zod";
import { baseSchema, employeeAssignmentSchema, ICreateDailyJobFormSchema } from "./create-daily-job-form";
import { getTodayDate } from "@/lib/utils/date";

export const specialJobFormSchema = baseSchema
	.pick({
		date: true,
		labelIds: true,
	})
	.extend({
		jobEmployeeAssignments: z.array(
			employeeAssignmentSchema.pick({
				employeeId: true,
				stopNumber: true,
				employeeName: true,
				overrideStartTime: true,
				overrideEndTime: true,
				id: true,
			})
		),
		zoneGeoTabId: z.string().nullable().optional(),
	})
	.superRefine((data, ctx) => {
		handleValidate(data, ctx);
	});

export type ISpecialJobFormSchema = z.infer<typeof specialJobFormSchema>;

export const handleValidate = (data: ICreateDailyJobFormSchema, ctx: z.RefinementCtx) => {
	const employeeIds = data.jobEmployeeAssignments.map((assignment) => assignment.employeeId);

	for (const [employeeIndex, employeeId] of employeeIds.entries()) {
		if (employeeIds.some((id, index) => id == employeeId && index !== employeeIndex)) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Employee must be unique",
				path: [`jobEmployeeAssignments.${employeeIndex}.employeeId`],
			});
		}
	}

	const employeeAssignments = data.jobEmployeeAssignments;

	if (data.date < getTodayDate()) {
		ctx.addIssue({
			code: z.ZodIssueCode.custom,
			message: "Date cannot be in the past",
			path: ["date"],
		});
	}

	employeeAssignments?.forEach((assignment, index) => {
		if (assignment.hours && assignment.hours < 0) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Hours cannot be less than 0",
				path: [`jobEmployeeAssignments.${index}.hours`],
			});
		}
	});
};
