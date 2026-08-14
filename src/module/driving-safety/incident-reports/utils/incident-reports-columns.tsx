import { Column, ColumnDef, SortingFn } from "@tanstack/react-table";
import { ChevronDown } from "lucide-react";
import { IoMdArrowDropdown, IoMdArrowDropup } from "react-icons/io";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils/utils";
import { toLocalFormattedDate } from "@/lib/utils/date";
import { SORT_ORDER } from "@/types";
import { DATE_FORMAT } from "@/types/date";

import SeveritySelectCell from "../components/severity-select-cell";
import { IIncidentReportRow } from "../types";
import {
	buildGeotabExceptionUrl,
	buildGoogleMapsUrl,
	INCIDENT_SOURCE_LABEL,
	INCIDENT_STATUS_META,
	INCIDENT_TYPE_LABEL,
} from "./constants";
import {
	ACCIDENT_STATUS_ACTION,
	INCIDENT_REPORT_STATUS,
	INCIDENT_SEVERITY,
	INCIDENT_SOURCE,
	INCIDENT_TYPE,
} from "./enums";
import { ACCIDENT_STATUS_ACTION_LABEL, resolveAccidentStatusActions } from "./status-actions";

const HEADER_CLASS = "text-xs font-semibold text-brand-dark50";
const CELL_CLASS = "text-sm text-brand-dark";

const SortIcons = ({
	sorted,
	onAsc,
	onDesc,
}: {
	sorted: false | SORT_ORDER.ASC | SORT_ORDER.DESC;
	onAsc: () => void;
	onDesc: () => void;
}) => (
	<div className="flex flex-col gap-0">
		<IoMdArrowDropup
			onClick={onAsc}
			className={cn("h-4 w-4 cursor-pointer", sorted === SORT_ORDER.ASC ? "text-brand-dark" : "text-gray-400")}
		/>
		<IoMdArrowDropdown
			onClick={onDesc}
			className={cn("h-4 w-4 cursor-pointer", sorted === SORT_ORDER.DESC ? "text-brand-dark" : "text-gray-400")}
		/>
	</div>
);

const SortableHeader = ({ column, label }: { column: Column<IIncidentReportRow, unknown>; label: string }) => (
	<div className="flex items-center justify-center gap-1 font-semibold">
		<span className={HEADER_CLASS}>{label}</span>
		<SortIcons
			sorted={column.getIsSorted() as false | SORT_ORDER.ASC | SORT_ORDER.DESC}
			onAsc={() => column.toggleSorting(false)}
			onDesc={() => column.toggleSorting(true)}
		/>
	</div>
);

const SEVERITY_RANK: Record<INCIDENT_SEVERITY, number> = {
	[INCIDENT_SEVERITY.LOW]: 1,
	[INCIDENT_SEVERITY.MEDIUM]: 2,
	[INCIDENT_SEVERITY.HIGH]: 3,
	[INCIDENT_SEVERITY.CRITICAL]: 4,
};

const severitySortFn: SortingFn<IIncidentReportRow> = (rowA, rowB) => {
	const a = rowA.original.severity ? SEVERITY_RANK[rowA.original.severity] : 0;
	const b = rowB.original.severity ? SEVERITY_RANK[rowB.original.severity] : 0;
	return a - b;
};

const dateTimeSortFn: SortingFn<IIncidentReportRow> = (rowA, rowB) => {
	const a = rowA.original.dateTime ? new Date(rowA.original.dateTime).getTime() : 0;
	const b = rowB.original.dateTime ? new Date(rowB.original.dateTime).getTime() : 0;
	return a - b;
};

export const getIncidentReportColumns = (
	onReview: (report: IIncidentReportRow) => void,
	onSeverityChange: (report: IIncidentReportRow, severity: INCIDENT_SEVERITY) => void,
	{
		roleName,
		onStatusAction,
	}: {
		roleName?: string;
		onStatusAction: (report: IIncidentReportRow, action: ACCIDENT_STATUS_ACTION) => void;
	}
): ColumnDef<IIncidentReportRow>[] => [
	{
		accessorKey: "recordNumber",
		header: ({ column }) => <SortableHeader column={column} label="Record #" />,
		cell: ({ row }) => {
			const { recordNumber, geotabId } = row.original;
			// GeoTab safety violations deep-link to their exception in Geotab.
			if (geotabId) {
				return (
					<a
						href={buildGeotabExceptionUrl(geotabId)}
						target="_blank"
						rel="noopener noreferrer"
						className={cn(CELL_CLASS, "font-medium text-blue-600 underline-offset-2 hover:underline")}
					>
						{recordNumber}
					</a>
				);
			}
			return <span className={cn(CELL_CLASS, "font-medium")}>{recordNumber}</span>;
		},
	},
	{
		accessorKey: "type",
		header: ({ column }) => <SortableHeader column={column} label="Type" />,
		cell: ({ row }) => <span className={CELL_CLASS}>{INCIDENT_TYPE_LABEL[row.original.type]}</span>,
	},
	{
		accessorKey: "source",
		header: ({ column }) => <SortableHeader column={column} label="Source" />,
		cell: ({ row }) => <span className={CELL_CLASS}>{INCIDENT_SOURCE_LABEL[row.original.source]}</span>,
	},
	{
		accessorKey: "detail",
		header: ({ column }) => <SortableHeader column={column} label="Detail" />,
		cell: ({ row }) => (
			<span className={cn(CELL_CLASS, "line-clamp-1 max-w-[220px]")} title={row.original.detail ?? undefined}>
				{row.original.detail ?? "--"}
			</span>
		),
	},
	{
		accessorKey: "employeeName",
		header: ({ column }) => <SortableHeader column={column} label="Employee" />,
		cell: ({ row }) => <span className={CELL_CLASS}>{row.original.employeeName ?? "--"}</span>,
	},
	{
		accessorKey: "truckNumber",
		header: ({ column }) => <SortableHeader column={column} label="Truck #" />,
		cell: ({ row }) => <span className={CELL_CLASS}>{row.original.truckNumber ?? "--"}</span>,
	},
	{
		accessorKey: "severity",
		header: ({ column }) => <SortableHeader column={column} label="Severity" />,
		sortingFn: severitySortFn,
		cell: ({ row }) =>
			// GeoTab safety violations carry no severity and no admin workflow to set one.
			row.original.source === INCIDENT_SOURCE.GEOTAB ? (
				<span className={CELL_CLASS}>--</span>
			) : (
				<SeveritySelectCell
					value={row.original.severity}
					onChange={(severity) => onSeverityChange(row.original, severity)}
				/>
			),
	},
	{
		accessorKey: "dateTime",
		header: ({ column }) => <SortableHeader column={column} label="Date & Time" />,
		sortingFn: dateTimeSortFn,
		cell: ({ row }) => (
			<span className={CELL_CLASS}>
				{row.original.dateTime ? toLocalFormattedDate(row.original.dateTime, DATE_FORMAT.DATE_AND_TIME) : "--"}
			</span>
		),
	},
	{
		accessorKey: "location",
		header: ({ column }) => <SortableHeader column={column} label="Location" />,
		cell: ({ row }) => {
			const { location, source } = row.original;
			if (!location) return <span className={cn(CELL_CLASS, "line-clamp-1 max-w-[180px]")}>--</span>;
			// GeoTab locations are "latitude, longitude" — open them on Google Maps.
			if (source === INCIDENT_SOURCE.GEOTAB) {
				return (
					<a
						href={buildGoogleMapsUrl(location)}
						target="_blank"
						rel="noopener noreferrer"
						title={location}
						className={cn(CELL_CLASS, "line-clamp-1 max-w-[180px] text-blue-600 underline-offset-2 hover:underline")}
					>
						{location}
					</a>
				);
			}
			return (
				<span className={cn(CELL_CLASS, "line-clamp-1 max-w-[180px]")} title={location}>
					{location}
				</span>
			);
		},
	},
	{
		accessorKey: "status",
		header: ({ column }) => <SortableHeader column={column} label="Status" />,
		cell: ({ row }) => {
			const { status } = row.original;
			if (!status) return <span className={CELL_CLASS}>--</span>;
			const meta = INCIDENT_STATUS_META[status];
			const badge = (
				<span className={cn("inline-flex rounded-full px-3 py-1 text-xs font-medium", meta.className)}>
					{meta.label}
				</span>
			);

			const actions = resolveAccidentStatusActions(row.original, roleName);
			if (!actions.length) return badge;

			return (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<button type="button" className="inline-flex items-center gap-1">
							{badge}
							<ChevronDown size={14} className="text-brand-dark50" />
						</button>
					</DropdownMenuTrigger>
					<DropdownMenuContent>
						{actions.map((action) => (
							<DropdownMenuItem key={action} onClick={() => onStatusAction(row.original, action)}>
								{ACCIDENT_STATUS_ACTION_LABEL[action]}
							</DropdownMenuItem>
						))}
					</DropdownMenuContent>
				</DropdownMenu>
			);
		},
	},
	{
		id: "action",
		enableSorting: false,
		header: () => <span className={HEADER_CLASS}>Action</span>,
		cell: ({ row }) => {
			// GeoTab safety violations have no review flow of their own — no action to offer.
			if (row.original.source === INCIDENT_SOURCE.GEOTAB) return <span className={CELL_CLASS}>--</span>;

			// Violations open a read-only details modal; accidents/breakdowns open their review flow.
			// An admin-created accident draft reopens the create form to keep editing ("Continue").
			const isViolation = row.original.type === INCIDENT_TYPE.DRIVING_SAFETY_VIOLATION;
			const isDraftAccident =
				row.original.type === INCIDENT_TYPE.VEHICLE_ACCIDENT && row.original.status === INCIDENT_REPORT_STATUS.DRAFT;
			// Violations and closed reports (resolved/rejected) are read-only — no review action left to take.
			const isClosed =
				row.original.status === INCIDENT_REPORT_STATUS.RESOLVED ||
				row.original.status === INCIDENT_REPORT_STATUS.REJECTED;
			const isReadOnly = isViolation || isClosed;
			const label = isReadOnly ? "See Details" : isDraftAccident ? "Continue" : "Review";
			return (
				<Button
					type="button"
					variant={isReadOnly ? "outline" : "filled"}
					size="sm"
					className="h-7 rounded-[8px] px-4"
					onClick={() => onReview(row.original)}
				>
					{label}
				</Button>
			);
		},
	},
];
