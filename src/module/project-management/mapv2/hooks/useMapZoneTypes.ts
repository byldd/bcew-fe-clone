import { apiClient } from "@/lib/api";
import { IApiResponse } from "@/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { IMapZoneType } from "../types/zone";

export const useGetMapZoneTypes = (tabId?: string) => {
	return useQuery({
		queryKey: ["map-zone-types", tabId],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<IMapZoneType[]>>("/admin/zone/types", {
				params: { tabId },
			});
			return data.data;
		},
	});
};

export const useCreateMapZoneType = () => {
	return useMutation({
		mutationFn: async (payload: { name: string; mapZoneTabId: string; color?: string }) => {
			const { data } = await apiClient.post<IApiResponse<IMapZoneType>>("/admin/zone/types", payload);
			return data.data;
		},
	});
};

export const useUpdateMapZoneType = () => {
	return useMutation({
		mutationFn: async ({
			typeId,
			...payload
		}: {
			typeId: string;
			name?: string;
			mapZoneTabId?: string;
			color?: string;
		}) => {
			const { data } = await apiClient.put<IApiResponse<IMapZoneType>>(`/admin/zone/types/${typeId}`, payload);
			return data.data;
		},
	});
};

export const useDeleteMapZoneType = () => {
	return useMutation({
		mutationFn: async (typeId: string) => {
			const { data } = await apiClient.delete<IApiResponse<IMapZoneType>>(`/admin/zone/types/${typeId}`);
			return data.data;
		},
	});
};
