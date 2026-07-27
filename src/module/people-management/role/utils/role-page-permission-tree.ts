import { RoleFormValues } from "@/module/employee/utils/role-form-schema";

export type IRolePagePermissionFormItem = RoleFormValues["rolePagePermissions"][number];

export type IRolePagePermissionTreeNode = IRolePagePermissionFormItem & {
	index: number;
	children: IRolePagePermissionTreeNode[];
};

export const buildRolePagePermissionTree = (items: IRolePagePermissionFormItem[]): IRolePagePermissionTreeNode[] => {
	const nodeByPageId = new Map<string, IRolePagePermissionTreeNode>(
		items.map((item, index) => [item.pageId, { ...item, index, children: [] }])
	);
	const roots: IRolePagePermissionTreeNode[] = [];

	nodeByPageId.forEach((node) => {
		const parent = node.parentPageId ? nodeByPageId.get(node.parentPageId) : undefined;

		if (parent) {
			parent.children.push(node);
		} else {
			roots.push(node);
		}
	});

	return roots;
};

export type IFlattenedRolePagePermissionNode = {
	node: IRolePagePermissionTreeNode;
	depth: number;
};

export const flattenRolePagePermissionTree = (
	nodes: IRolePagePermissionTreeNode[],
	depth = 0
): IFlattenedRolePagePermissionNode[] => {
	return nodes.flatMap((node) => [{ node, depth }, ...flattenRolePagePermissionTree(node.children, depth + 1)]);
};
