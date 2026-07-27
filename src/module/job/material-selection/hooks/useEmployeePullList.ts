import { apiClient } from "@/lib/api";
import { useMutation, useQuery } from "@tanstack/react-query";
import { IApiResponse } from "@/types";
import {
	AdditionalMaterialResponseItem,
	CreateMissingItemRequestPayload,
	CreateMissingItemRequestResponse,
	EmployeePullListResponse,
	MaterialSelectionSubmitPayload,
	MaterialSelectionSubmitResponse,
} from "../utils/types";
import { IScheduleEmployee } from "../../types";
import { JobMaterialStatusResponse } from "@/module/job-level-details/utils/types";

export const useEmployeePullList = ({ assignmentId }: { assignmentId?: string | null }) => {
	return useQuery({
		queryKey: ["employee-pull-list", assignmentId],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<EmployeePullListResponse>>(
				"/employee/material-selection/pull-list",
				{
					params: { assignmentId },
				}
			);

			return data.data;
		},
		enabled: Boolean(assignmentId),
		retry: false,
	});
};

export const useCreateMaterialSelectionRequest = () => {
	return useMutation({
		mutationKey: ["material-selection-request"],
		mutationFn: async (payload: MaterialSelectionSubmitPayload) => {
			const { data } = await apiClient.post<IApiResponse<MaterialSelectionSubmitResponse>>(
				"/employee/material-selection/request",
				payload
			);
			return data.data;
		},
	});
};

export const useCreateMissingItemRequest = () => {
	return useMutation({
		mutationKey: ["create-missing-item-request"],
		mutationFn: async (payload: CreateMissingItemRequestPayload) => {
			const { data } = await apiClient.post<IApiResponse<CreateMissingItemRequestResponse>>(
				"/employee/material-selection/missing-item-requests",
				payload
			);
			return data.data;
		},
	});
};

export const useMaterialSelectionEmployees = ({ enabled }: { enabled: boolean }) => {
	return useQuery({
		queryKey: ["material-selection-employees"],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<IScheduleEmployee[]>>("/employee/dailyjob/employees");
			return data.data;
		},
		enabled,
	});
};

export const useEmployeeMaterialStatus = ({ assignmentId }: { assignmentId?: string | null }) => {
	return useQuery({
		queryKey: ["employee-material-status", assignmentId],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<JobMaterialStatusResponse>>(
				"/employee/material-selection/material-status",
				{
					params: { assignmentId },
				}
			);

			return data.data;
		},
		enabled: Boolean(assignmentId),
		retry: false,
	});
};

export const useEmployeeAdditionalMaterials = ({ assignmentId }: { assignmentId?: string | null }) => {
	return useQuery({
		queryKey: ["employee-additional-materials", assignmentId],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<AdditionalMaterialResponseItem[]>>(
				"/employee/material-selection/additional-material",
				{
					params: { assignmentId },
				}
			);

			return data.data;
		},
		enabled: Boolean(assignmentId),
		retry: false,
	});
};
