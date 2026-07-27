import { ColumnDef } from "@tanstack/react-table";
import ScheduleFoundationSelect from "../components/schedule-foundation-select";
import { JobScheduleMilestoneKey, SchedulePhaseRow } from "./types";

export const getJobLevelScheduleMilestonesColumns = (
	onOpenPhaseHistory: (key: JobScheduleMilestoneKey) => void
): ColumnDef<SchedulePhaseRow>[] => [
	{
		accessorKey: "label",
		header: "Phase",
		size: 100,
		cell: ({ row }) => <span className="text-xs font-medium text-brand-dark">{row.original.label}</span>,
	},
	{
		accessorKey: "foundationComplete",
		header: "Foundation Complete",
		size: 120,
		cell: ({ row }) => (
			<ScheduleFoundationSelect
				defaultValue={row.original.foundationComplete}
				disabled={!row.original.isFoundationApplicable}
			/>
		),
	},
	{
		accessorKey: "scheduled",
		header: "Scheduled",
		size: 90,
		cell: ({ row }) => <span className="text-xs">{row.original.scheduled}</span>,
	},
	{
		accessorKey: "started",
		header: "Started",
		size: 90,
		cell: ({ row }) => <span className="text-xs">{row.original.started}</span>,
	},
	{
		accessorKey: "initialComplete",
		header: "Initial Complete",
		size: 100,
		cell: ({ row }) => <span className="text-xs">{row.original.initialComplete}</span>,
	},
	{
		accessorKey: "complete",
		header: "Complete",
		size: 85,
		cell: ({ row }) => <span className="text-xs">{row.original.complete}</span>,
	},
	{
		accessorKey: "editHistoryId",
		header: "Job Edit History",
		size: 100,
		cell: ({ row }) => (
			<button
				type="button"
				onClick={() => onOpenPhaseHistory(row.original.historyMilestoneKey)}
				className="text-xs font-medium text-brand-dark underline underline-offset-2 hover:text-blue-600"
			>
				{row.original.editHistoryId}
			</button>
		),
	},
];
