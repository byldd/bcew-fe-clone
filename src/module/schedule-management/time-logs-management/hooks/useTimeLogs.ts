import { apiClient } from "@/lib/api";
import { IApiResponse } from "@/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
	ITimeLogResponse,
	IGetTimeLogsFilter,
	IUpdatedJobAssignmentResponse,
	IUpdateJobAssignmentTimePayload,
} from "../types";
import { IDayTime } from "@/module/job/types";

export const useTimeLogs = (filters: IGetTimeLogsFilter) => {
	return useQuery({
		queryKey: ["timelogs", filters],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<ITimeLogResponse[]>>("/admin/timelogs", { params: filters });
			return data.data;
		},
	});
};

export const useUpdateJobAssignmentTime = () => {
	return useMutation({
		mutationKey: ["timelogs"],
		mutationFn: async ({ id, ...payload }: IUpdateJobAssignmentTimePayload) => {
			const response = await apiClient.put<{
				success: boolean;
				data: IUpdatedJobAssignmentResponse;
			}>(`/admin/timelogs/job-assignment/${id}`, {
				payload,
			});
			return response.data;
		},
	});
};

export const useUpdateTimelogDayTime = () => {
	return useMutation({
		mutationKey: ["daytime"],
		mutationFn: async (update: IDayTime) => {
			const response = await apiClient.post<{ data: IDayTime }>(`/admin/timelogs/daytime`, {
				update,
			});
			return response.data;
		},
	});
};
