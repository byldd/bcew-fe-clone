import { apiClient } from "@/lib/api";
import { IPage } from "@/module/admin/types/sideb-bar-page";
import { IApiResponse } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ICreatePagePayload, IGetPagesResponse, IUpdatePagePayload } from "../types/page";

export const useGetAppPages = () => {
	return useQuery({
		queryKey: ["app-pages"],
		queryFn: async () => {
			const { data } = await apiClient.get<IGetPagesResponse>("/admin/page");
			return data.data;
		},
	});
};

export const useCreatePage = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationKey: ["create-page"],
		mutationFn: async (payload: ICreatePagePayload) => {
			const { data } = await apiClient.post<IApiResponse<IPage>>("/admin/page", payload);
			return data.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["app-pages"] });
			queryClient.invalidateQueries({ queryKey: ["admin-sidebar-pages"] });
		},
	});
};

export const useUpdatePage = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationKey: ["update-page"],
		mutationFn: async ({ id, payload }: { id: string; payload: IUpdatePagePayload }) => {
			const { data } = await apiClient.patch<IApiResponse<IPage>>(`/admin/page/${id}`, payload);
			return data.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["app-pages"] });
			queryClient.invalidateQueries({ queryKey: ["admin-sidebar-pages"] });
		},
	});
};

export const useDeletePage = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationKey: ["delete-page"],
		mutationFn: async (id: string) => {
			await apiClient.delete(`/admin/page/${id}`);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["app-pages"] });
			queryClient.invalidateQueries({ queryKey: ["admin-sidebar-pages"] });
		},
	});
};
