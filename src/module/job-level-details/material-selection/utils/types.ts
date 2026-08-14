import type { MaterialSelectionFormItem } from "@/module/job/material-selection/utils/types";

export type AdminMaterialSelectionSubmitPayload = {
	jobDailyRecordId: string;
	userId?: string;
	items: MaterialSelectionFormItem[];
	missingItemRequestId?: string;
};
