import { SidebarItem } from "@/types";

export function getNavItemKey(item: SidebarItem): string {
	return item.key ?? item.title;
}
