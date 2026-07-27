import { IPaginatedApiResponse, IPaginatedQuery } from "@/types";
import { IBylddZone } from "../../weekly-schedule-management/types/schedule-configuration";

export type IGetGeoTabZonesFilter = IPaginatedQuery;

export type IGeoTabZone = {
	id: number;
	GeotabId: string;
	ActiveFrom: string;
	ActiveTo: string;
	CentroidLatitude: number;
	CentroidLongitude: number;
	Comment: string;
	Displayed: boolean;
	ExternalReference: string;
	MustIdentifyStops: boolean;
	Name: string;
	Points: string;
	ZoneTypeIds: string;
	Version: number;
	EntityStatus: number;
	RecordLastChangedUtc: string;
};

export type IGetGeoTabZonesResponse = IPaginatedApiResponse<IGeoTabZone>;
export type IGetBylddZonesResponse = IBylddZone[];

export type IGeoTabZoneType = {
	id: number;
	GeotabId: string;
	Comment: string | null;
	Name: string;
	EntityStatus: number;
	RecordLastChangedUtc: string;
};
