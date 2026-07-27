import type { ColumnDef } from "@tanstack/react-table";
import { toFormattedDate } from "@/lib/utils/date";
import { DATE_FORMAT } from "@/types/date";
import { ScreenshotPreview } from "@/module/admin-technical-issues/components/screenshot-previews";
import { MissingItemRequestsListResponse } from "@/module/job/material-selection/utils/types";

export const missingItemRequestsColumns: ColumnDef<MissingItemRequestsListResponse>[] = [
	{
		id: "requester",
		size: 120,
		header: () => <span className="w-full text-left">Requested By</span>,
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
		size: 120,
		header: () => <span className="w-full text-center">Job Name</span>,
		cell: ({ row }) => (
			<span className="block w-full truncate text-center text-brand-dark" title={row.original.jobName ?? undefined}>
				{row.original.jobName ?? "—"}
			</span>
		),
	},
	{
		id: "requestedDate",
		size: 100,
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
		size: 90,
		header: () => <span className="w-full text-left">Task</span>,
		cell: ({ row }) => <span className="block w-full text-center text-brand-dark">{row.original.phase ?? "—"}</span>,
	},
	{
		id: "quantity",
		size: 70,
		header: () => <span className="w-full text-center">Qty</span>,
		cell: ({ row }) => <span className="block w-full text-center text-brand-dark">{row.original.quantity ?? "—"}</span>,
	},
	{
		id: "images",
		size: 90,
		header: "Part Images",
		cell: ({ row }) => (
			<div className="flex justify-center">
				<ScreenshotPreview images={row.original.images} />
			</div>
		),
	},
	{
		id: "description",
		size: 200,
		header: () => <span className="w-full text-center">Description</span>,
		cell: ({ row }) => (
			<span className="block w-full truncate text-center text-brand-dark" title={row.original.description ?? undefined}>
				{row.original.description || "—"}
			</span>
		),
	},
	{
		id: "foremanNote",
		size: 150,
		header: () => <span className="w-full text-left">Notes</span>,
		cell: ({ row }) => {
			const note = row.original.foremanNote?.trim();

			return (
				<span
					className={`block w-full truncate text-center ${note ? "text-brand-dark" : "text-brand-dark30"}`}
					title={note || ""}
				>
					{note || "No notes "}
				</span>
			);
		},
	},
];
