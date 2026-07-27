// Mirrors lib/routes/admin/zone/utils/enums.ts (MAP_ZONE_TYPE) on the backend - these are the
// fixed ids of the two seeded system zone types (see bcew-backend/docs/project-map.md §2.2).
export enum MAP_ZONE_TYPE {
	EMPLOYEE = "employee",
	PROJECT = "project",
}

export enum MAP_ZONE_CREATE_MODE {
	ADDRESS = "address",
	POLYGON = "polygon",
}

// The Project Map screen's two top-level views - the map/card-list split (default) or the
// full-page Project table (see project-map-page.tsx). Independent of tab selection.
export enum MAP_VIEW_MODE {
	MAP = "map",
	TABLE = "table",
}

// Mirrors lib/routes/admin/zone/utils/enums.ts MAP_ZONE_TAB (the seeded system tabs) - needed to
// tell whether the Employees/Projects tab is among the currently-selected tabs, to decide which
// filter panel(s) to show.
export enum MAP_ZONE_TAB {
	EMPLOYEE = "employees",
	PROJECT = "projects",
}

// Mirrors lib/routes/admin/zone/utils/enums.ts EMPLOYEE_ZONE_FILTER.
export enum EMPLOYEE_ZONE_FILTER {
	ALL = "all",
	FOREMAN = "foreman",
}

// ponytail: placeholder bcew.reccln.status codes - nobody could confirm the real Active/Completed
// values against the bcew DB yet. Update these two numbers once confirmed; nothing else changes.
export enum PROJECT_ZONE_STATUS {
	IN_PROGRESS = 1,
	DO_NOT_CONTACT = 2,
	COMPLETE = 5,
	CLOSED = 6,
}
