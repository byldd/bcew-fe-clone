import { IGeoTabZone } from "@/module/schedule-management/schedule-configuration/types/zone";
import { IEmployee, IUser } from "@/module/schedule-management/weekly-schedule-management/types/schedule-interface";
import { IApiResponse } from "@/types";

export enum MapTab {
	PROJECTS = "projects",
	EMPLOYEES = "employees",
	VENDOR = "vendor",
	OFFICE = "office",
	WHAREHOUSE = "wharehouse",
	ALL = "All",
}

export type IMapProject = {
	clnnme: string;
	recnum: number;

	clientDepartment?: {
		deptManager?: {
			empnum: number;
		};
	};
	jobStatus: { Status: string };
	zone: IGeoTabZone;
};

export type IMapEmployee = IEmployee & {
	user: IUser;
	zone: IGeoTabZone;
	address: string;
};

export type IVendor = {
	id: number;
	name: string;
	address: string;
	CentroidLatitude: number;
	CentroidLongitude: number;
};

export type IGetMapZonesResponse = IApiResponse<{
	jobSites: IMapProject[];
	employees: IMapEmployee[];
	vendors: IVendor[];
}>;

export type ITabMapMarker = {
	id: string | number;
	lat: number;
	lng: number;
	color: string;
	title: string;
	subtitle?: string;
};

export enum GEOTAB_ZONE_ID {
	VENDOR_SERVICE = "ZoneTypeVendorServiceCenterId",
	ADDRESS_LOOKUP = "ZoneTypeAddressLookupId",
	CUSTOMER = "ZoneTypeCustomerId",
	OFFICE = "ZoneTypeOfficeId",
	IN_HOUSE_SERVICE_CENTER = "ZoneTypeInHouseServiceCenterId",
	HOME = "ZoneTypeHomeId",
	REPAIR_SHOP = "b5",
	STORAGE_UNIT = "b6",
	MEETING = "b39C",
}

export enum EMPLOYEE_TYPE_OPTION {
	ALL = "All",
	FOREMAN = "Foreman",
}
