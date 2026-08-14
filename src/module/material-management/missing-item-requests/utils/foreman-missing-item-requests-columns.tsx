import type { ColumnDef } from "@tanstack/react-table";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/utils";
import { toFormattedDate } from "@/lib/utils/date";
import { DATE_FORMAT } from "@/types/date";
import { ScreenshotPreview } from "@/module/admin-technical-issues/components/screenshot-previews";
import { MISSING_ITEM_REQUEST_STATUS_UI } from "@/module/material-management/missing-item-requests-admin/utils/missing-item-request-status";
import {
	MISSING_ITEM_REQUEST_STATUS,
	type AdminMissingItemRequest,
} from "@/module/material-management/missing-item-requests-admin/utils/types";

export const getForemanMissingItemRequestsColumns = ({
	onTakeAction,
}: {
	onTakeAction: (item: AdminMissingItemRequest) => void;
}): ColumnDef<AdminMissingItemRequest>[] => [
	{
		id: "requester",
		size: 140,
		header: () => <span className="w-full text-left">Requested by</span>,
		cell: ({ row }) => (
			<span
				id={`mir-${row.original.id}`}
				className="block w-full truncate text-left text-brand-dark"
				title={row.original.user?.name ?? undefined}
			>
				{row.original.user?.name ?? "—"}
			</span>
		),
	},
	{
		id: "jobName",
		size: 160,
		header: () => <span className="w-full text-left">Job name</span>,
		cell: ({ row }) => (
			<span className="block w-full truncate text-left text-brand-dark" title={row.original.jobName ?? undefined}>
				{row.original.jobName ?? "—"}
			</span>
		),
	},
	{
		id: "quantity",
		size: 80,
		header: () => <span className="w-full text-center">Quantity</span>,
		cell: ({ row }) => <span className="block w-full text-center text-brand-dark">{row.original.quantity ?? "—"}</span>,
	},
	{
		id: "requestedDate",
		size: 110,
		header: () => <span className="w-full text-center">Requested date</span>,
		cell: ({ row }) => {
			const dateValue = row.original.date ?? row.original.createdAt;
			return (
				<span className="text-brand-dark">
					{dateValue ? toFormattedDate(dateValue, DATE_FORMAT.MM_SLASH_DD_YYYY) : "—"}
				</span>
			);
		},
	},
	{
		id: "phase",
		size: 100,
		header: () => <span className="w-full text-center">Phase</span>,
		cell: ({ row }) => (
			<span className="block w-full text-center capitalize text-brand-dark">
				{row.original.phase?.replaceAll("_", " ") ?? "—"}
			</span>
		),
	},
	{
		id: "images",
		size: 110,
		header: "Images",
		cell: ({ row }) => (
			<div className="flex justify-center">
				<ScreenshotPreview images={row.original.images} />
			</div>
		),
	},
	{
		id: "description",
		size: 240,
		header: () => <span className="w-full text-left">Description</span>,
		cell: ({ row }) => (
			<span className="block w-full truncate text-left text-brand-dark" title={row.original.description ?? undefined}>
				{row.original.description || "—"}
			</span>
		),
	},

	{
		id: "foremanNote",
		size: 240,
		header: () => <span className="w-full text-left">Foreman note</span>,
		cell: ({ row }) => (
			<span className="block w-full truncate text-left text-brand-dark" title={row.original.foremanNote ?? undefined}>
				{row.original.foremanNote || "—"}
			</span>
		),
	},
	{
		id: "status",
		size: 100,
		header: () => <span className="w-full text-center">Status</span>,
		cell: ({ row }) => {
			const status = MISSING_ITEM_REQUEST_STATUS_UI[row.original.status];
			return (
				<span className={cn("block w-full text-center text-sm font-semibold", status?.className)}>{status?.label}</span>
			);
		},
	},
	{
		id: "action",
		size: 70,
		header: () => <span className="w-full text-center">Action</span>,
		cell: ({ row }) => {
			const isDisabled = row.original.status !== MISSING_ITEM_REQUEST_STATUS.PENDING;
			return (
				<div className="flex justify-center">
					<Button
						type="button"
						variant="ghost"
						size="icon"
						onClick={() => onTakeAction(row.original)}
						title="Take action"
						disabled={isDisabled}
					>
						<Pencil className={cn("h-3.5 w-3.5", isDisabled ? "text-brand-muted" : "text-brand-primary")} />
					</Button>
				</div>
			);
		},
	},
];
