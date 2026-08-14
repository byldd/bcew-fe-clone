import { MISSING_ITEM_REQUEST_STATUS } from "./types";

export const MISSING_ITEM_REQUEST_STATUS_UI: Record<MISSING_ITEM_REQUEST_STATUS, { label: string; className: string }> =
	{
		[MISSING_ITEM_REQUEST_STATUS.PENDING]: { label: "Pending", className: "text-[#937823]" },
		[MISSING_ITEM_REQUEST_STATUS.CONVERTED]: { label: "Converted", className: "text-[#1E7F3C]" },
		[MISSING_ITEM_REQUEST_STATUS.REJECTED]: { label: "Rejected", className: "text-[#EF4448]" },
	};
