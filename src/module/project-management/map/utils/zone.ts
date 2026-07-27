import { IGeoTabZone, IGeoTabZoneType } from "@/module/schedule-management/schedule-configuration/types/zone";
import { MapTab } from "../types/zone";

export const getZoneTypeId = (zone: IGeoTabZone): string => {
	return JSON.parse(zone.ZoneTypeIds)[0]?.Id;
};

export const MAP_TAB_COLOR: Record<MapTab, string> = {
	[MapTab.ALL]: "#62CD32",
	[MapTab.PROJECTS]: "#62CD32",
	[MapTab.EMPLOYEES]: "#3B82F6",
	[MapTab.VENDOR]: "#F97316",
	[MapTab.OFFICE]: "#8B5CF6",
	[MapTab.WHAREHOUSE]: "#14B8A6",
};

export const ZONE_TYPE_COLORS = [
	"#EF4444",
	"#F97316",
	"#EAB308",
	"#22C55E",
	"#06B6D4",
	"#3B82F6",
	"#8B5CF6",
	"#EC4899",
	"#14B8A6",
	"#64748B",
];

export const getZoneTypeColourMap = ({ zoneTypes }: { zoneTypes: IGeoTabZoneType[] }) => {
	const map = new Map<string, string>();
	zoneTypes.forEach((t, i) => {
		map.set(t.GeotabId, ZONE_TYPE_COLORS[i]!);
	});
	return map;
};

export const mapTabs = [
	{
		label: "All",
		value: MapTab.ALL,
	},
	{
		label: "Projects",
		value: MapTab.PROJECTS,
	},
	{
		label: "Employees",
		value: MapTab.EMPLOYEES,
	},
	{
		label: "Vendors",
		value: MapTab.VENDOR,
	},
	{
		label: "Office",
		value: MapTab.OFFICE,
	},
	{
		label: "Storage Unit",
		value: MapTab.WHAREHOUSE,
	},
];

// mapTabs minus the "All" tab — the set of categories the All tab can include/exclude.
export const mapSubTabs = mapTabs.filter((t) => t.value !== MapTab.ALL);
export const mapSubTabValues = mapSubTabs.map((t) => t.value);

// Tags an item/marker id with its originating tab so items from different categories
// (which can share the same underlying id, e.g. zone id vs. recnum) stay unique when merged in the All tab.
export const buildAllTabItemId = (tab: MapTab, id: string | number): string => `${tab}:${id}`;
