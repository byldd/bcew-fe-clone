import { LucideIcon, Flag, History, QrCode, Undo2 } from "lucide-react";
import { routes } from "@/config/routes";
import { toLocalFormattedDate } from "@/lib/utils/date";
import { DATE_FORMAT } from "@/types/date";
import { ICrateConfirmationDetails } from "../types";

export type ICrateQuickAction = {
	key: string;
	label: string;
	subtitle: string;
	icon: LucideIcon;
	href?: string;
};

export interface ICrateDetailRow {
	label: string;
	value: string;
}

export const ITEMS_PREVIEW_COUNT = 3;

export function getCrateConfirmationDetailRows(details: ICrateConfirmationDetails): ICrateDetailRow[] {
	return [
		{ label: "Assembled by", value: details.assembledByName ?? "—" },
		{
			label: "Dispatch date",
			value: details.scanned_date ? toLocalFormattedDate(details.scanned_date) : "—",
		},
		{ label: "Assigned tech", value: "—" },
		{ label: "Serial #", value: "—" },
		{ label: "Extracted crate ID", value: details.assetId },
	];
}

export const CRATE_QUICK_ACTIONS: ICrateQuickAction[] = [
	{
		key: "scan-received",
		label: "Scan Received",
		subtitle: "Crate activation on site",
		icon: QrCode,
		href: routes.employee.crateManagementScanReceive,
	},
	{
		key: "scan-return",
		label: "Scan Return",
		subtitle: "Sending crate back",
		icon: Undo2,
	},
	{
		key: "history",
		label: "History",
		subtitle: "All scans today",
		icon: History,
	},
	{
		key: "report-issue",
		label: "Report Issue",
		subtitle: "Damage / missing",
		icon: Flag,
	},
];
