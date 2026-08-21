import { CRATE_ISSUE_CATEGORY, CRATE_ISSUE_SEVERITY, CRATE_SCAN_ACTION } from "../enums";

export type ICrateScanAudit = {
	id: string;
	delivery_num: string;
	scanned_crate: string;
	scan_action: string;
	scanned_date: string;
	sealStatus: boolean | null;
};

export type ICreateReceiveEventPayload = {
	assetId: string;
	action: CRATE_SCAN_ACTION;
	sealIntact?: boolean;
	sealTagNumber?: string;
	note?: string;
	photos?: { keyFile: string; url: string }[];
	jobNum?: number;
	taskNum?: number;
};

export type IRecentCrateScan = Pick<ICrateScanAudit, "id" | "scanned_crate" | "scan_action" | "scanned_date"> & {
	jobName: string | null;
};

export type IRecentCrateScansFilters = {
	page?: number;
	pageSize?: number;
	action?: CRATE_SCAN_ACTION;
	startDate?: string;
	endDate?: string;
};

export type ICrateScanHistoryCounts = {
	all: number;
	received: number;
	returned: number;
};

export type ICrateOrderProgress = {
	totalCrates: number;
	receivedCrates: number;
};

export type ICrateItem = {
	partName: string;
	quantity: number;
};

export type ICrateConfirmationDetails = {
	assetId: string;
	jobName: string | null;
	assembledByName: string | null;
	delivery_num: string;
	scanned_date: string | null;
	items: ICrateItem[];
	orderProgress: ICrateOrderProgress;
	completedDeliverySteps: string[];
};

export type ICrateReceiveScanSummary = {
	assetId: string;
	jobName: string | null;
	deliveryNum: string;
	itemsCount: number;
	assemblerName: string | null;
	sealStatus: boolean | null;
	orderProgress: ICrateOrderProgress;
};

export type ICrateReturnScanSummary = {
	assetId: string;
	jobName: string | null;
	sealTagNumber: string | null;
	photosCount: number;
	scannedDate: string;
};

export type ICrateScanSummary = ICrateReceiveScanSummary | ICrateReturnScanSummary;

export type IReportCrateIssuePayload = {
	crateId?: string;
	jobNum: number;
	taskNum: number;
	category: CRATE_ISSUE_CATEGORY;
	severity: CRATE_ISSUE_SEVERITY;
	description: string;
	photos?: { keyFile: string; url: string }[];
};

export type ICrateIssueReportSummary = {
	id: string;
	reportId: number;
	crateId: string | null;
	jobNum: number;
	jobName: string | null;
	category: CRATE_ISSUE_CATEGORY;
	severity: CRATE_ISSUE_SEVERITY | null;
	description: string | null;
	isResolved: boolean;
	photosCount: number;
	createdAt: string;
};
