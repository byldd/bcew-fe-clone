import { CRATE_SCAN_ACTION } from "@/module/crate-management/enums";
import { IAdminCrateActivityDetails } from "../types";

export const CRATE_STATUS_LABEL: Record<CRATE_SCAN_ACTION, string> = {
	[CRATE_SCAN_ACTION.CRATE_SCANNED_TO_RECEIVE]: "Received",
	[CRATE_SCAN_ACTION.CRATE_SCANNED_TO_RETURN]: "Returned",
};

export const CRATE_STATUS_BADGE_STYLE: Record<CRATE_SCAN_ACTION, string> = {
	[CRATE_SCAN_ACTION.CRATE_SCANNED_TO_RECEIVE]: "bg-[#E6F4EA] text-[#1E7F3C]",
	[CRATE_SCAN_ACTION.CRATE_SCANNED_TO_RETURN]: "bg-[#E8F0FE] text-[#1A56DB]",
};

export type ICrateActivityStatCardConfig = {
	key: keyof IAdminCrateActivityDetails;
	label: string;
};

export const CRATE_ACTIVITY_STAT_CARDS: ICrateActivityStatCardConfig[] = [
	{ key: "totalReceived", label: "Total Crates Received" },
	{ key: "totalReturned", label: "Total Crates Returned" },
	{ key: "totalSealBrokenOrMissing", label: "Total Seal Broken/Missing" },
	{ key: "totalIssuesLogged", label: "Total Issue Logged" },
];
