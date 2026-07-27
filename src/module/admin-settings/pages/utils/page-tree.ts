import { IPageWithPermissions } from "../types/page";

export type IPageNode = IPageWithPermissions & {
	children: IPageNode[];
};

export function buildPageTree(pages: IPageWithPermissions[]): IPageNode[] {
	const nodeMap = new Map<string, IPageNode>();
	const roots: IPageNode[] = [];

	pages.forEach((page) => {
		nodeMap.set(page.id, { ...page, children: [] });
	});

	pages.forEach((page) => {
		const node = nodeMap.get(page.id)!;
		if (page.parentPageId && nodeMap.has(page.parentPageId)) {
			nodeMap.get(page.parentPageId)!.children.push(node);
		} else {
			roots.push(node);
		}
	});

	return roots;
}
