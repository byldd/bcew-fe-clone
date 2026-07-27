import { TRAVEL_PAY_REQUEST_STATUS } from "../types";

export const TRAVEL_PAY_STATUS = {
	[TRAVEL_PAY_REQUEST_STATUS.APPROVED]: {
		label: "Approved",
		className: "text-[#20C55F]",
	},
	[TRAVEL_PAY_REQUEST_STATUS.REJECTED]: {
		label: "Rejected",
		className: "text-[#EF4448]",
	},
	[TRAVEL_PAY_REQUEST_STATUS.PENDING]: {
		label: "Pending",
		className: "text-[#F59E0B]",
	},
} as const;
