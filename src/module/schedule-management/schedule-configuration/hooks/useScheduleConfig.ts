import { apiClient } from "@/lib/api";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
	IGetWeekendWorksFilter,
	IGetWeekendWorksResponse,
	IUpdateSpecialJobsPayload,
	IUpdateUserWeekendWorkPayload,
	IUpdateWeekendConfigPayload,
} from "../types/schedule-config";
import { IApiResponse } from "@/types";
import { IGetBylddZonesResponse, IGetGeoTabZonesFilter, IGetGeoTabZonesResponse, IGeoTabZoneType } from "../types/zone";

export const useGetWeekendWorks = (filter: IGetWeekendWorksFilter) => {
	return useQuery({
		queryKey: ["weekend-works", filter],
		queryFn: async () => {
			const { data } = await apiClient.get<IGetWeekendWorksResponse>("/admin/schedule-config/weekend", {
				params: filter,
			});
			return data.data;
		},
	});
};

export const useUpdateWeekendWorks = () => {
	return useMutation({
		mutationFn: async (data: IUpdateWeekendConfigPayload) => {
			const response = await apiClient.post("/admin/schedule-config/weekend", data);
			return response.data;
		},
	});
};

export const useUpdateSpecialJobs = () => {
	return useMutation({
		mutationFn: async (data: IUpdateSpecialJobsPayload) => {
			const response = await apiClient.post("/admin/special-job", data);
			return response.data;
		},
	});
};

export const useGetZones = () => {
	return useQuery({
		queryKey: ["zones"],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<IGetBylddZonesResponse>>("/admin/zone");
			return data.data;
		},
	});
};

export const useGetGeoTabZones = (filter: IGetGeoTabZonesFilter) => {
	return useQuery({
		queryKey: ["geo-tab-zones", filter],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<IGetGeoTabZonesResponse>>("/admin/zone/geotab", {
				params: filter,
			});
			return data.data;
		},
	});
};

export const useGetGeoTabZoneTypes = () => {
	return useQuery({
		queryKey: ["geo-tab-zone-types"],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<IGeoTabZoneType[]>>("/admin/zone/geotab/types");
			return data.data;
		},
	});
};

export const useUpdateUserWeekendWorks = () => {
	return useMutation({
		mutationFn: async (data: IUpdateUserWeekendWorkPayload) => {
			const response = await apiClient.put("/admin/schedule-config/weekend-work/user", data);
			return response.data;
		},
	});
};

export const useDeleteUserWeekendWork = () => {
	return useMutation({
		mutationFn: async ({ userWeekendWorkId }: { userWeekendWorkId: string }) => {
			const response = await apiClient.delete(`/admin/schedule-config/weekend-work/user/${userWeekendWorkId}`);
			return response.data;
		},
	});
};
