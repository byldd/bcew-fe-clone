import { z } from "zod";
import { baseSchema, employeeAssignmentSchema } from "./create-daily-job-form";
import { getImageSchema } from "./mark-not-ready-form";

export const qcRepairJobFormSchema = baseSchema
	.pick({
		jobName: true,
		date: true,
		labelIds: true,
		jobRecNum: true,
		crewLeaderId: true,
		taskLeaderId: true,
		subcontractorId: true,
		forecastTime: true,
		isJobFinishToday: true,
		isJobFinishTomorrow: true,
	})
	.extend({
		jobEmployeeAssignments: z
			.array(
				employeeAssignmentSchema.pick({
					employeeId: true,
					stopNumber: true,
					hours: true,
					employeeName: true,
					startTime: true,
					endTime: true,
					overrideStartTime: true,
					overrideEndTime: true,
					id: true,
				})
			)
			.optional(),
		images: z.array(getImageSchema()).optional(),
		notReadyUpdate: z
			.object({
				isReady: z.boolean().optional(),
				isClean: z.boolean().optional(),
				updateForCrew: z.string().optional(),
				noteFromCrewMember: z.string().optional(),
			})
			.nullable()
			.optional(),
	});

export type IQcRepairJobFormSchema = z.infer<typeof qcRepairJobFormSchema>;

export const qcInspectionJobFormSchema = baseSchema
	.pick({
		date: true,
		labelIds: true,
		jobRecNum: true,
		crewLeaderId: true,
		taskLeaderId: true,
		jobName: true,
		forecastTime: true,
		isJobFinishToday: true,
		isJobFinishTomorrow: true,
	})
	.extend({
		jobEmployeeAssignments: z.array(
			employeeAssignmentSchema.pick({
				employeeId: true,
				stopNumber: true,
				employeeName: true,
				startTime: true,
				endTime: true,
				overrideStartTime: true,
				overrideEndTime: true,
				id: true,
			})
		),
	});

export type IQcInspectionJobFormSchema = z.infer<typeof qcInspectionJobFormSchema>;
