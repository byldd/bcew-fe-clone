import { apiClient } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { IApiResponse } from "@/types";
import type { AdminMissingItemRequest, UpdateForemanNotePayload, UpdateForemanNoteResponse } from "../utils/types";

export const useAdminMissingItemRequests = (enabled: boolean = true) => {
	return useQuery({
		queryKey: ["admin-missing-item-requests"],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<AdminMissingItemRequest[]>>(
				"/foreman/material-management/missing-item-requests"
			);
			return data.data;
		},
		enabled,
	});
};

export const useUpdateMissingItemForemanNote = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ id, payload }: { id: string; payload: UpdateForemanNotePayload }) => {
			const { data } = await apiClient.patch<IApiResponse<UpdateForemanNoteResponse>>(
				`/foreman/material-management/missing-item-requests/${id}`,
				payload
			);
			return data.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin-missing-item-requests"] });
		},
	});
};
