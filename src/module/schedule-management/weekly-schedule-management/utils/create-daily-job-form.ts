import z from "zod";
import { getImageSchema } from "./mark-not-ready-form";
import { legends } from "@/module/employee-dashboard/constants/legend-items";
import { getTodayDate } from "@/lib/utils/date";

export const handleValidate = (data: ICreateDailyJobFormSchema, ctx: z.RefinementCtx) => {
	const employeeIds = data.jobEmployeeAssignments.map((assignment) => assignment.employeeId);
	const isSubcontractorJob = data.labelIds?.includes(legends.subContractorJob);
	const isNewStartJob = data.labelIds?.includes(legends.newStart);
	const isNotReadyJob = data.labelIds?.includes(legends.jobNotReady);
	const isOngoingJob = data.labelIds?.includes(legends.ongoingJob);

	for (const [employeeIndex, employeeId] of employeeIds.entries()) {
		if (employeeIds.some((id, index) => id == employeeId && index !== employeeIndex)) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Employee must be unique",
				path: [`jobEmployeeAssignments.${employeeIndex}.employeeId`],
			});
		}
	}

	const taskLeaderId = data.taskLeaderId;
	const employeeAssignments = data.jobEmployeeAssignments;
	if (
		(taskLeaderId && !employeeAssignments.some((assignment) => assignment.employeeId === taskLeaderId)) ||
		(!isSubcontractorJob && !taskLeaderId)
	) {
		ctx.addIssue({
			code: z.ZodIssueCode.custom,
			message: "Task leader is required",
			path: ["taskLeaderId"],
		});
	}
	if (!isSubcontractorJob && !data.crewLeaderId) {
		ctx.addIssue({
			code: z.ZodIssueCode.custom,
			message: "Crew leader is required",
			path: ["crewLeaderId"],
		});
	}
	if (data.date < getTodayDate()) {
		ctx.addIssue({
			code: z.ZodIssueCode.custom,
			message: "Date cannot be in the past",
			path: ["date"],
		});
	}

	if (isNewStartJob && isNotReadyJob) {
		ctx.addIssue({
			code: z.ZodIssueCode.custom,
			message: "New start and not ready job cannot be selected together",
			path: ["labelIds"],
		});
	}

	if (isOngoingJob && isNewStartJob) {
		ctx.addIssue({
			code: z.ZodIssueCode.custom,
			message: "Ongoing and new start job cannot be selected together",
			path: ["labelIds"],
		});
	}

	if (isSubcontractorJob && !data.subcontractorId) {
		ctx.addIssue({
			code: z.ZodIssueCode.custom,
			message: "Subcontractor ID is required",
			path: ["subcontractorId"],
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

export const baseSchema = z.object({
	jobName: z.string().optional(),
	jobRecNum: z.string().optional(),
	date: z.date(),
	crewLeaderId: z.string().nullable().optional(),
	labelIds: z.array(z.string().min(1, "Label is required")).optional(),
	taskLeaderId: z.string().nullable().optional(),
	subcontractorId: z.string().optional().nullable(),
	subcontactorCrewName: z.string().optional(),
	subcontactorCrewLeaderName: z.string().optional(),
	specialJobId: z.string().optional(),
	isJobFinishToday: z.boolean().nullable().optional(),
	isJobFinishTomorrow: z.boolean().nullable().optional(),
	forecastTime: z.number().nullable().optional(),
	note: z.string().optional(),
	forecastDate: z.string().optional(),
});

export const employeeAssignmentSchema = z.object({
	id: z.string().nullable().optional(),
	employeeId: z.string().min(1, "Employee is required"),
	stopNumber: z.number().optional().nullable(),
	hours: z.number().optional().nullable(),
	startTime: z.string().nullable().optional(),
	endTime: z.string().nullable().optional(),
	overTimeHours: z.number().nullable().optional(),
	overTimeMinutes: z.number().nullable().optional(),
	overTimeReason: z.string().optional(),
	isOverTimeApproved: z.boolean().nullable().optional(),
	employeeName: z.string().nullable().optional(),
	overrideStartTime: z.string().nullable().optional(),
	overrideEndTime: z.string().nullable().optional(),
});

export const createDailyJobFormSchema = baseSchema
	.extend({
		jobEmployeeAssignments: z.array(
			employeeAssignmentSchema.pick({
				employeeId: true,
				stopNumber: true,
				hours: true,
				startTime: true,
				endTime: true,
				employeeName: true,
			})
		),
	})
	.superRefine((data, ctx) => {
		handleValidate(data, ctx);
	});

export type ICreateDailyJobFormSchema = z.infer<typeof createDailyJobFormSchema>;

const handleUpdateScheduleValidate = (data: IUpdateDailyJobFormSchema, ctx: z.RefinementCtx) => {
	if (data.subContractorJobUpdate?.forecastDate && data.subContractorJobUpdate?.forecastDate < getTodayDate()) {
		ctx.addIssue({
			code: z.ZodIssueCode.custom,
			message: "Forecast date cannot be in the past",
			path: ["subContractorJobUpdate.forecastDate"],
		});
	}
};

export const updateDailyJobFormSchema = baseSchema
	.extend({
		jobEmployeeAssignments: z.array(employeeAssignmentSchema),
		notReadyUpdate: z
			.object({
				isReady: z.boolean().optional(),
				isClean: z.boolean().optional(),
				updateForCrew: z.string().optional(),
				noteFromCrewMember: z.string().optional(),
			})
			.nullable()
			.optional(),
		images: z.array(getImageSchema()).optional(),
		subContractorJobUpdate: z
			.object({
				startTime: z.date().nullable().optional(),
				endTime: z.date().nullable().optional(),
				forecastDate: z.date().nullable().optional(),
			})
			.nullable()
			.optional(),
	})
	.superRefine((data, ctx) => {
		handleValidate(data, ctx);
		handleUpdateScheduleValidate(data, ctx);
	});

export type IUpdateDailyJobFormSchema = z.infer<typeof updateDailyJobFormSchema>;

export const createDailyJobFromCardFormSchema = baseSchema
	.pick({
		date: true,
		labelIds: true,
		crewLeaderId: true,
		subcontractorId: true,
		taskLeaderId: true,
		specialJobId: true,
		note: true,
	})
	.extend({
		jobEmployeeAssignments: z.array(
			employeeAssignmentSchema.pick({
				employeeId: true,
				stopNumber: true,
				employeeName: true,
				id: true,
				overrideStartTime: true,
				overrideEndTime: true,
			})
		),
	});

export type ICreateDailyJobFromCardFormSchema = z.infer<typeof createDailyJobFromCardFormSchema>;
