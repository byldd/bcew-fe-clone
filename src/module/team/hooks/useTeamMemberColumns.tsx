import { ColumnDef, Row } from "@tanstack/react-table";
import { ITeamUser } from "@/module/team/types";
import { toFormattedDate } from "@/lib/utils/date";
import { DATE_FORMAT } from "@/types/date";
import RemoveTeamMemberTrigger from "@/module/team/components/remove-team-member-trigger";
import { useAdminPageAccessContext } from "@/module/admin/context/page-access";
import { ACCESS_LEVEL } from "@/module/employee/enums";

export const useTeamMemberColumns = (teamId: string) => {
	const { pageAccess } = useAdminPageAccessContext();
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

		...(pageAccess?.accessLevel === ACCESS_LEVEL.WRITE
			? [
					{
						id: "actions",
						header: "Action",
						cell: ({ row }: { row: Row<ITeamUser> }) => (
							<div className="flex justify-center" onClick={(e) => e.stopPropagation()}>
								<RemoveTeamMemberTrigger userId={row.original.id} userName={row.original.name} currentTeamId={teamId} />
							</div>
						),
					},
				]
			: []),
	];

	return columns;
};
