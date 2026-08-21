import {
	ICreateFilterSavedViewPayload,
	IFilterSavedView,
	IFilterSavedViewsResponse,
	IUpdateFilterSavedViewPayload,
} from "@/types";
import { EMPLOYEE_ZONE_FILTER, MAP_ZONE_CREATE_MODE, PROJECT_ZONE_STATUS } from "../utils/enums";
import { IMapZoneParams } from "../hooks/useMapZoneParams";

// X/Y (not lat/lng) to match the legacy geoTabAdapter Points format this data is seeded from
// (X = longitude, Y = latitude) - converted to google.maps LatLng only at the map render boundary.
export type IMapZonePoint = { X: number; Y: number };

export type IMapZoneType = {
	id: string;
	name: string;
	color: string | null;
	mapZoneTabId: string;
	_count: { mapZones: number };
};

export type IMapZoneTab = {
	id: string;
	name: string;
	mapZoneTypes: IMapZoneType[];
};

export type IRoleMapZoneTabPermission = {
	id: string;
	roleId: string;
	mapZoneTabId: string;
	isVisible: boolean;
};

export type IMapZone = {
	id: string;
	name: string;
	address: string | null;
	city: string | null;
	state: string | null;
	zipcode: string | null;
	country: string | null;
	empNum: number | null;
	projectRecnum: number | null;
	centroidLatitude: number | null;
	centroidLongitude: number | null;
	points: string | null;
	// BE-computed: the zone's own address if set, else the linked project's (bcew.reccln) or
	// employee's (bcew.vw_employ_unrestricted) address - see AdminZoneHelper.attachFullAddress.
	fullAddress: string | null;
	createdAt: string;
	updatedAt: string;
};

// Important bcew.reccln columns for a Project-type MapZone - mirrors mapZoneRecclnSelect /
// IMapZoneReccln on the backend (lib/routes/admin/zone/utils/query-include.ts, utils/types.ts).
// Add new fields to both sides when another project detail is needed.
export type IReccln = {
	recnum: number;
	clnnme: string;
	shtnme: string;
	addrs1: string;
	addrs2: string;
	ctynme: string;
	state_: string;
	zipcde: string;
	crsstr: string;
	status: number;
	phnnum: string;
};

export type IGetMapZone = IMapZone & {
	mapZoneType?: Pick<IMapZoneType, "id" | "name" | "color"> & {
		mapZoneTab?: Pick<IMapZoneTab, "id" | "name">;
	};
	// Only populated for zones under MAP_ZONE_TYPE.PROJECT - see AdminZoneHelper.attachFullAddress.
	reccln?: IReccln | null;
};

export type ICreateMapZonePayload = {
	name: string;
	mapZoneTypeId: string;
	mode: MAP_ZONE_CREATE_MODE;
	address?: string;
	city?: string;
	state?: string;
	zipcode?: string;
	country?: string;
	points?: IMapZonePoint[];
	empNum?: number;
	projectRecnum?: number;
};

export type IGetMapZoneFilter = {
	tabId?: string;
	typeId?: string;
	searchValue?: string;
	employeeFilter?: EMPLOYEE_ZONE_FILTER;
	projectStatus?: PROJECT_ZONE_STATUS;
	projectStatuses?: number[];
	foremanEmpNum?: number;
	page?: number;
	pageSize?: number;
};

export type IEmployeePickerOption = {
	empNum: number;
	name: string;
	address: string | null;
};

export type IProjectPickerOption = {
	projectRecnum: number;
	name: string;
	address: string | null;
};

// Saved filter views (FilterSavedView table, pageKey = FILTER_SAVED_VIEW_PAGE_KEY.PROJECT_MAP) -
// derived from the shared IFilterSavedView<T> generic (@/types), same as the material-requests
// module's MaterialRequestSavedView.
export type IMapZoneSavedView = IFilterSavedView<IMapZoneParams>;
export type IMapZoneSavedViewsResponse = IFilterSavedViewsResponse<IMapZoneParams>;
export type ICreateMapZoneSavedViewPayload = ICreateFilterSavedViewPayload<IMapZoneParams>;
export type IUpdateMapZoneSavedViewPayload = IUpdateFilterSavedViewPayload<IMapZoneParams>;
