import { apiClient } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { IApiResponse, IPaginatedApiResponse } from "@/types";
import type {
	AdminMissingItemRequest,
	AdminMissingItemRequestsFilters,
	MissingItemRequestEmployee,
	MissingItemRequestJobSite,
	RejectMissingItemPayload,
	UpdateForemanNotePayload,
	UpdateForemanNoteResponse,
} from "../utils/types";
import { IReccln } from "@/module/project-management/mapv2/types/zone";

export const useAdminMissingItemRequests = (
	filters: AdminMissingItemRequestsFilters = { page: 1, pageSize: 20 },
	enabled: boolean = true
) => {
	return useQuery({
		queryKey: ["admin-missing-item-requests", filters],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<IPaginatedApiResponse<AdminMissingItemRequest>>>(
				"/foreman/material-management/missing-item-requests",
				{ params: filters }
			);
			return data.data;
		},
		enabled,
		placeholderData: (previous) => previous,
	});
};

export const useMissingItemRequestEmployees = (enabled: boolean = true) => {
	return useQuery({
		queryKey: ["missing-item-request-employees"],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<MissingItemRequestEmployee[]>>(
				"/foreman/material-management/missing-item-requests/employees"
			);
			return data.data;
		},
		enabled,
	});
};

export const useMissingItemRequestJobs = (searchValue: string, projectNumbers: number[] = []) => {
	return useQuery({
		queryKey: ["missing-item-request-jobs", searchValue, projectNumbers],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<IPaginatedApiResponse<MissingItemRequestJobSite>>>(
				"/foreman/material-management/missing-item-requests/jobs",
				{ params: { searchValue, projectNumbers, page: 1, pageSize: 20 } }
			);
			return data.data;
		},
		placeholderData: (previous) => previous,
	});
};

export const useMissingItemRequestProjects = (searchValue: string) => {
	return useQuery({
		queryKey: ["missing-item-request-projects", searchValue],
		queryFn: async () => {
			const { data } = await apiClient.get<
				IApiResponse<IPaginatedApiResponse<Pick<IReccln, "recnum" | "clnnme" | "shtnme">>>
			>("/foreman/material-management/missing-item-requests/projects", {
				params: { searchValue, page: 1, pageSize: 20 },
			});
			return data.data;
		},
		placeholderData: (previous) => previous,
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

export const useRejectMissingItem = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ id, payload }: { id: string; payload: RejectMissingItemPayload }) => {
			const { data } = await apiClient.post(`/foreman/material-management/missing-item-requests/${id}/reject`, payload);
			return data.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin-missing-item-requests"] });
		},
	});
};
