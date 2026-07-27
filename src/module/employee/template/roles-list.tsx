"use client";

import { DataTable } from "@/components/shared/datatable/datatable";
import { useRolesWithPermissions } from "@/module/employee/hooks/useRolesAndPermissions";
import { IRoleWithPermissions } from "@/module/employee/types";
import CreateNewRoleTriggerModal from "@/module/employee/components/create-new-role-trigger-modal";
import { useRouter } from "next/navigation";
import { routes } from "@/config/routes";
import { useRoleColumns } from "@/module/employee/utils/role-columns";
import ErrorMessageComponent from "@/components/get-error-message";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
import SectionHeader from "@/components/shared/section-header";
import { useGetAdminPages } from "@/module/people-management/role/hooks/useRoles";
import { useGetMapZoneTabs } from "@/module/project-management/mapv2/hooks/useMapZoneTabs";

export default function RoleList() {
	const { data = [], isPending, isError, error } = useRolesWithPermissions();
	const tCommon = useTypedTranslations(NAMESPACE.COMMON);

	const { data: adminPagesData } = useGetAdminPages();
	const { data: adminTabsData } = useGetMapZoneTabs();

	const columns = useRoleColumns(adminPagesData || [], adminTabsData || []);
	const router = useRouter();

	const handleRowClick = (row: IRoleWithPermissions) => {
		router.push(routes.admin.roleDetails(row.role?.id));
	};

	if (isError) return ErrorMessageComponent({ error });

	return (
		<div className="min-h-screen w-full space-y-4 bg-white">
			{/* Header + Controls */}
			<div className="flex flex-col gap-3 pb-2 sm:flex-row sm:items-center sm:justify-between">
				<SectionHeader title={tCommon.roleManagement} />
				<CreateNewRoleTriggerModal />
			</div>

			{/* Table */}
			<DataTable
				showGridLines
				stickyHeaderMode
				columns={columns}
				data={data}
				onClick={handleRowClick}
				isLoading={isPending}
				useSectionHeader={false}
			/>
		</div>
	);
}
