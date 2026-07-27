import { z } from "zod";
import { TECHNICAL_ISSUE_SEVERITY, TECHNICAL_ISSUE_TYPE } from "@/utils/enums";
import { getImageSchema } from "@/module/schedule-management/weekly-schedule-management/utils/mark-not-ready-form";

export const getReportTechnicalIssueSchema = (isAsanaEnabled: boolean) =>
	z.object({
		issueType: z.nativeEnum(TECHNICAL_ISSUE_TYPE, {
			errorMap: () => ({ message: "Please select issue type." }),
		}),
		description: z
			.string()
			.trim()
			.min(1, "Description is required.")
			.max(2000, "Description cannot exceed 2000 characters"),
		images: z.array(getImageSchema()).optional(),
		severity: isAsanaEnabled
			? z.nativeEnum(TECHNICAL_ISSUE_SEVERITY, {
					errorMap: () => ({ message: "Please select severity." }),
				})
			: z.nativeEnum(TECHNICAL_ISSUE_SEVERITY).optional(),
	});

export type ReportTechnicalIssueFormType = z.infer<ReturnType<typeof getReportTechnicalIssueSchema>>;
