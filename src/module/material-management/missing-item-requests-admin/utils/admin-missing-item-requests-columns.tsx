import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/utils";
import { toFormattedDate } from "@/lib/utils/date";
import { DATE_FORMAT } from "@/types/date";
import { ScreenshotPreview } from "@/module/admin-technical-issues/components/screenshot-previews";
import { Pencil } from "lucide-react";
import { MISSING_ITEM_REQUEST_STATUS_UI } from "./missing-item-request-status";
import type { AdminMissingItemRequest } from "./types";

export const getAdminMissingItemRequestsColumns = ({
	onRespond,
}: {
	onRespond: (row: AdminMissingItemRequest) => void;
}): ColumnDef<AdminMissingItemRequest>[] => [
	{
		id: "requester",
		size: 200,
		header: () => <span className="w-full text-left">Requested By</span>,
		cell: ({ row }) => (
			<span className="block w-full truncate text-left text-brand-dark" title={row.original.user?.name ?? undefined}>
				{row.original.user?.name ?? "—"}
			</span>
		),
	},
	{
		id: "jobName",
		size: 200,
		header: () => <span className="w-full text-left">Job Name</span>,
		cell: ({ row }) => (
			<span className="block w-full truncate text-center text-brand-dark" title={row.original.jobName ?? undefined}>
				{row.original.jobName ?? "—"}
			</span>
		),
	},
	{
		id: "requestedDate",
		size: 180,
		header: "Requested Date",
		cell: ({ row }) => (
			<span className="text-brand-dark">
				{(() => {
					const dateValue = row.original.date ?? row.original.createdAt;
					return dateValue ? toFormattedDate(dateValue, DATE_FORMAT.MM_SLASH_DD_YYYY) : "—";
				})()}
			</span>
		),
	},
	{
		id: "task",
		size: 180,
		header: () => <span className="w-full text-left">Task</span>,
		cell: ({ row }) => <span className="block w-full text-center text-brand-dark">{row.original.phase ?? "—"}</span>,
	},
	{
		id: "quantity",
		size: 80,
		header: () => <span className="w-full text-center">Qty</span>,
		cell: ({ row }) => <span className="block w-full text-center text-brand-dark">{row.original.quantity ?? "—"}</span>,
	},
	{
		id: "images",
		size: 180,
		header: "Part Images",
		cell: ({ row }) => (
			<div className="flex justify-center">
				<ScreenshotPreview images={row.original.images} />
			</div>
		),
	},
	{
		id: "description",
		size: 280,
		header: () => <span className="w-full text-left">Description</span>,
		cell: ({ row }) => (
			<span
				className="block w-full justify-center truncate text-center text-brand-dark"
				title={row.original.description ?? undefined}
			>
				{row.original.description || "—"}
			</span>
		),
	},
	{
		id: "foremanNote",
		size: 280,
		header: () => <span className="w-full text-left">Notes</span>,
		cell: ({ row }) => (
			<span className="block w-full truncate text-left text-brand-dark" title={row.original.foremanNote ?? undefined}>
				{row.original.foremanNote ?? "—"}
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
				<span className={cn("block w-full text-center text-sm font-semibold", status?.className)}>{status.label}</span>
			);
		},
	},
	{
		id: "action",

		header: "Action",
		cell: ({ row }) => (
			<Button
				type="button"
				variant="ghost"
				size="icon"
				onClick={() => onRespond(row.original)}
				title={row.original.foremanNote ? "Edit response" : "Respond"}
			>
				<Pencil className="h-3.5 w-3.5" />
			</Button>
		),
	},
];
