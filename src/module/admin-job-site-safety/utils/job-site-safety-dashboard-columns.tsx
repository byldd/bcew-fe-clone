import { ColumnDef } from "@tanstack/react-table";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils/utils";
import { toFormattedDate } from "@/lib/utils/date";
import { DATE_FORMAT } from "@/types/date";
import { JOB_SITE_SAFETY_ACTION, JOB_SITE_SAFETY_STATUS_ACTION } from "../enums";
import { IJobSiteSafetyDashboardRow } from "../types";
import { JOB_SITE_SAFETY_STATUS_ACTION_LABEL, resolveJobSiteSafetyStatusActions } from "./status-actions";
import {
	hasJobSiteSafetyWorkflow,
	JOB_SITE_SAFETY_ACTION_LABEL,
	JOB_SITE_SAFETY_REPORT_TYPE_LABEL,
	REPORT_SOURCE_LABEL,
	resolveJobSiteSafetyAction,
	resolveSafetyReportStatusMeta,
} from "./dashboard-constants";
import { ACCESS_LEVEL } from "@/module/employee/enums";

const HEADER_CLASS = "text-xs font-semibold text-brand-dark50";
const CELL_CLASS = "text-sm text-brand-dark";

export const getJobSiteSafetyDashboardColumns = (
	onView: (row: IJobSiteSafetyDashboardRow) => void,
	{
		roleName,
		onStatusAction,
		accessLevel,
	}: {
		roleName?: string;
		onStatusAction: (row: IJobSiteSafetyDashboardRow, action: JOB_SITE_SAFETY_STATUS_ACTION) => void;
		accessLevel?: ACCESS_LEVEL;
	}
): ColumnDef<IJobSiteSafetyDashboardRow>[] => [
	{
		accessorKey: "recordNumber",
		header: () => <span className={HEADER_CLASS}>Record #</span>,
		cell: ({ row }) => <span className={cn(CELL_CLASS, "font-medium")}>{row.original.recordNumber}</span>,
	},
	{
		accessorKey: "source",
		header: () => <span className={HEADER_CLASS}>Source</span>,
		cell: ({ row }) => <span className={CELL_CLASS}>{REPORT_SOURCE_LABEL[row.original.source]}</span>,
	},
	{
		accessorKey: "type",
		header: () => <span className={HEADER_CLASS}>Type</span>,
		cell: ({ row }) => <span className={CELL_CLASS}>{JOB_SITE_SAFETY_REPORT_TYPE_LABEL[row.original.type]}</span>,
	},
	{
		accessorKey: "employeeName",
		header: () => <span className={HEADER_CLASS}>Employee</span>,
		cell: ({ row }) => <span className={CELL_CLASS}>{row.original.employeeName ?? "--"}</span>,
	},
	{
		accessorKey: "jobSiteName",
		header: () => <span className={HEADER_CLASS}>Job Site</span>,
		cell: ({ row }) => (
			<span className={cn(CELL_CLASS, "line-clamp-1 max-w-[180px]")} title={row.original.jobSiteName ?? undefined}>
				{row.original.jobSiteName ?? "--"}
			</span>
		),
	},
	{
		accessorKey: "detail",
		header: () => <span className={HEADER_CLASS}>Detail</span>,
		cell: ({ row }) => (
			<span className={cn(CELL_CLASS, "line-clamp-1 max-w-[220px]")} title={row.original.detail}>
				{row.original.detail}
			</span>
		),
	},
	{
		accessorKey: "dateTime",
		header: () => <span className={HEADER_CLASS}>Date &amp; Time</span>,
		cell: ({ row }) => (
			<span className={CELL_CLASS}>{toFormattedDate(row.original.dateTime, DATE_FORMAT.DATE_AND_TIME)}</span>
		),
	},
	{
		accessorKey: "status",
		header: () => <span className={HEADER_CLASS}>Status</span>,
		cell: ({ row }) => {
			if (!hasJobSiteSafetyWorkflow(row.original)) return <span className={CELL_CLASS}>--</span>;

			const meta = resolveSafetyReportStatusMeta(row.original.status);
			const badge = (
				<span
					className={cn("inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium", meta.className)}
				>
					{meta.label}
				</span>
			);

			const actions = resolveJobSiteSafetyStatusActions(row.original, roleName);

			if (!actions.length) return badge;

			return (
				<DropdownMenu>
					<DropdownMenuTrigger disabled={accessLevel !== ACCESS_LEVEL.WRITE} asChild>
						<button type="button" className="inline-flex items-center gap-1">
							{badge}
							<ChevronDown size={14} className="text-brand-dark50" />
						</button>
					</DropdownMenuTrigger>
					<DropdownMenuContent>
						{actions.map((action) => (
							<DropdownMenuItem key={action} onClick={() => onStatusAction(row.original, action)}>
								{JOB_SITE_SAFETY_STATUS_ACTION_LABEL[action]}
							</DropdownMenuItem>
						))}
					</DropdownMenuContent>
				</DropdownMenu>
			);
		},
	},
	{
		id: "action",
		header: () => <span className={HEADER_CLASS}>Action</span>,
		cell: ({ row }) => {
			const action = resolveJobSiteSafetyAction(row.original);
			return (
				<Button
					type="button"
					variant={action === JOB_SITE_SAFETY_ACTION.SEE_DETAILS ? "outline" : "filled"}
					size="sm"
					onClick={() => onView(row.original)}
				>
					{JOB_SITE_SAFETY_ACTION_LABEL[action]}
				</Button>
			);
		},
	},
];
