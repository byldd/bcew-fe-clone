import { MATERIAL_ROLE, TEAM_NAME } from "@/utils/enums";
import { MATERIAL_REQUEST_ASSIGN_TO, REQUEST_TYPE_FILTER_VALUE } from "./enums";

const ASSIGN_TO_OPTIONS = [
	{ label: "Foreman", value: "FOREMAN" },
	{ label: "Requesting User", value: "REQUESTING_EMPLOYEE" },
	{ label: "Warehouse Manager", value: "WAREHOUSE_MANAGER" },
	{ label: "Office Manager", value: "OFFICE_MANAGER" },
	{ label: "Procurement Specialist", value: "PROCUREMENT_SPECIALIST" },
	{ label: "Custom Assignment", value: "CUSTOM_ASSIGNMENT" },
] as const;

const ALL_VALUE = "__all__";
const PHASE_OPTIONS = ["Slab Rough", "Rough", "Service", "Final", "Second Hit", "Warranty", "Jobbing"];

const PHASE_LABEL_BY_VALUE: Record<string, string> = {
	service: "Service",
	rough: "Rough",
	final: "Final",
	second_hit: "Second Hit",
	slab_rough: "Slab Rough",
};

const normalizePhaseLabel = (value?: string | null): string => {
	if (!value) return "";
	const key = value.trim().toLowerCase().replace(/\s+/g, "_");
	return PHASE_LABEL_BY_VALUE[key] ?? value.trim();
};

const BOOLEAN_FILTER_OPTIONS = [
	{ value: ALL_VALUE, label: "All" },
	{ value: "true", label: "True" },
	{ value: "false", label: "False" },
];

const REQUEST_TYPE_FILTER_OPTIONS = [
	{ value: ALL_VALUE, label: "All" },
	{ value: REQUEST_TYPE_FILTER_VALUE.PULL_LIST_REQUEST, label: "Pull list request" },
	{ value: REQUEST_TYPE_FILTER_VALUE.NOT_IN_PULL_LIST, label: "Not in pull list" },
	{ value: REQUEST_TYPE_FILTER_VALUE.UNKNOWN_ITEM, label: "Unknown item" },
];

const HIDDEN_COLUMN_IDS = new Set([
	"warehouseAddress",
	"warehouseNote",
	"officeAddress",
	"officeNote",
	"procurementSpecialistAddress",
	"procurementSpecialistNote",
]);

const TEAM_HIDDEN_COLUMNS: Partial<Record<string, Set<string>>> = {
	[TEAM_NAME.WAREHOUSE]: new Set([
		"foremanAddress",
		"foremanNote",
		"officeAddress",
		"officeNote",
		"procurementSpecialistAddress",
		"procurementSpecialistNote",
	]),
	[TEAM_NAME.OFFICE]: new Set([
		"foremanAddress",
		"foremanNote",
		"warehouseAddress",
		"warehouseNote",
		"procurementSpecialistAddress",
		"procurementSpecialistNote",
	]),
	[TEAM_NAME.PROCUREMENT]: new Set([
		"foremanAddress",
		"foremanNote",
		"warehouseAddress",
		"warehouseNote",
		"officeAddress",
		"officeNote",
	]),
};

const TEAM_ASSIGN_TO: Partial<Record<string, MATERIAL_REQUEST_ASSIGN_TO>> = {
	[TEAM_NAME.WAREHOUSE]: MATERIAL_REQUEST_ASSIGN_TO.WAREHOUSE_MANAGER,
	[TEAM_NAME.OFFICE]: MATERIAL_REQUEST_ASSIGN_TO.OFFICE_MANAGER,
	[TEAM_NAME.PROCUREMENT]: MATERIAL_REQUEST_ASSIGN_TO.PROCUREMENT_SPECIALIST,
};

const MATERIAL_ROLE_TO_ASSIGN: Partial<Record<MATERIAL_ROLE, MATERIAL_REQUEST_ASSIGN_TO>> = {
	[MATERIAL_ROLE.WAREHOUSE_MANAGER]: MATERIAL_REQUEST_ASSIGN_TO.WAREHOUSE_MANAGER,
	[MATERIAL_ROLE.OFFICE_MANAGER]: MATERIAL_REQUEST_ASSIGN_TO.OFFICE_MANAGER,
	[MATERIAL_ROLE.PROCUREMENT_SPECIALIST]: MATERIAL_REQUEST_ASSIGN_TO.PROCUREMENT_SPECIALIST,
};

const CROSS_ASSIGN_COUNTERPART: Partial<Record<MATERIAL_REQUEST_ASSIGN_TO, MATERIAL_REQUEST_ASSIGN_TO>> = {
	[MATERIAL_REQUEST_ASSIGN_TO.WAREHOUSE_MANAGER]: MATERIAL_REQUEST_ASSIGN_TO.PROCUREMENT_SPECIALIST,
	[MATERIAL_REQUEST_ASSIGN_TO.PROCUREMENT_SPECIALIST]: MATERIAL_REQUEST_ASSIGN_TO.WAREHOUSE_MANAGER,
};

const NOTE_MAX_LENGTH = 500;

export {
	ALL_VALUE,
	PHASE_OPTIONS,
	normalizePhaseLabel,
	ASSIGN_TO_OPTIONS,
	BOOLEAN_FILTER_OPTIONS,
	REQUEST_TYPE_FILTER_OPTIONS,
	HIDDEN_COLUMN_IDS,
	TEAM_HIDDEN_COLUMNS,
	TEAM_ASSIGN_TO,
	MATERIAL_ROLE_TO_ASSIGN,
	CROSS_ASSIGN_COUNTERPART,
	NOTE_MAX_LENGTH,
};
