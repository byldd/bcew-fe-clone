import { useMemo } from "react";
import { IGeoTabZone, IGetGeoTabZonesResponse } from "@/module/schedule-management/schedule-configuration/types/zone";
import { GEOTAB_ZONE_ID, IGetMapZonesResponse, ITabMapMarker, MapTab } from "../types/zone";
import { getZoneTypeId, MAP_TAB_COLOR } from "../utils/zone";
import { IQcInspectionForeman } from "@/module/schedule-management/weekly-schedule-management/types/qc-job";
import { IMapParams } from "./useMapParams";
import { filteredOfficeZones, filteredStorageZones, filterEmployees, filterJobSites } from "../utils/filter-map-data";

export const useGetMapMarkers = ({
	jobSites,
	employees,
	offices,
	wharehouses,
	vendors,
}: {
	jobSites: IGetMapZonesResponse["data"]["jobSites"];
	employees: IGetMapZonesResponse["data"]["employees"];
	offices: IGeoTabZone[];
	wharehouses: IGeoTabZone[];
	vendors: IGetMapZonesResponse["data"]["vendors"];
}) => {
	// Memoized so marker arrays keep a stable reference across renders that don't actually
	// change the underlying zones (e.g. hover-only state updates) — TabMap's pan/zoom effect
	// keys off this array's identity, so a fresh reference on every render would re-trigger it.
	return useMemo(() => {
		const projectMarkers: ITabMapMarker[] = jobSites
			.filter((p) => p.zone?.CentroidLatitude && p.zone?.CentroidLongitude)
			.map((p) => ({
				id: p.recnum,
				lat: p.zone.CentroidLatitude,
				lng: p.zone.CentroidLongitude,
				color: MAP_TAB_COLOR[MapTab.PROJECTS],
				title: p.clnnme,
				subtitle: p.clnnme,
			}));

		const employeeMarkers: ITabMapMarker[] = employees
			.filter((e) => e.zone?.CentroidLatitude && e.zone?.CentroidLongitude)
			.map((e) => ({
				id: e.id,
				lat: e.zone.CentroidLatitude,
				lng: e.zone.CentroidLongitude,
				color: MAP_TAB_COLOR[MapTab.EMPLOYEES],
				title: e.user.name,
				subtitle: e.address,
			}));

		const officeMarkers: ITabMapMarker[] =
			offices
				.filter((zone) => zone?.CentroidLatitude && zone?.CentroidLongitude)
				.map((zone) => ({
					id: zone.id,
					lat: zone.CentroidLatitude,
					lng: zone.CentroidLongitude,
					color: MAP_TAB_COLOR[MapTab.OFFICE],
					title: zone.Name,
					subtitle: zone.Name,
				})) || [];

		const wharehouseMarkers: ITabMapMarker[] =
			wharehouses
				.filter((zone) => zone?.CentroidLatitude && zone?.CentroidLongitude)
				.map((zone) => ({
					id: zone.id,
					lat: zone.CentroidLatitude,
					lng: zone.CentroidLongitude,
					color: MAP_TAB_COLOR[MapTab.WHAREHOUSE],
					title: zone.Name,
					subtitle: zone.Name,
				})) || [];

		const vendorMarkers: ITabMapMarker[] =
			vendors
				.filter((zone) => zone?.CentroidLatitude && zone?.CentroidLongitude)
				.map((zone) => ({
					id: zone.id,
					lat: zone.CentroidLatitude,
					lng: zone.CentroidLongitude,
					color: MAP_TAB_COLOR[MapTab.VENDOR],
					title: zone.name,
					subtitle: zone.address,
				})) || [];

		return {
			projectMarkers,
			employeeMarkers,
			officeMarkers,
			wharehouseMarkers,
			vendorMarkers,
		};
	}, [jobSites, employees, offices, wharehouses, vendors]);
};

export const filterZones = ({
	mapData,
	inspectionForemans,
	zones,
	params,
	search,
}: {
	mapData: IGetMapZonesResponse | undefined;
	inspectionForemans: IQcInspectionForeman[];
	zones: IGetGeoTabZonesResponse["items"];
	params: IMapParams;
	search: string | null | undefined;
}) => {
	const officeZones = zones?.filter((z) => getZoneTypeId(z) === GEOTAB_ZONE_ID.OFFICE) ?? [];

	const storageUnitZones = zones?.filter((z) => getZoneTypeId(z) === GEOTAB_ZONE_ID.STORAGE_UNIT) ?? [];

	const vendors = mapData?.data?.vendors ?? [];

	const jobSites = filterJobSites({
		params,
		jobSites: mapData?.data?.jobSites ?? [],
		search: search,
	});

	const employees = filterEmployees({
		employees: mapData?.data?.employees ?? [],
		search: search,
		params: params,
		inspectionForemans: inspectionForemans,
	});

	const officeZonesFiltered = filteredOfficeZones({
		search,
		officeZones,
	})?.filter((item, index) => officeZones.findIndex((i) => i.Name === item.Name) === index);

	const storageUnitZonesFiltered = filteredStorageZones({
		search,
		storageUnitZones,
	})?.filter((item, index) => storageUnitZones.findIndex((i) => i.Name === item.Name) === index);

	return {
		officeZones: officeZonesFiltered,
		storageUnitZones: storageUnitZonesFiltered,
		vendors,
		jobSites,
		employees,
	};
};
