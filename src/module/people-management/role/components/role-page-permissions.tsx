import { ACCESS_LEVEL } from "@/module/employee/enums";
import { RoleFormValues } from "@/module/employee/utils/role-form-schema";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
import { useFormContext } from "react-hook-form";
import { buildRolePagePermissionTree, flattenRolePagePermissionTree } from "../utils/role-page-permission-tree";
import React from "react";

type IPageAccessLevel = RoleFormValues["rolePagePermissions"][number]["accessLevel"];

const RolePagePermissions = ({ disabled }: { disabled?: boolean }) => {
	const formContext = useFormContext<RoleFormValues>();
	const tPmanagement = useTypedTranslations(NAMESPACE.PEOPLE_MANAGEMENT);

	const { rolePagePermissions } = formContext.watch();

	const tree = buildRolePagePermissionTree(rolePagePermissions ?? []);
	const flattenedNodes = flattenRolePagePermissionTree(tree);

	const isToggleableNode = (node: (typeof flattenedNodes)[number]["node"]) =>
		node.children.length === 0 || (!!node.parentPageId && node.children.length > 0);

	const toggleableNodes = flattenedNodes.filter(({ node }) => isToggleableNode(node));

	const headerReadChecked =
		toggleableNodes.length > 0 &&
		toggleableNodes.every(
			({ node }) => node.accessLevel === ACCESS_LEVEL.READ || node.accessLevel === ACCESS_LEVEL.WRITE
		);
	const headerWriteChecked =
		toggleableNodes.length > 0 && toggleableNodes.every(({ node }) => node.accessLevel === ACCESS_LEVEL.WRITE);

	const updateAccessLevel = (index: number, current: IPageAccessLevel, toggled: ACCESS_LEVEL) => {
		const next: IPageAccessLevel =
			toggled === ACCESS_LEVEL.WRITE
				? current === ACCESS_LEVEL.WRITE
					? ACCESS_LEVEL.READ
					: ACCESS_LEVEL.WRITE
				: current === ACCESS_LEVEL.READ || current === ACCESS_LEVEL.WRITE
					? null
					: ACCESS_LEVEL.READ;

		formContext.setValue(`rolePagePermissions.${index}.accessLevel`, next);
	};

	const updateAllAccessLevels = (toggled: ACCESS_LEVEL) => {
		const turnOn = toggled === ACCESS_LEVEL.WRITE ? !headerWriteChecked : !headerReadChecked;

		toggleableNodes.forEach(({ node }) => {
			const current = node.accessLevel;
			const next: IPageAccessLevel =
				toggled === ACCESS_LEVEL.WRITE
					? turnOn
						? ACCESS_LEVEL.WRITE
						: current === ACCESS_LEVEL.WRITE
							? ACCESS_LEVEL.READ
							: current
					: turnOn
						? current === ACCESS_LEVEL.WRITE
							? ACCESS_LEVEL.WRITE
							: ACCESS_LEVEL.READ
						: null;

			formContext.setValue(`rolePagePermissions.${node.index}.accessLevel`, next);
		});
	};

	return (
		<div className="space-y-2 border-t pt-4">
			<div className="overflow-x-auto">
				<Table>
					<TableHeader>
						<TableRow className="text-brand-dark50">
							<TableHead className="w-1/2">Module</TableHead>
							<TableHead className="text-center">
								<div className="flex items-center justify-center gap-1">
									{tPmanagement.readOnlyAccess}
									{toggleableNodes.length > 0 && (
										<Switch
											disabled={disabled}
											checked={headerReadChecked}
											onCheckedChange={() => updateAllAccessLevels(ACCESS_LEVEL.READ)}
										/>
									)}
								</div>
							</TableHead>
							<TableHead className="text-center">
								<div className="flex items-center justify-center gap-1">
									{tPmanagement.writeEditAccess}
									{toggleableNodes.length > 0 && (
										<Switch
											disabled={disabled}
											checked={headerWriteChecked}
											onCheckedChange={() => updateAllAccessLevels(ACCESS_LEVEL.WRITE)}
										/>
									)}
								</div>
							</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{flattenedNodes.map(({ node, depth }) => {
							const hasRead = node.accessLevel === ACCESS_LEVEL.READ || node.accessLevel === ACCESS_LEVEL.WRITE;
							const hasWrite = node.accessLevel === ACCESS_LEVEL.WRITE;

							const showToggles = isToggleableNode(node);

							return (
								<TableRow key={node.pageId}>
									<TableCell style={{ paddingLeft: `${1.5 + depth * 1.5}rem` }} className="font-medium">
										{node.pageName}
									</TableCell>
									<TableCell className="text-center">
										{showToggles && (
											<Switch
												disabled={disabled}
												checked={hasRead}
												onCheckedChange={() => updateAccessLevel(node.index, node.accessLevel, ACCESS_LEVEL.READ)}
											/>
										)}
									</TableCell>
									<TableCell className="text-center">
										{showToggles && (
											<Switch
												disabled={disabled}
												checked={hasWrite}
												onCheckedChange={() => updateAccessLevel(node.index, node.accessLevel, ACCESS_LEVEL.WRITE)}
											/>
										)}
									</TableCell>
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
			</div>
		</div>
	);
};

export default RolePagePermissions;
