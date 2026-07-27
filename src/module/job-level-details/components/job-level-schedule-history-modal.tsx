import { DataTable } from "@/components/shared/datatable/datatable";
import { ColumnDef } from "@tanstack/react-table";
import { FALLBACK } from "../constants";
import { useJobScheduleHistory } from "../hooks/useJobScheduleHistory";
import { JobScheduleHistoryEntry, JobScheduleMilestoneKey } from "../utils/types";
import { formatScheduleDate, formatScheduleHistoryDateTime } from "../utils";

export default function JobLevelScheduleHistoryModal({
	jobId,
	highlightedMilestoneKey,
}: {
	jobId: number;
	highlightedMilestoneKey?: JobScheduleMilestoneKey | null;
}) {
	const { data, isLoading, isError } = useJobScheduleHistory(jobId);

	if (isError) {
		return <p className="text-sm text-red-600">Unable to load schedule history.</p>;
	}

	if (!data?.entries?.length) {
		return <p className="text-sm text-brand-dark50">No schedule history available.</p>;
	}

	const columns: ColumnDef<JobScheduleHistoryEntry>[] = [
		{
			accessorKey: "milestoneLabel",
			header: "Milestone",
			cell: ({ row }) => <span className="font-medium text-brand-dark">{row.original.milestoneLabel}</span>,
		},
		{
			accessorKey: "oldDate",
			header: "Old Date",
			cell: ({ row }) => <span>{formatScheduleDate(row.original.oldDate)}</span>,
		},
		{
			accessorKey: "newDate",
			header: "New Date",
			cell: ({ row }) => <span>{formatScheduleDate(row.original.newDate)}</span>,
		},
		{
			accessorKey: "user",
			header: "User",
			cell: ({ row }) => <span>{row.original.user || FALLBACK}</span>,
		},
		{
			accessorKey: "changedAt",
			header: "Date & Time Stamp",
			cell: ({ row }) => <span>{formatScheduleHistoryDateTime(row.original.changedAt)}</span>,
		},
	];

	return (
		<div className="overflow-x-auto">
			<DataTable
				columns={columns}
				data={data.entries}
				isLoading={isLoading}
				useSectionHeader={false}
				rowClassName={(row) => (highlightedMilestoneKey === row.milestoneKey ? "bg-amber-50" : "")}
			/>
		</div>
	);
}
