import { SidebarItem } from "@/types";
import { getNavItemKey } from "@/components/shared/sidebar/utils/nav-main";
import { FIXED_KEYS } from "@/components/shared/sidebar/enum";

export const FIXED_NAV_KEYS = [FIXED_KEYS.NOTIFICATIONS, FIXED_KEYS.DASHBOARD] as const;

type NavKey = string;

export const applyNavOrder = (items: SidebarItem[], order: NavKey[] = []): SidebarItem[] => {
	if (!items.length) return items;

	const fixedItems = items.filter((item) =>
		FIXED_NAV_KEYS.includes(getNavItemKey(item) as (typeof FIXED_NAV_KEYS)[number])
	);

	const dynamicItems = items.filter(
		(item) => !FIXED_NAV_KEYS.includes(getNavItemKey(item) as (typeof FIXED_NAV_KEYS)[number])
	);

	if (!order?.length) {
		return [...fixedItems, ...dynamicItems];
	}

	const map = new Map<string, SidebarItem>(dynamicItems.map((item) => [getNavItemKey(item), item]));

	const orderedDynamic = [
		...order.map((key) => map.get(key)),
		...dynamicItems.filter((item) => !order.includes(getNavItemKey(item))),
	].filter((item): item is SidebarItem => Boolean(item));

	return [...fixedItems, ...orderedDynamic];
};
