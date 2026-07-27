import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { IApiResponse, IPaginatedApiResponse } from "@/types";
import { MissingItemRequestsListResponse } from "@/module/job/material-selection/utils/types";

export const useMyMissingItemRequests = (params: { page: number; pageSize: number }) => {
	return useQuery({
		queryKey: ["my-missing-item-requests", params],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<IPaginatedApiResponse<MissingItemRequestsListResponse>>>(
				"/employee/material-selection/missing-item-requests",
				{ params }
			);
			return data.data;
		},
		placeholderData: (previous) => previous,
	});
};
