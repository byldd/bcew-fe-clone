import { IMapZoneParams } from "../hooks/useMapZoneParams";
import { EMPLOYEE_ZONE_FILTER } from "./enums";

export const DEFAULT_MAP_ZONE_PARAMS: IMapZoneParams = {
	tabIds: [],
	typeId: null,
	searchValue: "",
	employeeFilter: EMPLOYEE_ZONE_FILTER.ALL,
	projectStatus: null,
	foremanEmpNum: null,
};

// Multi-select tabIds order shouldn't affect equality - sort before comparing/serializing.
export const normalizeMapZoneFilters = (filters: IMapZoneParams) =>
	JSON.stringify({
		tabIds: [...filters.tabIds].sort(),
		typeId: filters.typeId ?? "",
		searchValue: filters.searchValue ?? "",
		employeeFilter: filters.employeeFilter,
		projectStatus: filters.projectStatus ?? "",
		foremanEmpNum: filters.foremanEmpNum ?? "",
	});

export const hasActiveMapZoneFilters = (filters: IMapZoneParams) =>
	normalizeMapZoneFilters(filters) !== normalizeMapZoneFilters(DEFAULT_MAP_ZONE_PARAMS);
