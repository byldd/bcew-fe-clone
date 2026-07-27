import { toFormattedDate } from "@/lib/utils/date";
import { DATE_FORMAT } from "@/types/date";
import { ColumnDef } from "@tanstack/react-table";
import { IFingerprintApproval } from "./types";
import { ViewETRAndMDTRNote } from "../components/view-etr-mdtr-note";
import FingerprintApprovalAction from "../components/fingerprint-approval-action";

export const useFingerprintApprovalColumns = (): ColumnDef<IFingerprintApproval>[] => [
	{
		header: "Employee Name",
		cell: ({ row }) => <div id={row.original.id}>{row.original.employee?.user?.name ?? "-"}</div>,
	},

	{
		header: "Date",
		cell: ({ row }) => toFormattedDate(row.original.date),
	},

	{
		header: "Start Time",
		cell: ({ row }) =>
			row.original.startTime ? toFormattedDate(row.original.startTime, DATE_FORMAT.HH_MM_AA_PM) : "--",
	},

	{
		header: "End Time",
		cell: ({ row }) => (row.original.endTime ? toFormattedDate(row.original.endTime, DATE_FORMAT.HH_MM_AA_PM) : "--"),
	},

	{
		header: "Note",
		cell: ({ row }) => {
			const { note, lateReason, earlyReason } = row.original;
			const parts = [
				lateReason ? `Late Start Reason: ${lateReason}` : null,
				earlyReason ? `Early Quit Reason: ${earlyReason}` : null,
				note ?? null,
			].filter(Boolean);
			return (
				<div className="flex items-center justify-center">
					<ViewETRAndMDTRNote note={parts.join("\n") || null} />
				</div>
			);
		},
	},

	{
		header: "Status",
		cell: ({ row }) => {
			const { status } = row.original;
			return <div className="flex items-center justify-center">{status.charAt(0) + status.slice(1).toLowerCase()}</div>;
		},
	},

	{
		header: "Action",
		cell: ({ row }) => (
			<div className="flex items-center justify-center">
				<FingerprintApprovalAction row={row.original} />
			</div>
		),
	},
];
