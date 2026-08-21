"use client";

import { useRef, useState } from "react";
import { IRoleWithPermissions } from "@/module/employee/types";

import { IPage } from "@/module/admin/types/sideb-bar-page";
import { IMapZoneTab } from "@/module/project-management/mapv2/types/zone";
import RolePermissionEditModal from "./role-permission-edit-modal";
import EditPermissions from "./edit-permissions";
import { UseFormReturn } from "react-hook-form";
import { RoleFormValues } from "../utils/role-form-schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";

type IRolePermissionsSectionProps = {
	data: IRoleWithPermissions;
	adminAllPages: IPage[];
	adminAllTabs: IMapZoneTab[];
};

const RolePermissionSection = ({ data, adminAllPages, adminAllTabs }: IRolePermissionsSectionProps) => {
	const tPmanagement = useTypedTranslations(NAMESPACE.PEOPLE_MANAGEMENT);
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

	return (
		<Card className="rounded-3xl border border-brand-dark10 bg-white !p-7">
			<CardHeader className="mb-4 p-0">
				<CardTitle className="flex items-center justify-between text-xl font-semibold">
					{tPmanagement.rolesAndPermission}
					<EditPermissions
						isEditing={isEditing}
						isSaving={formRef.current?.formState.isSubmitting}
						onEdit={handleEdit}
						onDiscard={handleDiscard}
						onSave={handleSave}
					/>
				</CardTitle>
			</CardHeader>

			<CardContent className="p-0">
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
			</CardContent>
		</Card>
	);
};

export default RolePermissionSection;
