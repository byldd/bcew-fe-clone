import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import { IGetReleaseNotesFilter, ICreateReleaseNoteRequest, IGetReleaseNotesResponse } from "../types/release-note";
import { apiClient } from "@/lib/api";

export const useGetRealseNotes = (filters: IGetReleaseNotesFilter) => {
	return useQuery({
		queryKey: ["release-notes", filters],
		queryFn: async () => {
			const { data } = await apiClient.get<IGetReleaseNotesResponse>("/admin/release-note", {
				params: filters,
			});
			return data.data;
		},
	});
};

export const useGetReleaseNotesInfinite = (filters: Omit<IGetReleaseNotesFilter, "page">) => {
	return useInfiniteQuery({
		queryKey: ["release-notes-infinite", filters],
		queryFn: async ({ pageParam = 1 }) => {
			const { data } = await apiClient.get<IGetReleaseNotesResponse>("/admin/release-note", {
				params: { ...filters, page: pageParam },
			});
			return data.data;
		},
		initialPageParam: 1,
		getNextPageParam: (lastPage, allPages) => {
			const totalPages = Math.ceil((lastPage.total || 0) / (filters.pageSize || 10));
			const nextPage = allPages.length + 1;
			return nextPage <= totalPages ? nextPage : undefined;
		},
	});
};

export const useCreateReleaseNote = () => {
	return useMutation({
		mutationFn: async (data: ICreateReleaseNoteRequest) => {
			const respone = await apiClient.post("/admin/release-note", data);
			return respone.data;
		},
	});
};

export const useUpdateReleaseNote = () => {
	return useMutation({
		mutationFn: async ({ id, data }: { id: string; data: ICreateReleaseNoteRequest }) => {
			const respone = await apiClient.put(`/admin/release-note/${id}`, data);
			return respone.data;
		},
	});
};

export const useDeleteReleaseNote = () => {
	return useMutation({
		mutationFn: async (id: string) => {
			const response = await apiClient.delete(`/admin/release-note/${id}`);
			return response.data;
		},
	});
};
