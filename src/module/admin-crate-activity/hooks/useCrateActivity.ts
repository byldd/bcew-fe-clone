import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { IApiSuccessResponse, IPaginatedApiResponse } from "@/types";
import {
	IAdminCrateActivityDetails,
	IAdminCrateActivityFilterOptions,
	IAdminCrateActivityFilters,
	IAdminCrateActivityItem,
	IMarkCrateReturnedPayload,
	IMarkCrateReturnedResponse,
} from "../types";

export const useAdminCrateActivity = (params: IAdminCrateActivityFilters) => {
	return useQuery({
		queryKey: ["admin-crate-activity", params],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiSuccessResponse<IPaginatedApiResponse<IAdminCrateActivityItem>>>(
				"/admin/crate-activity",
				{
					params: {
						...params,
						jobNums: params.jobNums?.length ? params.jobNums.join("|") : undefined,
						projectNums: params.projectNums?.length ? params.projectNums.join("|") : undefined,
						status: params.status?.length ? params.status.join("|") : undefined,
						technicianIds: params.technicianIds?.length ? params.technicianIds.join("|") : undefined,
					},
				}
			);

			return data.data;
		},
	});
};

export const useAdminCrateActivityDetails = (
	params: Pick<IAdminCrateActivityFilters, "jobNums" | "projectNums" | "technicianIds" | "startDate" | "endDate">
) => {
	return useQuery({
		queryKey: ["admin-crate-activity-details", params],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiSuccessResponse<IAdminCrateActivityDetails>>(
				"/admin/crate-activity/details",
				{
					params: {
						...params,
						jobNums: params.jobNums?.length ? params.jobNums.join("|") : undefined,
						projectNums: params.projectNums?.length ? params.projectNums.join("|") : undefined,
						technicianIds: params.technicianIds?.length ? params.technicianIds.join("|") : undefined,
					},
				}
			);

			return data.data;
		},
	});
};

export const useMarkCrateReturned = (scanAuditId: string) => {
	return useMutation({
		mutationKey: ["admin-crate-activity-mark-returned", scanAuditId],
		mutationFn: async (payload: IMarkCrateReturnedPayload) => {
			const { data } = await apiClient.post<IApiSuccessResponse<IMarkCrateReturnedResponse>>(
				`/admin/crate-activity/${scanAuditId}/return`,
				payload
			);

			return data.data;
		},
	});
};

export const useAdminCrateActivityFilterOptions = () => {
	return useQuery({
		queryKey: ["admin-crate-activity-filter-options"],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiSuccessResponse<IAdminCrateActivityFilterOptions>>(
				"/admin/crate-activity/filter-options"
			);

			return data.data;
		},
	});
};
