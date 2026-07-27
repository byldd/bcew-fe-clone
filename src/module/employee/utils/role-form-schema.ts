import { z } from "zod";
import { ACCESS_LEVEL } from "../enums";

export const roleSchema = z
	.object({
		roleName: z.string().nonempty("Role name is required"),
		dayStartTime: z.string().nonempty("Day start time is required"),
		dayEndTime: z.string().nonempty("Day end time is required"),
		canSendNotification: z.boolean(),
		trackTimeByGPS: z.boolean(),
		canSendTravelPayRequest: z.boolean(),
		requiresScheduleValidation: z.boolean(),
		isSpecialCardTimeLoggingExempt: z.boolean(),
		isFingerprintEnabled: z.boolean(),
		rolePagePermissions: z.array(
			z.object({
				parentPageId: z.string().optional().nullable(),
				pageName: z.string(),
				pageId: z.string(),
				accessLevel: z.enum([ACCESS_LEVEL.READ, ACCESS_LEVEL.WRITE]).optional().nullable(),
			})
		),
		roleMapZoneTabPermissions: z.array(
			z.object({
				mapZoneTabId: z.string(),
				mapZoneTabName: z.string(),
				isVisible: z.boolean(),
			})
		),
	})
	.superRefine((data, ctx) => {
		if (data.dayStartTime >= data.dayEndTime) {
			ctx.addIssue({
				path: ["dayEndTime"],
				code: z.ZodIssueCode.custom,
				message: "End time must be greater than start time",
			});
		}
	});

export type RoleFormValues = z.infer<typeof roleSchema>;

export const employeePagePermissionSchema = z.object({
	rolePagePermissions: z.array(
		z.object({
			parentPageId: z.string().optional().nullable(),
			pageName: z.string(),
			pageId: z.string(),
			accessLevel: z.enum([ACCESS_LEVEL.READ, ACCESS_LEVEL.WRITE]).optional().nullable(),
		})
	),
});

export type EmployeePagePermissionValues = z.infer<typeof employeePagePermissionSchema>;
