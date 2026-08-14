import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { IApiResponse, IPaginatedApiResponse } from "@/types";
import { MissingItemRequestsListResponse } from "@/module/job/material-selection/utils/types";
import type { AdminMissingItemRequestsFilters } from "@/module/material-management/missing-item-requests-admin/utils/types";

export type MyMissingItemRequestsFilters = Omit<
	AdminMissingItemRequestsFilters,
	"requestedByUserIds" | "sortBy" | "sortOrder"
> & { id?: string };

export const useMyMissingItemRequests = (params: MyMissingItemRequestsFilters) => {
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
