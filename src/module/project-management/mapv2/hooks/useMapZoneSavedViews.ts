import { apiClient } from "@/lib/api";
import { IApiResponse } from "@/types";
import { FILTER_SAVED_VIEW_PAGE_KEY } from "@/utils/enums";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	ICreateMapZoneSavedViewPayload,
	IMapZoneSavedView,
	IMapZoneSavedViewsResponse,
	IUpdateMapZoneSavedViewPayload,
} from "../types/zone";

const MAP_ZONE_SAVED_VIEWS_QUERY_KEY = ["map-zone-saved-views"];

export const useMapZoneSavedViews = () => {
	return useQuery({
		queryKey: MAP_ZONE_SAVED_VIEWS_QUERY_KEY,
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<IMapZoneSavedViewsResponse>>("/admin/zone/views", {
				params: { pageKey: FILTER_SAVED_VIEW_PAGE_KEY.PROJECT_MAP },
			});
			return data.data;
		},
	});
};

export const useCreateMapZoneSavedView = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (payload: ICreateMapZoneSavedViewPayload) => {
			const { data } = await apiClient.post<IApiResponse<IMapZoneSavedView>>("/admin/zone/views", payload);
			return data.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: MAP_ZONE_SAVED_VIEWS_QUERY_KEY });
		},
	});
};

export const useUpdateMapZoneSavedView = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({ viewId, payload }: { viewId: string; payload: IUpdateMapZoneSavedViewPayload }) => {
			const { data } = await apiClient.patch<IApiResponse<IMapZoneSavedView>>(`/admin/zone/views/${viewId}`, payload);
			return data.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: MAP_ZONE_SAVED_VIEWS_QUERY_KEY });
		},
	});
};

export const useDeleteMapZoneSavedView = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (viewId: string) => {
			const { data } = await apiClient.delete<IApiResponse<IMapZoneSavedView>>(`/admin/zone/views/${viewId}`);
			return data.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: MAP_ZONE_SAVED_VIEWS_QUERY_KEY });
		},
	});
};
