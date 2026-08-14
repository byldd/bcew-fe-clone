import { apiClient } from "@/lib/api";
import { useMutation, useQuery } from "@tanstack/react-query";
import { IApiResponse, IPaginatedApiResponse } from "@/types";
import {
	CreateMissingItemRequestResponse,
	CreateSubContractorMissingItemRequestPayload,
	EmployeePullListResponse,
	MaterialSelectionSubmitResponse,
	MissingItemRequestsListResponse,
	SubContractorMaterialSelectionSubmitPayload,
} from "../utils/types";

export const useSubContractorPullList = ({ jobDailyRecordId }: { jobDailyRecordId?: string | null }) => {
	return useQuery({
		queryKey: ["subcontractor-pull-list", jobDailyRecordId],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<EmployeePullListResponse>>(
				"/sub-contractor/material-selection/pull-list",
				{ params: { jobDailyRecordId } }
			);
			return data.data;
		},
		enabled: Boolean(jobDailyRecordId),
	});
};

export const useCreateSubContractorMaterialSelectionRequest = () => {
	return useMutation({
		mutationKey: ["subcontractor-material-selection-request"],
		mutationFn: async (payload: SubContractorMaterialSelectionSubmitPayload) => {
			const { data } = await apiClient.post<IApiResponse<MaterialSelectionSubmitResponse>>(
				"/sub-contractor/material-selection/request",
				payload
			);
			return data.data;
		},
	});
};

export const useSubContractorMissingItemRequests = (params: { page: number; pageSize: number }) => {
	return useQuery({
		queryKey: ["subcontractor-missing-item-requests", params],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<IPaginatedApiResponse<MissingItemRequestsListResponse>>>(
				"/sub-contractor/material-selection/missing-item-requests",
				{ params }
			);
			return data.data;
		},
		placeholderData: (previous) => previous,
	});
};

export const useCreateSubContractorMissingItemRequest = ({
	isSubContractorAdmin,
}: {
	isSubContractorAdmin: boolean;
}) => {
	const url = isSubContractorAdmin
		? "/sub-contractor/material-selection/missing-item-requests"
		: "/sub-crew/material-selection/missing-item-requests";
	return useMutation({
		mutationKey: ["create-subcontractor-missing-item-request"],
		mutationFn: async (payload: CreateSubContractorMissingItemRequestPayload) => {
			const { data } = await apiClient.post<IApiResponse<CreateMissingItemRequestResponse>>(url, payload);
			return data.data;
		},
	});
};

// export { SubContractorMaterialSelectionSubmitPayload };
