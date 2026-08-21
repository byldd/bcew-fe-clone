import { CRATE_ISSUE_CATEGORY, CRATE_ISSUE_SEVERITY } from "@/module/crate-management/enums";
import { IUser } from "@/module/schedule-management/weekly-schedule-management/types/schedule-interface";
import { ICratePhoto } from "@/module/admin-crate-activity/types";

export type IAdminCrateIssuesItem = {
	id: string;
	reportId: number;
	crateId: string | null;
	jobNum: number;
	taskNum: number | null;
	category: CRATE_ISSUE_CATEGORY;
	severity: CRATE_ISSUE_SEVERITY | null;
	description: string | null;
	isResolved: boolean;
	createdAt: string;
	jobName: string | null;
	phase: string | null;
	submitter: Pick<IUser, "id" | "name">;
	photos: ICratePhoto[];
};

export type IAdminCrateIssuesFilters = {
	page?: number;
	pageSize?: number;
	searchValue?: string;
	jobNums?: number[];
	projectNums?: number[];
	technicianIds?: string[];
	issueTypes?: CRATE_ISSUE_CATEGORY[];
	severities?: CRATE_ISSUE_SEVERITY[];
	startDate?: string;
	endDate?: string;
};
