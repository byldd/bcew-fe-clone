import { CircleAlert, History, LucideIcon, PackageX, QrCode, TriangleAlert, Undo2, XCircle } from "lucide-react";
import { routes } from "@/config/routes";
import { toLocalFormattedDate } from "@/lib/utils/date";
import { CRATE_ISSUE_CATEGORY, CRATE_ISSUE_SEVERITY } from "../enums";
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
		{ label: "Extracted crate ID", value: details.assetId },
	];
}

export const CRATE_QUICK_ACTIONS: ICrateQuickAction[] = [
	{
		key: "scan-received",
		label: "Scan Received",
		subtitle: "Crate arrived on site",
		icon: QrCode,
		href: routes.employee.crateManagementScanReceive,
	},
	{
		key: "scan-return",
		label: "Scan Return",
		subtitle: "Sending crate back",
		icon: Undo2,
		href: routes.employee.crateManagementScanReturn,
	},
	{
		key: "history",
		label: "History",
		subtitle: "All scans history",
		icon: History,
		href: routes.employee.crateManagementHistory,
	},
	{
		key: "report-issue",
		label: "Report Issue",
		subtitle: "Damage / missing",
		icon: TriangleAlert,
		href: routes.employee.crateManagementReportIssue,
	},
];

export interface ICrateIssueCategoryOption {
	value: CRATE_ISSUE_CATEGORY;
	label: string;
	subtitle: string;
	icon: LucideIcon;
}

export const CRATE_ISSUE_CATEGORY_OPTIONS: ICrateIssueCategoryOption[] = [
	{
		value: CRATE_ISSUE_CATEGORY.DAMAGED_CRATE,
		label: "Damaged Crate",
		subtitle: "Physical damage or issue",
		icon: PackageX,
	},
	{
		value: CRATE_ISSUE_CATEGORY.NO_CRATE,
		label: "No Crate",
		subtitle: "Crate not present or delivery",
		icon: XCircle,
	},
	{
		value: CRATE_ISSUE_CATEGORY.OTHER,
		label: "Other",
		subtitle: "Any other problem",
		icon: CircleAlert,
	},
];

export const CRATE_ISSUE_SEVERITY_OPTIONS: { value: CRATE_ISSUE_SEVERITY; label: string }[] = [
	{ value: CRATE_ISSUE_SEVERITY.LOW, label: "Low" },
	{ value: CRATE_ISSUE_SEVERITY.MEDIUM, label: "Medium" },
	{ value: CRATE_ISSUE_SEVERITY.HIGH, label: "High" },
];
