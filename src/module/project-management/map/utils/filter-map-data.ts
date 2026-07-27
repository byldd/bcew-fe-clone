import { IQcInspectionForeman } from "@/module/schedule-management/weekly-schedule-management/types/qc-job";
import { IMapParams } from "../hooks/useMapParams";
import { EMPLOYEE_TYPE_OPTION, IGetMapZonesResponse } from "../types/zone";
import { IGetGeoTabZonesResponse } from "@/module/schedule-management/schedule-configuration/types/zone";

export const filterJobSites = ({
	params,
	jobSites,
	search,
}: {
	params: IMapParams;
	jobSites: IGetMapZonesResponse["data"]["jobSites"];
	search: string | null | undefined;
}) => {
	let filterData = jobSites;
	if (params.jobStatus) {
		filterData = jobSites?.filter((site) => {
			return site.jobStatus.Status == params.jobStatus;
		});
	}
	if (params.foremanEmpNums?.length) {
		filterData = filterData?.filter((site) => {
			return params.foremanEmpNums?.includes(String(site?.clientDepartment?.deptManager?.empnum));
		});
	}

	if (search) {
		filterData = filterData?.filter((site) => {
			return site.clnnme.toLowerCase().includes(search.toLowerCase());
		});
	}

	return filterData?.filter((item) => !!item?.zone?.id);
};

export const filterEmployees = ({
	employees,
	search,
	params,
	inspectionForemans,
}: {
	employees: IGetMapZonesResponse["data"]["employees"];
	search: string | null | undefined;
	params: IMapParams;
	inspectionForemans: IQcInspectionForeman[];
}) => {
	let filterData = employees;
	if (search) {
		filterData = filterData?.filter((employee) => {
			return employee.user.name.toLowerCase().includes(search.toLowerCase());
		});
	}

	if (params.employeeType == EMPLOYEE_TYPE_OPTION.FOREMAN) {
		filterData = filterData?.filter((employee) => {
			const forman = inspectionForemans?.find((foreman) => {
				return Number(foreman.deptManager.employee.bcewEmployeeNumber) == Number(employee.bcewEmployeeNumber);
			});

			return !!forman;
		});
	}
	return filterData;
};

export const filteredOfficeZones = ({
	search,
	officeZones,
}: {
	search: string | null | undefined;
	officeZones: IGetGeoTabZonesResponse["items"];
}) => {
	let filterData = officeZones;
	if (search) {
		filterData = filterData?.filter((zone) => {
			return zone.Name.toLowerCase().includes(search.toLowerCase());
		});
	}
	return filterData;
};

export const filteredStorageZones = ({
	search,
	storageUnitZones,
}: {
	search: string | null | undefined;
	storageUnitZones: IGetGeoTabZonesResponse["items"];
}) => {
	let filterData = storageUnitZones;
	if (search) {
		filterData = filterData?.filter((zone) => {
			return zone.Name.toLowerCase().includes(search.toLowerCase());
		});
	}
	return filterData;
};
