import { ColumnDef } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/utils";
import { toLocalFormattedDate } from "@/lib/utils/date";
import { DATE_FORMAT } from "@/types/date";

import { IIncidentReportRow } from "../types";
import { INCIDENT_SEVERITY_META, INCIDENT_SOURCE_LABEL, INCIDENT_STATUS_META, INCIDENT_TYPE_LABEL } from "./constants";

const HEADER_CLASS = "text-xs font-semibold text-brand-dark50";
const CELL_CLASS = "text-sm text-brand-dark";

export const getIncidentReportColumns = (
	onReview: (report: IIncidentReportRow) => void
): ColumnDef<IIncidentReportRow>[] => [
	{
		accessorKey: "recordNumber",
		header: () => <span className={HEADER_CLASS}>Record #</span>,
		cell: ({ row }) => <span className={cn(CELL_CLASS, "font-medium")}>{row.original.recordNumber}</span>,
	},
	{
		accessorKey: "type",
		header: () => <span className={HEADER_CLASS}>Type</span>,
		cell: ({ row }) => <span className={CELL_CLASS}>{INCIDENT_TYPE_LABEL[row.original.type]}</span>,
	},
	{
		accessorKey: "source",
		header: () => <span className={HEADER_CLASS}>Source</span>,
		cell: ({ row }) => <span className={CELL_CLASS}>{INCIDENT_SOURCE_LABEL[row.original.source]}</span>,
	},
	{
		accessorKey: "detail",
		header: () => <span className={HEADER_CLASS}>Detail</span>,
		cell: ({ row }) => (
			<span className={cn(CELL_CLASS, "line-clamp-1 max-w-[220px]")} title={row.original.detail ?? undefined}>
				{row.original.detail ?? "--"}
			</span>
		),
	},
	{
		accessorKey: "employeeName",
		header: () => <span className={HEADER_CLASS}>Employee</span>,
		cell: ({ row }) => <span className={CELL_CLASS}>{row.original.employeeName ?? "--"}</span>,
	},
	{
		accessorKey: "truckNumber",
		header: () => <span className={HEADER_CLASS}>Truck #</span>,
		cell: ({ row }) => <span className={CELL_CLASS}>{row.original.truckNumber ?? "--"}</span>,
	},
	{
		accessorKey: "severity",
		header: () => <span className={HEADER_CLASS}>Severity</span>,
		cell: ({ row }) => {
			const { severity } = row.original;
			if (!severity) return <span className={CELL_CLASS}>--</span>;
			const meta = INCIDENT_SEVERITY_META[severity];
			return <span className={cn("text-sm font-medium", meta.className)}>{meta.label}</span>;
		},
	},
	{
		accessorKey: "dateTime",
		header: () => <span className={HEADER_CLASS}>Date &amp; Time</span>,
		cell: ({ row }) => (
			<span className={CELL_CLASS}>
				{row.original.dateTime ? toLocalFormattedDate(row.original.dateTime, DATE_FORMAT.DATE_AND_TIME) : "--"}
			</span>
		),
	},
	{
		accessorKey: "location",
		header: () => <span className={HEADER_CLASS}>Location</span>,
		cell: ({ row }) => (
			<span className={cn(CELL_CLASS, "line-clamp-1 max-w-[180px]")} title={row.original.location ?? undefined}>
				{row.original.location ?? "--"}
			</span>
		),
	},
	{
		accessorKey: "status",
		header: () => <span className={HEADER_CLASS}>Status</span>,
		cell: ({ row }) => {
			const meta = INCIDENT_STATUS_META[row.original.status];
			return (
				<span className={cn("inline-flex rounded-full px-3 py-1 text-xs font-medium", meta.className)}>
					{meta.label}
				</span>
			);
		},
	},
	{
		id: "action",
		header: () => <span className={HEADER_CLASS}>Action</span>,
		cell: ({ row }) => (
			<Button type="button" variant="filled" size="sm" onClick={() => onReview(row.original)}>
				Review
			</Button>
		),
	},
];
