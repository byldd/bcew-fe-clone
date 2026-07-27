import { ACCESS_LEVEL, HAS_ACCESS } from "@/module/employee/enums";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PiInfo } from "react-icons/pi";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
import { buildRolePagePermissionTree, flattenRolePagePermissionTree } from "../utils/role-page-permission-tree";
import { ReactNode } from "react";
import { IPage, IRolePagePermission } from "@/module/admin/types/sideb-bar-page";
import { cn } from "@/lib/utils/utils";

const RolePagePermissionView = ({
	rolePagePermissions,
	children,
	adminAllPages = [],
	className,
	showTitle = true,
}: {
	rolePagePermissions: (Omit<IRolePagePermission, "roleId"> & { page: IPage })[];
	children?: ReactNode;
	adminAllPages: IPage[];
	className?: string;
	showTitle?: boolean;
}) => {
	const tPmanagement = useTypedTranslations(NAMESPACE.PEOPLE_MANAGEMENT);

	const tree = buildRolePagePermissionTree(
		adminAllPages?.map((page) => {
			const permission = rolePagePermissions.find((p) => p.pageId === page.id);
			return {
				pageId: page.id,
				pageName: page.name,
				parentPageId: page.parentPageId,
				accessLevel:
					permission?.accessLevel === ACCESS_LEVEL.READ || permission?.accessLevel === ACCESS_LEVEL.WRITE
						? permission.accessLevel
						: null,
			};
		})
	);
	const flattenedNodes = flattenRolePagePermissionTree(tree);

	const renderAccess = (
		accessLevel: ACCESS_LEVEL.READ | ACCESS_LEVEL.WRITE | null | undefined,
		check: ACCESS_LEVEL.READ | ACCESS_LEVEL.WRITE
	) => {
		const hasRead = accessLevel === ACCESS_LEVEL.READ || accessLevel === ACCESS_LEVEL.WRITE;
		const hasWrite = accessLevel === ACCESS_LEVEL.WRITE;

		const show = check === ACCESS_LEVEL.READ ? hasRead : hasWrite;
		return (
			<span className={`text-sm font-medium ${show ? "text-green-600" : "text-red-600"}`}>
				{show ? HAS_ACCESS.YES : HAS_ACCESS.NO}
			</span>
		);
	};

	return (
		<Card className={cn("rounded-3xl border border-brand-dark10 bg-white p-7", className)}>
			{showTitle && (
				<CardHeader className="mb-4 p-0">
					<CardTitle className="mb-4 flex items-center justify-between text-xl font-semibold">
						{tPmanagement.rolesAndPermission}
						{children}
					</CardTitle>
				</CardHeader>
			)}
			<CardContent className="p-0">
				<div className="space-y-4">
					<div className="overflow-x-auto">
						<Table>
							<TableHeader>
								<TableRow className="text-gray-500">
									<TableHead className="w-1/3">Page Access</TableHead>
									<TableHead className="text-center">
										<div className="flex items-center justify-center gap-1">
											<PiInfo className="h-4 w-4" />
											{tPmanagement.readOnlyAccess}
										</div>
									</TableHead>
									<TableHead className="text-center">
										<div className="flex items-center justify-center gap-1">
											<PiInfo className="h-4 w-4" />
											{tPmanagement.writeEditAccess}
										</div>
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{flattenedNodes.map(({ node, depth }) => {
									const showToggles = node.children.length === 0 || (!!node.parentPageId && node.children.length > 0);

									return (
										<TableRow key={node.pageId}>
											<TableCell
												style={{ paddingLeft: `${depth * 1.5}rem` }}
												className={`text-sm ${depth === 0 ? "font-semibold text-gray-700" : "text-gray-800"}`}
											>
												{node.pageName}
											</TableCell>
											<TableCell className="text-center">
												{showToggles && renderAccess(node.accessLevel, ACCESS_LEVEL.READ)}
											</TableCell>
											<TableCell className="text-center">
												{showToggles && renderAccess(node.accessLevel, ACCESS_LEVEL.WRITE)}
											</TableCell>
										</TableRow>
									);
								})}
							</TableBody>
						</Table>
					</div>
				</div>
			</CardContent>
		</Card>
	);
};

export default RolePagePermissionView;
