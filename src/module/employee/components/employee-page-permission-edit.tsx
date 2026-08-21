"use client";

import React, { useEffect } from "react";

import { IUserPagesPermissionPayload } from "@/module/employee/types";
import { ACCESS_LEVEL } from "@/module/employee/enums";
import RolePagePermissions from "@/module/people-management/role/components/role-page-permissions";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { employeePagePermissionSchema, EmployeePagePermissionValues } from "../utils/role-form-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { IPage } from "@/module/admin/types/sideb-bar-page";

interface Props {
	userPagePermission?: { pageId: string; accessLevel?: ACCESS_LEVEL }[];
	adminAllPages: IPage[];
	disabled?: boolean;
	pagePermissionsRef: React.MutableRefObject<IUserPagesPermissionPayload["userPagePermissions"]>;
}

const EmployeePagePermissionEdit: React.FC<Props> = ({
	userPagePermission,
	adminAllPages,
	disabled,
	pagePermissionsRef,
}) => {
	const form = useForm<EmployeePagePermissionValues>({
		resolver: zodResolver(employeePagePermissionSchema),
		defaultValues: {
			rolePagePermissions: adminAllPages.map((page) => {
				const permission = userPagePermission?.find((p) => p.pageId === page.id);

				return {
					pageId: page.id,
					pageName: page.name,
					parentPageId: page.parentPageId,
					accessLevel:
						permission?.accessLevel === ACCESS_LEVEL.READ || permission?.accessLevel === ACCESS_LEVEL.WRITE
							? permission.accessLevel
							: null,
				};
			}),
		},
	});

	useEffect(() => {
		form.reset({
			rolePagePermissions: adminAllPages.map((page) => {
				const permission = userPagePermission?.find((p) => p.pageId === page.id);

				return {
					pageId: page.id,
					pageName: page.name,
					parentPageId: page.parentPageId,
					accessLevel:
						permission?.accessLevel === ACCESS_LEVEL.READ || permission?.accessLevel === ACCESS_LEVEL.WRITE
							? permission.accessLevel
							: null,
				};
			}),
		});
	}, [userPagePermission, adminAllPages, form]);

	const watchedPermissions = form.watch("rolePagePermissions");

	useEffect(() => {
		pagePermissionsRef.current = watchedPermissions;
	}, [watchedPermissions, pagePermissionsRef]);

	return (
		<Form {...form}>
			<form>
				<div className="p-1">
					<RolePagePermissions disabled={disabled} />
				</div>
			</form>
		</Form>
	);
};

export default EmployeePagePermissionEdit;
