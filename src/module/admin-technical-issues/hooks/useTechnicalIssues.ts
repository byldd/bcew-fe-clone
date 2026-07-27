import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { IApiSuccessResponse, IPaginatedApiResponse } from "@/types";
import { IAdminTechnicalIssueResponse, TakeActionPayload } from "../types";
import { IModulesResponse } from "@/module/employee/types";
import { IEditIssuePayload } from "@/module/employee-technical-issue/report-technical-bug/components/report-technical-issue";

export const useAdminTechnicalIssues = (params: {
	startDate?: string;
	endDate?: string;
	role?: string;
	status?: string;
	action?: string;
	page?: number;
	pageSize?: number;
	searchValue?: string;
	reporterId?: string;
}) => {
	return useQuery({
		queryKey: ["admin-technical-issues", params],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiSuccessResponse<IPaginatedApiResponse<IAdminTechnicalIssueResponse>>>(
				"/admin/app-bug",
				{ params: { ...params } }
			);

			return data.data;
		},
	});
};

export const useAdminTechnicalIssue = (issueId: string) => {
	return useQuery({
		queryKey: ["admin-technical-issues", issueId],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiSuccessResponse<IAdminTechnicalIssueResponse>>(
				`/admin/app-bug/reported/${issueId}`
			);

			return data.data;
		},
		enabled: !!issueId,
	});
};

export const useMergeableTechnicalIssues = (issueId: string) => {
	return useQuery({
		queryKey: ["mergeable-issues", issueId],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiSuccessResponse<{ id: string; ticketNumber: number }[]>>(
				`/admin/app-bug/technical-issues/${issueId}/mergeable`
			);

			return data.data;
		},
	});
};

export const useTakeTechnicalIssueAction = (issueId: string) => {
	return useMutation({
		mutationKey: ["take-action", issueId],
		mutationFn: async (payload: TakeActionPayload) => {
			const { data } = await apiClient.post(`/admin/app-bug/${issueId}/action`, payload);
			return data.data;
		},
	});
};

export const useAdminUpdateTechnicalIssue = () => {
	return useMutation({
		mutationKey: ["admin-update-technical-issue"],
		mutationFn: async ({ id, ...payload }: IEditIssuePayload & { id: string }) => {
			const { data } = await apiClient.patch<IApiSuccessResponse<IAdminTechnicalIssueResponse>>(
				`/admin/app-bug/${id}`,
				payload
			);
			return data.data;
		},
	});
};

export const useAppBugRoles = () => {
	return useQuery({
		queryKey: ["roles-app-bug"],
		queryFn: async () => {
			const { data } = await apiClient.get<{ data: IModulesResponse }>("/admin/app-bug/roles");
			return data.data?.items;
		},
	});
};
