import { IRoleWithPermissions } from "@/module/employee/types";
import { ColumnDef, Row } from "@tanstack/react-table";
import { toFormattedDate } from "@/lib/utils/date";
import { DATE_FORMAT } from "@/types/date";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
import RolePermissionEditModalTrigger from "@/module/employee/components/role-permission-edit-modal-trigger";
import { IPage } from "@/module/admin/types/sideb-bar-page";
import { IMapZoneTab } from "@/module/project-management/mapv2/types/zone";
import { useAdminPageAccessContext } from "@/module/admin/context/page-access";
import { ACCESS_LEVEL } from "../enums";

export const useRoleColumns = (adminAllPages: IPage[], adminAllTabs: IMapZoneTab[]) => {
	const tPeople = useTypedTranslations(NAMESPACE.PEOPLE_MANAGEMENT);
	const { pageAccess } = useAdminPageAccessContext();
	const columns: ColumnDef<IRoleWithPermissions>[] = [
		{
			accessorKey: "role.name",
			header: tPeople.jobRole,
			cell: ({ row }) => row.original.role.name,
		},

		{
			accessorKey: "role.createdDate",
			header: tPeople.creationDate,
			cell: ({ row }) => {
				const createdDate = row.original?.role?.createdDate;

				return createdDate ? toFormattedDate(createdDate, DATE_FORMAT.MM_SLASH_DD_YYYY) : "-";
			},
		},

		{
			header: "Employees Assigned",
			cell: ({ row }) => {
				return row?.original.users?.length;
			},
		},

		...(pageAccess?.accessLevel === ACCESS_LEVEL.WRITE
			? [
					{
						id: "actions",
						header: tPeople.actions,
						cell: ({ row }: { row: Row<IRoleWithPermissions> }) => (
							<div onClick={(e) => e.stopPropagation()}>
								<RolePermissionEditModalTrigger
									data={row.original}
									adminAllPages={adminAllPages}
									adminAllTabs={adminAllTabs}
								/>
							</div>
						),
					},
				]
			: []),
	];

	return columns;
};
