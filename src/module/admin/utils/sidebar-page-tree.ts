import { ACCESS_LEVEL } from "@/module/employee/enums";
import { IGetAdminSidebarPages, ISidebarPageNode } from "../types/sideb-bar-page";

const filterAccessiblePages = (nodes: ISidebarPageNode[]): ISidebarPageNode[] => {
	return nodes.reduce<ISidebarPageNode[]>((accessiblePages, node) => {
		const children = filterAccessiblePages(node.children);
		const hasOwnAccess = node.rolePagePermission?.accessLevel !== ACCESS_LEVEL.NONE;

		if (hasOwnAccess || children.length > 0) {
			accessiblePages.push({ ...node, children });
		}

		return accessiblePages;
	}, []);
};

export const buildSidebarPageTree = (pages: IGetAdminSidebarPages["data"]): ISidebarPageNode[] => {
	const nodeById = new Map<string, ISidebarPageNode>(pages.map((page) => [page.id, { ...page, children: [] }]));
	const roots: ISidebarPageNode[] = [];

	nodeById.forEach((node) => {
		const parent = node.parentPageId ? nodeById.get(node.parentPageId) : undefined;

		if (parent) {
			parent.children.push(node);
		} else {
			roots.push(node);
		}
	});

	return filterAccessiblePages(roots);
};

export const isPageActive = (urlEndpoint: string, pathname: string | null): boolean => {
	return pathname === urlEndpoint || pathname?.startsWith(`${urlEndpoint}/`) === true;
};

export const hasActiveDescendant = (node: ISidebarPageNode, pathname: string | null): boolean => {
	return node.children.some(
		(child) => isPageActive(child.urlEndpoint, pathname) || hasActiveDescendant(child, pathname)
	);
};
