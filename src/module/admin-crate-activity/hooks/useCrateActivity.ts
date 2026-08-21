import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { IApiSuccessResponse, IPaginatedApiResponse } from "@/types";
import {
	IAdminCrateActivityDetails,
	IAdminCrateActivityEmployeeOption,
	IAdminCrateActivityFilters,
	IAdminCrateActivityItem,
	IAdminCrateActivityJobOption,
	IAdminCrateActivityProjectOption,
	IAdminCrateActivityReceiveDetails,
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

export const useAdminCrateActivityDetails = () => {
	return useQuery({
		queryKey: ["admin-crate-activity-details"],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiSuccessResponse<IAdminCrateActivityDetails>>(
				"/admin/crate-activity/details"
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

export const useAdminCrateActivityReceiveDetails = (scanAuditId: string, enabled: boolean) => {
	return useQuery({
		queryKey: ["admin-crate-activity-receive-details", scanAuditId],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiSuccessResponse<IAdminCrateActivityReceiveDetails>>(
				`/admin/crate-activity/${scanAuditId}/receive-details`
			);

			return data.data;
		},
		enabled,
	});
};

export const useAdminCrateActivityProjects = (searchValue: string) => {
	return useQuery({
		queryKey: ["admin-crate-activity-projects", searchValue],
		queryFn: async () => {
			const { data } = await apiClient.get<
				IApiSuccessResponse<IPaginatedApiResponse<IAdminCrateActivityProjectOption>>
			>("/admin/crate-activity/projects", {
				params: { searchValue, page: 1, pageSize: 20 },
			});

			return data.data;
		},
		placeholderData: (previous) => previous,
	});
};

export const useAdminCrateActivityJobs = (searchValue: string, projectNums: number[] = []) => {
	return useQuery({
		queryKey: ["admin-crate-activity-jobs", searchValue, projectNums],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiSuccessResponse<IPaginatedApiResponse<IAdminCrateActivityJobOption>>>(
				"/admin/crate-activity/jobs",
				{
					params: {
						searchValue,
						projectNums: projectNums.length ? projectNums.join("|") : undefined,
						page: 1,
						pageSize: 20,
					},
				}
			);

			return data.data;
		},
		placeholderData: (previous) => previous,
	});
};

export const useAdminCrateActivityEmployees = () => {
	return useQuery({
		queryKey: ["admin-crate-activity-employees"],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiSuccessResponse<IAdminCrateActivityEmployeeOption[]>>(
				"/admin/crate-activity/employees"
			);

			return data.data;
		},
	});
};
