import { apiClient } from "@/lib/api";
import { IApiResponse } from "@/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { IMapZoneTab } from "../types/zone";
import { ITabFormSchema } from "../utils/tab-schema";

export const useGetMapZoneTabs = () => {
	return useQuery({
		queryKey: ["map-zone-tabs"],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<IMapZoneTab[]>>("/admin/zone/tabs");
			return data.data;
		},
	});
};

// Tabs visible to the current user's role, for the Project Map tab bar - unlike
// useGetMapZoneTabs (unfiltered, used by tab management + the role-permission form).
export const useGetAccessibleMapZoneTabs = () => {
	return useQuery({
		queryKey: ["map-zone-tabs-accessible"],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<IMapZoneTab[]>>("/admin/zone/tabs/accessible");
			return data.data;
		},
	});
};

// Payload is the full tab form state (name + every type row) - the backend reconciles
// create/rename/move/delete for the types in one call, see docs/project-map.md.
export const useCreateMapZoneTab = () => {
	return useMutation({
		mutationFn: async (payload: ITabFormSchema) => {
			const { data } = await apiClient.post<IApiResponse<IMapZoneTab>>("/admin/zone/tabs", payload);
			return data.data;
		},
	});
};

export const useUpdateMapZoneTab = () => {
	return useMutation({
		mutationFn: async ({ tabId, ...payload }: ITabFormSchema & { tabId: string }) => {
			const { data } = await apiClient.put<IApiResponse<IMapZoneTab>>(`/admin/zone/tabs/${tabId}`, payload);
			return data.data;
		},
	});
};

export const useDeleteMapZoneTab = () => {
	return useMutation({
		mutationFn: async (tabId: string) => {
			const { data } = await apiClient.delete<IApiResponse<IMapZoneTab>>(`/admin/zone/tabs/${tabId}`);
			return data.data;
		},
	});
};
