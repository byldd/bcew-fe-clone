import {
	IAsanaIssue,
	ITechnicalIssue,
	ITechnicalIssueClassification,
	ITechnicalIssueScreenshot,
} from "@/module/employee-technical-issue/track-ticket/types/types";
import { IUser } from "@/module/schedule-management/weekly-schedule-management/types/schedule-interface";
import { TECHNICAL_ISSUE_CLASSIFICATION, TECHNICAL_ISSUE_SEVERITY } from "@/utils/enums";

export interface IAdminTechnicalIssueResponse extends ITechnicalIssue {
	reporter: Pick<IUser, "name" | "id">;
	screenshots: ITechnicalIssueScreenshot[];
	classification?: ITechnicalIssueClassification | null;
	asana?: IAsanaIssue | null;
}

export type TakeActionPayload = {
	classification: TECHNICAL_ISSUE_CLASSIFICATION;
	reason?: string;
	severity?: TECHNICAL_ISSUE_SEVERITY;
	validBugDescription?: string;
};
