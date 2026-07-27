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
	sealIntact: boolean;
	note?: string;
	photos?: { keyFile: string; url: string }[];
};

export type IRecentCrateScan = Pick<ICrateScanAudit, "id" | "scanned_crate" | "scan_action" | "scanned_date"> & {
	jobName: string | null;
};

export type IRecentCrateScansFilters = {
	page?: number;
	pageSize?: number;
};

export type ICrateOrderProgress = {
	totalCrates: number;
	receivedCrates: number;
};

export type ICrateReceiveEventResult = ICrateScanAudit & {
	jobName: string | null;
	orderProgress: ICrateOrderProgress;
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
