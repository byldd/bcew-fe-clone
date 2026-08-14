import { CRATE_SCAN_ACTION } from "@/module/crate-management/enums";

const STATUS_DONE = "bg-emerald-100 text-emerald-700";
const STATUS_IN_PROGRESS = "bg-amber-100 text-amber-700";
const STATUS_PENDING = "bg-gray-100 text-brand-dark50";

const CRATE_ACTIVITY_ACTION_LABEL: Record<CRATE_SCAN_ACTION, string> = {
	[CRATE_SCAN_ACTION.CRATE_SCANNED_TO_RECEIVE]: "marked received on site",
	[CRATE_SCAN_ACTION.CRATE_SCANNED_TO_RETURN]: "marked for return",
};

const DELIVERY_STATUS_ROW_TITLE = "Delivery Status";

export { STATUS_DONE, STATUS_IN_PROGRESS, STATUS_PENDING, CRATE_ACTIVITY_ACTION_LABEL, DELIVERY_STATUS_ROW_TITLE };
