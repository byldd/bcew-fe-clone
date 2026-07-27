import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { EMPLOYEE_ZONE_FILTER, PROJECT_ZONE_STATUS } from "../utils/enums";

export type IMapZoneParams = {
	tabIds: string[];
	typeId: string | null;
	searchValue: string;
	employeeFilter: EMPLOYEE_ZONE_FILTER;
	projectStatus: PROJECT_ZONE_STATUS | null;
	foremanEmpNum: string | null;
};

const mapZoneParamsKeys = {
	tabIds: "tabIds",
	typeId: "typeId",
	searchValue: "searchValue",
	employeeFilter: "employeeFilter",
	projectStatus: "projectStatus",
	foremanEmpNum: "foremanEmpNum",
};

const useMapZoneParams = () => {
	const router = useRouter();
	const searchParams = useSearchParams();

	const getParams = useCallback((): IMapZoneParams => {
		const projectStatus = searchParams.get(mapZoneParamsKeys.projectStatus);

		return {
			tabIds: searchParams.getAll(mapZoneParamsKeys.tabIds),
			typeId: searchParams.get(mapZoneParamsKeys.typeId),
			searchValue: searchParams.get(mapZoneParamsKeys.searchValue) ?? "",
			// "All" still means active-only server-side - see EMPLOYEE_ZONE_FILTER.
			employeeFilter:
				(searchParams.get(mapZoneParamsKeys.employeeFilter) as EMPLOYEE_ZONE_FILTER | null) ?? EMPLOYEE_ZONE_FILTER.ALL,
			projectStatus: projectStatus ? (Number(projectStatus) as PROJECT_ZONE_STATUS) : null,
			foremanEmpNum: searchParams.get(mapZoneParamsKeys.foremanEmpNum),
		};
	}, [searchParams]);

	const setParams = useCallback(
		(params: Partial<IMapZoneParams>, persistPreviousParams = true) => {
			const previous = getParams();
			const newParams = new URLSearchParams();

			if (persistPreviousParams) {
				previous.tabIds.forEach((id) => newParams.append(mapZoneParamsKeys.tabIds, id));
				if (previous.typeId) newParams.set(mapZoneParamsKeys.typeId, previous.typeId);
				if (previous.searchValue) newParams.set(mapZoneParamsKeys.searchValue, previous.searchValue);
				if (previous.employeeFilter !== EMPLOYEE_ZONE_FILTER.ALL)
					newParams.set(mapZoneParamsKeys.employeeFilter, previous.employeeFilter);
				if (previous.projectStatus !== null)
					newParams.set(mapZoneParamsKeys.projectStatus, String(previous.projectStatus));
				if (previous.foremanEmpNum) newParams.set(mapZoneParamsKeys.foremanEmpNum, previous.foremanEmpNum);
			}

			if (params.tabIds !== undefined) {
				newParams.delete(mapZoneParamsKeys.tabIds);
				params.tabIds.forEach((id) => newParams.append(mapZoneParamsKeys.tabIds, id));
			}

			if (params.typeId !== undefined) {
				if (params.typeId) newParams.set(mapZoneParamsKeys.typeId, params.typeId);
				else newParams.delete(mapZoneParamsKeys.typeId);
			}

			if (params.searchValue !== undefined) {
				if (params.searchValue) newParams.set(mapZoneParamsKeys.searchValue, params.searchValue);
				else newParams.delete(mapZoneParamsKeys.searchValue);
			}

			if (params.employeeFilter !== undefined) {
				if (params.employeeFilter !== EMPLOYEE_ZONE_FILTER.ALL)
					newParams.set(mapZoneParamsKeys.employeeFilter, params.employeeFilter);
				else newParams.delete(mapZoneParamsKeys.employeeFilter);
			}

			if (params.projectStatus !== undefined) {
				if (params.projectStatus !== null) newParams.set(mapZoneParamsKeys.projectStatus, String(params.projectStatus));
				else newParams.delete(mapZoneParamsKeys.projectStatus);
			}

			if (params.foremanEmpNum !== undefined) {
				if (params.foremanEmpNum) newParams.set(mapZoneParamsKeys.foremanEmpNum, params.foremanEmpNum);
				else newParams.delete(mapZoneParamsKeys.foremanEmpNum);
			}

			router.replace(`?${newParams.toString()}`, { scroll: false });
		},
		[getParams, router]
	);

	return { getParams, setParams };
};

export default useMapZoneParams;
