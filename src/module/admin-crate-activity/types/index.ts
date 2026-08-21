import { CRATE_SCAN_ACTION } from "@/module/crate-management/enums";
import { ICrateScanAudit } from "@/module/crate-management/types";
import { IUser } from "@/module/schedule-management/weekly-schedule-management/types/schedule-interface";

export type ICratePhoto = {
	id: string;
	url: string;
	keyFile: string;
};

export type IAdminCrateActivityItem = Pick<
	ICrateScanAudit,
	"id" | "scanned_crate" | "scan_action" | "scanned_date" | "sealStatus"
> & {
	jobnum: number;
	tasknum: number;
	sealTagNumber: string | null;
	note: string | null;
	jobName: string | null;
	phase: string | null;
	dispatchedDate: string | null;
	dispatchedByName: string | null;
	user: Pick<IUser, "id" | "name">;
	photos: ICratePhoto[];
};

export type IAdminCrateActivityFilters = {
	page?: number;
	pageSize?: number;
	searchValue?: string;
	jobNums?: number[];
	projectNums?: number[];
	status?: CRATE_SCAN_ACTION[];
	technicianIds?: string[];
	startDate?: string;
	endDate?: string;
};

export type IAdminCrateActivityDetails = {
	totalReceived: number;
	totalReturned: number;
	totalSealBrokenOrMissing: number;
	totalIssuesLogged: number;
};

export type IMarkCrateReturnedPayload = {
	note?: string;
};

export type IMarkCrateReturnedResponse = Pick<
	IAdminCrateActivityItem,
	| "id"
	| "scanned_crate"
	| "scan_action"
	| "scanned_date"
	| "sealStatus"
	| "sealTagNumber"
	| "note"
	| "jobnum"
	| "tasknum"
	| "photos"
> & {
	delivery_num: string;
	scanned_by: number;
	userId: string;
	createdAt: string;
};

export type IAdminCrateActivityReceiveDetails = Pick<
	IAdminCrateActivityItem,
	"id" | "scanned_crate" | "scan_action" | "scanned_date" | "sealStatus" | "sealTagNumber" | "note" | "user" | "photos"
>;

export type IAdminCrateActivityProjectOption = {
	projectNum: number;
	projectName: string;
};

export type IAdminCrateActivityJobOption = {
	jobnum: number;
	jobName: string;
	projectNum: number | null;
};

export type IAdminCrateActivityEmployeeOption = Pick<IUser, "id" | "name">;
