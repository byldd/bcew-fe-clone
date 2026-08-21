import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { IApiResponse, IPaginatedApiResponse } from "@/types";
import { CRATE_SCAN_ACTION } from "../enums";
import {
	ICrateScanHistoryCounts,
	ICrateScanSummary,
	ICreateReceiveEventPayload,
	ICrateConfirmationDetails,
	ICrateIssueReportSummary,
	IRecentCrateScan,
	IRecentCrateScansFilters,
	IReportCrateIssuePayload,
} from "../types";

export const useCreateCrateReceiveEvent = () => {
	return useMutation({
		mutationKey: ["create-crate-receive-event"],
		mutationFn: async (payload: ICreateReceiveEventPayload) => {
			const { data } = await apiClient.post<IApiResponse<ICrateScanSummary>>("/employee/crate/scan", payload);
			return data.data;
		},
	});
};

export const useCheckCrateScanStatus = () => {
	return useMutation({
		mutationKey: ["check-crate-scan-status"],
		mutationFn: async ({
			assetId,
			action,
			jobNum,
			taskNum,
		}: {
			assetId: string;
			action: CRATE_SCAN_ACTION;
			jobNum?: number;
			taskNum?: number;
		}) => {
			const { data } = await apiClient.get<IApiResponse<null>>(`/employee/crate/${assetId}/scan-status`, {
				params: { action, jobNum, taskNum },
			});
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

export const useReportCrateIssue = () => {
	return useMutation({
		mutationKey: ["report-crate-issue"],
		mutationFn: async (payload: IReportCrateIssuePayload) => {
			const { data } = await apiClient.post<IApiResponse<ICrateIssueReportSummary>>(
				"/employee/crate/report-issue",
				payload
			);
			return data.data;
		},
	});
};

export const useRecentCrateScansInfinite = (filters: Omit<IRecentCrateScansFilters, "page"> = {}) => {
	return useInfiniteQuery({
		queryKey: ["recent-crate-scans-infinite", filters],
		queryFn: async ({ pageParam }) => {
			const { data } = await apiClient.get<
				IApiResponse<IPaginatedApiResponse<IRecentCrateScan> & { counts: ICrateScanHistoryCounts }>
			>("/employee/crate/scan/history", { params: { ...filters, page: pageParam } });
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
