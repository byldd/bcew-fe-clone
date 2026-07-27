"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { IPermissions } from "@/module/employee/types";
import { useEmployeeUpdatePermissions } from "@/module/employee/hooks/useEmployee";
import { ACCESS_LEVEL, SKIP_HEADINGS } from "@/module/employee/enums";
import { openErrorToast, openSuccessToast } from "@/components/toast";
import { useQueryClient } from "@tanstack/react-query";
import {
	LOCKED_MODULES,
	MODULE_DISPLAY_ORDER,
	MODULE_HEADING_WITH_DISPLAY_ORDER,
	MODULE_LABELS,
} from "@/module/employee/constants";
import { MODULE } from "@/utils/enums";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";

interface Props {
	id: string;
	permissions: IPermissions[];
	onClose: () => void;
}

const EmployeeRolePermissionEditModal: React.FC<Props> = ({ id, permissions, onClose }) => {
	const tPeople = useTypedTranslations(NAMESPACE.PEOPLE_MANAGEMENT);
	const tCommon = useTypedTranslations(NAMESPACE.COMMON);
	const [updatedPermissions, setUpdatedPermissions] = useState<IPermissions[]>(() =>
		MODULE_DISPLAY_ORDER.map((m) => {
			const match = permissions.find((p) => p.module === m);
			return {
				id: match?.id ?? "",
				moduleId: match?.moduleId ?? "",
				module: m,
				accessLevel: match?.accessLevel ?? ACCESS_LEVEL.NONE,
			};
		})
	);

	const updateEmployeePermissionsMutation = useEmployeeUpdatePermissions(id);
	const queryClient = useQueryClient();

	const handleAccessChange = (module: string, level: ACCESS_LEVEL.READ | ACCESS_LEVEL.WRITE) => {
		setUpdatedPermissions((prev) =>
			prev.map((permission) => {
				if (permission.module !== module) return permission;

				const current = permission.accessLevel;

				if (level === ACCESS_LEVEL.WRITE) {
					return {
						...permission,
						accessLevel: current === ACCESS_LEVEL.WRITE ? ACCESS_LEVEL.READ : ACCESS_LEVEL.WRITE,
					};
				}

				if (level === ACCESS_LEVEL.READ) {
					if (current === ACCESS_LEVEL.READ || current === ACCESS_LEVEL.WRITE) {
						return { ...permission, accessLevel: ACCESS_LEVEL.NONE };
					}
					return { ...permission, accessLevel: ACCESS_LEVEL.READ };
				}

				return permission;
			})
		);
	};

	const handleSubmit = () => {
		const payload = updatedPermissions.map(({ id, moduleId, accessLevel }) => ({
			permissionId: id,
			moduleId,
			accessLevel,
		}));

		updateEmployeePermissionsMutation.mutate(payload, {
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["employeePermissions"] });
				openSuccessToast(tPeople.permissionsUpdatedSuccessfully);
				onClose();
			},
			onError: (error) => {
				openErrorToast({ error });
			},
		});
	};

	return (
		<div className="p-1">
			<CardContent className="p-0">
				<Table>
					<TableHeader>
						<TableRow className="text-brand-dark50">
							<TableHead className="w-1/3">{tPeople.moduleAccess}</TableHead>
							<TableHead className="text-center">
								<div className="flex items-center justify-center gap-1">{tPeople.readOnlyAccess}</div>
							</TableHead>
							<TableHead className="text-center">
								<div className="flex items-center justify-center gap-1">{tPeople.writeEditAccess}</div>
							</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{Object.entries(MODULE_HEADING_WITH_DISPLAY_ORDER).map(([heading, modules]) => (
							<React.Fragment key={heading}>
								{/* Heading row */}
								{!Object.values(SKIP_HEADINGS)?.includes(heading as SKIP_HEADINGS) && (
									<TableRow>
										<TableCell className="font-bold" colSpan={3}>
											{heading}
										</TableCell>
									</TableRow>
								)}

								{/* Module rows under the heading */}
								{modules.map((module) => {
									const perm = updatedPermissions.find((p) => p.module === module);
									if (!perm) return null;

									const isLocked = LOCKED_MODULES.includes(module);

									return (
										<TableRow key={perm.module}>
											<TableCell
												className={`${perm.module !== MODULE.DASHBOARD && perm.module !== MODULE.REPORTS_AND_EXPORTS && perm.module !== MODULE.BUILDER_COMMUNICATIONS && "pl-6"} font-medium`}
											>
												{MODULE_LABELS[perm.module] ?? perm.module}
											</TableCell>
											<TableCell className="text-center">
												<Switch
													checked={perm.accessLevel === ACCESS_LEVEL.READ || perm.accessLevel === ACCESS_LEVEL.WRITE}
													onCheckedChange={() => handleAccessChange(perm.module, ACCESS_LEVEL.READ)}
													disabled={isLocked}
												/>
											</TableCell>
											<TableCell className="text-center">
												<Switch
													checked={perm.accessLevel === ACCESS_LEVEL.WRITE}
													onCheckedChange={() => handleAccessChange(perm.module, ACCESS_LEVEL.WRITE)}
													disabled={isLocked}
												/>
											</TableCell>
										</TableRow>
									);
								})}
							</React.Fragment>
						))}
					</TableBody>
				</Table>
			</CardContent>

			<div className="mt-6 flex justify-end gap-2">
				<Button
					disabled={updateEmployeePermissionsMutation.isPending}
					onClick={onClose}
					variant="outline"
					className="w-full"
				>
					{tCommon.cancel}
				</Button>

				<Button
					variant="filled"
					onClick={handleSubmit}
					loading={updateEmployeePermissionsMutation.isPending}
					className="w-full"
				>
					{tCommon.save}
				</Button>
			</div>
		</div>
	);
};

export default EmployeeRolePermissionEditModal;
