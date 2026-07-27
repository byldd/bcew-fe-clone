"use client";

import { useRef, useState } from "react";
import { IRoleWithPermissions } from "@/module/employee/types";
import RolePermissionCard from "@/module/employee/components/role-permission-card";
import RolePermissionEditModalTrigger from "@/module/employee/components/role-permission-edit-modal-trigger";
import { isProductionEnv } from "@/utils";
import { IPage } from "@/module/admin/types/sideb-bar-page";
import { IMapZoneTab } from "@/module/project-management/mapv2/types/zone";
import RolePermissionEditModal from "./role-permission-edit-modal";
import EditPermissions from "./edit-permissions";
import { UseFormReturn } from "react-hook-form";
import { RoleFormValues } from "../utils/role-form-schema";

type IRolePermissionsSectionProps = {
	data: IRoleWithPermissions;
	adminAllPages: IPage[];
	adminAllTabs: IMapZoneTab[];
};

const RolePermissionSection = ({ data, adminAllPages, adminAllTabs }: IRolePermissionsSectionProps) => {
	const [isEditing, setIsEditing] = useState(false);
	const formRef = useRef<UseFormReturn<RoleFormValues> | null>(null);
	const submitRef = useRef<(() => void) | null>(null);

	const handleEdit = () => {
		setIsEditing(true);
	};

	const handleDiscard = () => {
		formRef.current?.reset();
		setIsEditing(false);
	};

	const handleSave = () => {
		submitRef.current?.();
	};

	if (isProductionEnv()) {
		return (
			<RolePermissionCard rolePermissions={data.permissions}>
				<RolePermissionEditModalTrigger data={data} adminAllPages={adminAllPages} adminAllTabs={adminAllTabs} />
			</RolePermissionCard>
		);
	}

	return (
		<div className="space-y-4">
			<div className="flex justify-end">
				<EditPermissions
					isEditing={isEditing}
					isSaving={formRef.current?.formState.isSubmitting}
					onEdit={handleEdit}
					onDiscard={handleDiscard}
					onSave={handleSave}
				/>
			</div>

			<RolePermissionEditModal
				adminAllPages={adminAllPages}
				adminAllTabs={adminAllTabs}
				data={data}
				showFooterActions={false}
				disabled={!isEditing}
				formRef={formRef}
				submitRef={submitRef}
				onSuccess={() => setIsEditing(false)}
			/>
		</div>
	);
};

export default RolePermissionSection;
