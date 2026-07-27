import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { IApiResponse, IPaginatedApiResponse } from "@/types";
import {
	ICrateReceiveEventResult,
	ICreateReceiveEventPayload,
	ICrateConfirmationDetails,
	IRecentCrateScan,
	IRecentCrateScansFilters,
} from "../types";

export const useCreateCrateReceiveEvent = () => {
	return useMutation({
		mutationKey: ["create-crate-receive-event"],
		mutationFn: async (payload: ICreateReceiveEventPayload) => {
			const { data } = await apiClient.post<IApiResponse<ICrateReceiveEventResult>>("/employee/crate/scan", payload);
			return data.data;
		},
	});
};

export const useResolveCrateForConfirmation = () => {
	return useMutation({
		mutationKey: ["resolve-crate-for-confirmation"],
		mutationFn: async (assetId: string) => {
			const { data } = await apiClient.get<IApiResponse<ICrateConfirmationDetails>>(
				`/employee/crate/${assetId}/details`
			);
			return data.data;
		},
	});
};

export const useRecentCrateScansInfinite = (filters: Omit<IRecentCrateScansFilters, "page"> = {}) => {
	return useInfiniteQuery({
		queryKey: ["recent-crate-scans-infinite", filters],
		queryFn: async ({ pageParam }) => {
			const { data } = await apiClient.get<IApiResponse<IPaginatedApiResponse<IRecentCrateScan>>>(
				"/employee/crate/scan/history",
				{ params: { ...filters, page: pageParam } }
			);
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
