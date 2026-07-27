import { apiClient } from "@/lib/api";
import { IApiResponse, IPaginatedApiResponse } from "@/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
	ICreateMapZonePayload,
	IEmployeePickerOption,
	IGetMapZone,
	IGetMapZoneFilter,
	IProjectPickerOption,
} from "../types/zone";

export const useGetMapZones = (filter: IGetMapZoneFilter) => {
	return useQuery({
		queryKey: ["map-zones", filter],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<IPaginatedApiResponse<IGetMapZone>>>("/admin/zone/zones", {
				params: filter,
			});
			return data.data;
		},
	});
};

export const useGetMapZone = (zoneId: string | null) => {
	return useQuery({
		queryKey: ["map-zone", zoneId],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<IGetMapZone>>(`/admin/zone/zones/${zoneId}`);
			return data.data;
		},
		enabled: Boolean(zoneId),
	});
};

export const useCreateMapZone = () => {
	return useMutation({
		mutationFn: async (payload: ICreateMapZonePayload) => {
			const { data } = await apiClient.post<IApiResponse<IGetMapZone>>("/admin/zone/zones", payload);
			return data.data;
		},
	});
};

export const useUpdateMapZone = () => {
	return useMutation({
		mutationFn: async ({ zoneId, payload }: { zoneId: string; payload: ICreateMapZonePayload }) => {
			const { data } = await apiClient.put<IApiResponse<IGetMapZone>>(`/admin/zone/zones/${zoneId}`, payload);
			return data.data;
		},
	});
};

export const useDeleteMapZone = () => {
	return useMutation({
		mutationFn: async (zoneId: string) => {
			const { data } = await apiClient.delete<IApiResponse<IGetMapZone>>(`/admin/zone/zones/${zoneId}`);
			return data.data;
		},
	});
};

export const useGetEmployeePicker = (searchValue: string) => {
	return useQuery({
		queryKey: ["map-zone-employee-picker", searchValue],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<IEmployeePickerOption[]>>("/admin/zone/zones/employees", {
				params: { searchValue },
			});
			return data.data;
		},
	});
};

export const useGetProjectPicker = (searchValue: string) => {
	return useQuery({
		queryKey: ["map-zone-project-picker", searchValue],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<IProjectPickerOption[]>>("/admin/zone/zones/projects", {
				params: { searchValue },
			});
			return data.data;
		},
	});
};

export const useGeocodeAddressPreview = () => {
	return useMutation({
		mutationFn: async (payload: {
			address: string;
			city?: string;
			state?: string;
			zipcode?: string;
			country?: string;
		}) => {
			const { data } = await apiClient.post<IApiResponse<{ lat: number; lng: number }>>(
				"/admin/zone/zones/geocode",
				payload
			);
			return data.data;
		},
	});
};
