"use client";

import { useRoleWithPermissions } from "@/module/employee/hooks/useRolesAndPermissions";
import RoleDetailsCard from "@/module/employee/components/role-details-card";
import RolePermissionSection from "@/module/employee/components/role-permission-section";
import ErrorMessageComponent from "@/components/get-error-message";
import { Spinner } from "@/components/ui/spinner";
import SectionHeader from "@/components/shared/section-header";
import { useGetAdminPages } from "@/module/people-management/role/hooks/useRoles";
import { useGetMapZoneTabs } from "@/module/project-management/mapv2/hooks/useMapZoneTabs";

type IRoleDetailsProps = {
	roleID: string;
};

const RoleDetails = ({ roleID }: IRoleDetailsProps) => {
	const { data, isPending, isError, error } = useRoleWithPermissions(roleID);

	const { data: adminPagesData } = useGetAdminPages();
	const { data: adminTabsData } = useGetMapZoneTabs();

	if (isPending) return <Spinner />;
	if (isError) return ErrorMessageComponent({ error });

	return (
		<div className="min-h-screen w-full space-y-6 bg-white">
			<SectionHeader title={data.role?.name} showBackButton />

			<main className="space-y-6">
				<RoleDetailsCard roleDetails={data.role} />
				<RolePermissionSection data={data} adminAllPages={adminPagesData || []} adminAllTabs={adminTabsData || []} />
			</main>
		</div>
	);
};

export default RoleDetails;
