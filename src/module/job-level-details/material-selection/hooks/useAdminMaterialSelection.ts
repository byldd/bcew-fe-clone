import { apiClient } from "@/lib/api";
import { useMutation, useQuery } from "@tanstack/react-query";
import { IApiResponse } from "@/types";
import type {
	AdditionalMaterialResponseItem,
	EmployeePullListResponse,
	MaterialSelectionSubmitResponse,
} from "@/module/job/material-selection/utils/types";
import { IScheduleEmployee } from "@/module/job/types";
import { AdminMaterialSelectionSubmitPayload } from "../utils/types";

export const useAdminPullList = ({ jobDailyRecordId }: { jobDailyRecordId?: string | null }) => {
	return useQuery({
		queryKey: ["admin-material-pull-list", jobDailyRecordId],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<EmployeePullListResponse>>(
				"/admin/material-requests/pull-list",
				{
					params: { jobDailyRecordId },
				}
			);

			return data.data;
		},
		enabled: Boolean(jobDailyRecordId),
		retry: false,
	});
};

export const useAdminMaterialSelectionEmployees = () => {
	return useQuery({
		queryKey: ["admin-material-selection-employees"],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<IScheduleEmployee[]>>("/admin/material-requests/employees");
			return data.data;
		},
	});
};

export const useCreateAdminMaterialRequest = () => {
	return useMutation({
		mutationKey: ["admin-material-selection-request"],
		mutationFn: async (payload: AdminMaterialSelectionSubmitPayload) => {
			const { data } = await apiClient.post<IApiResponse<MaterialSelectionSubmitResponse>>(
				"/admin/material-requests/request",
				payload
			);
			return data.data;
		},
	});
};

export const useAdminAdditionalMaterials = ({ recnum, tsknum }: { recnum?: number | null; tsknum?: number | null }) => {
	return useQuery({
		queryKey: ["admin-additional-materials", recnum, tsknum],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<AdditionalMaterialResponseItem[]>>(
				"/admin/material-requests/additional-material",
				{
					params: { recnum, tsknum },
				}
			);

			return data.data;
		},
		enabled: Boolean(recnum) && Boolean(tsknum),
		retry: false,
	});
};
