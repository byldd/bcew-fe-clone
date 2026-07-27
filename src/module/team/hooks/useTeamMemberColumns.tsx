import { ColumnDef } from "@tanstack/react-table";
import { ITeamUser } from "@/module/team/types";
import { toFormattedDate } from "@/lib/utils/date";
import { DATE_FORMAT } from "@/types/date";
import RemoveTeamMemberTrigger from "@/module/team/components/remove-team-member-trigger";

export const useTeamMemberColumns = (teamId: string) => {
	const columns: ColumnDef<ITeamUser>[] = [
		{
			accessorKey: "name",
			header: "Employee Name",
		},
		{
			accessorKey: "joiningDate",
			header: "Joining Date",
			cell: ({ row }) => {
				const joiningDate = row.original.joiningDate;

				return joiningDate ? toFormattedDate(joiningDate, DATE_FORMAT.MM_SLASH_DD_YYYY) : "-";
			},
		},
		{
			accessorKey: "role.name",
			header: "Role",
			cell: ({ row }) => row.original.role?.name ?? "-",
		},
		{
			id: "expectedOutput",
			header: "Expected Output",
			cell: () => "-",
		},
		{
			id: "actions",
			header: "Action",
			cell: ({ row }) => (
				<div className="flex justify-center" onClick={(e) => e.stopPropagation()}>
					<RemoveTeamMemberTrigger userId={row.original.id} userName={row.original.name} currentTeamId={teamId} />
				</div>
			),
		},
	];

	return columns;
};
