import {
	TECHNICAL_ISSUE_CLASSIFICATION,
	TECHNICAL_ISSUE_SEVERITY,
	TECHNICAL_ISSUE_STATUS,
	TECHNICAL_ISSUE_TYPE,
} from "@/utils/enums";
import { IUploadImage } from "@/module/schedule-management/weekly-schedule-management/types/schedule-interface";

export interface ICreateTechnicalIssuePayload {
	issueType: TECHNICAL_ISSUE_TYPE;
	description: string;
	screenshots?: IUploadImage[];
	severity?: TECHNICAL_ISSUE_SEVERITY;
}
export interface ITechnicalIssueResponse {
	id: string;
	ticketNumber: number;
}

export interface ITechnicalIssueScreenshot {
	id: string;
	url: string;
	keyFile: string;
}

export interface ITechnicalIssueClassification {
	classification: TECHNICAL_ISSUE_CLASSIFICATION | null;
	severity?: TECHNICAL_ISSUE_SEVERITY | null;
	reason?: string | null;
	validBugDescription?: string | null;
}

export interface ITechnicalIssue {
	id: string;
	ticketNumber: number;
	issueType: TECHNICAL_ISSUE_TYPE;
	description: string;
	status: TECHNICAL_ISSUE_STATUS;
	createdAt: string;
}

export type IMyTechnicalIssue = ITechnicalIssue & {
	classification: ITechnicalIssueClassification | null;
};

export interface ITechnicalIssueDetail extends IMyTechnicalIssue {
	screenshots: ITechnicalIssueScreenshot[];
}

export interface IUpdateMyTechnicalIssuePayload {
	issueType: TECHNICAL_ISSUE_TYPE;
	description: string;
	screenshots?: { keyFile: string }[];
}

export interface IAsanaIssue {
	asanaUrl: string;
	asanaTaskId: string;
}
