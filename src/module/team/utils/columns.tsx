import { ColumnDef } from "@tanstack/react-table";
import { ITeam } from "@/module/team/types";
import { toFormattedDate } from "@/lib/utils/date";
import { DATE_FORMAT } from "@/types/date";
import EditTeamTrigger from "@/module/team/components/edit-team-trigger";
import { ACCESS_LEVEL } from "@/module/employee/enums";
import { useAdminPageAccessContext } from "@/module/admin/context/page-access";

export const useTeamColumns = () => {
	const { pageAccess } = useAdminPageAccessContext();

	const accessLevel = pageAccess?.accessLevel;

	const columns: ColumnDef<ITeam>[] = [
		{
			accessorKey: "name",
			header: "Team Name",
		},
		{
			accessorKey: "dayStartTime",
			header: "Day Start Time",
			cell: ({ row }) => {
				const dayStartTime = row.original.dayStartTime;

				return dayStartTime ? toFormattedDate(dayStartTime, DATE_FORMAT.HH_MM_AA_PM) : "-";
			},
		},
		{
			accessorKey: "dayEndTime",
			header: "Day End Time",
			cell: ({ row }) => {
				const dayEndTime = row.original.dayEndTime;

				return dayEndTime ? toFormattedDate(dayEndTime, DATE_FORMAT.HH_MM_AA_PM) : "-";
			},
		},
		{
			accessorKey: "isPauseAllowed",
			header: "Pause Allowed",
			cell: ({ row }) => (row.original.isPauseAllowed ? "Yes" : "No"),
		},
		{
			accessorKey: "createdAt",
			header: "Created",
			cell: ({ row }) => {
				const createdAt = row.original.createdAt;

				return createdAt ? toFormattedDate(createdAt, DATE_FORMAT.MM_SLASH_DD_YYYY) : "-";
			},
		},

		{
			accessorKey: "totalMembers",
			header: "Total Members",
			cell: ({ row }) => row.original?.totalMembers || 0,
		},

		...(accessLevel === ACCESS_LEVEL.WRITE
			? [
					{
						id: "actions",
						header: "Action",
						cell: ({ row }: { row: { original: ITeam } }) => (
							<div onClick={(e) => e.stopPropagation()}>
								<EditTeamTrigger team={row.original} />
							</div>
						),
					},
				]
			: []),
	];

	return columns;
};
