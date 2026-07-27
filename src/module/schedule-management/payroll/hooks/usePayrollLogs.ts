import { apiClient } from "@/lib/api";
import { useMutation, useQuery } from "@tanstack/react-query";
import type {
	IAcknowledgePayRollChange,
	ICreatePayRollLog,
	IGetPayRollChangesFilter,
	IGetPayRollChangesResponse,
	IGetPayRollLogResponse,
	IGetPayRollLogsFilter,
	IGetPayRollWeekFilter,
	IGetPayRollWeeksResponse,
} from "../types/payroll";
import { IApiResponse } from "@/types";

export const useCreatePayrollLog = () => {
	return useMutation({
		mutationFn: async (data: ICreatePayRollLog) => {
			const response = await apiClient.post("/admin/payroll/logs", data);
			return response.data;
		},
	});
};

export const useGetPayrollLogs = (filter: IGetPayRollLogsFilter) => {
	return useQuery({
		queryKey: ["payroll-logs"],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<IGetPayRollLogResponse>>("/admin/payroll/logs", {
				params: filter,
			});
			return data.data;
		},
	});
};

export const useGetPayrollWeeks = (filter?: IGetPayRollWeekFilter) => {
	return useQuery({
		queryKey: ["payroll-weeks", filter],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<IGetPayRollWeeksResponse>>("/admin/payroll/weeks", {
				params: filter,
			});
			return data.data;
		},
	});
};

export const useGetPayRollChanges = (filter: IGetPayRollChangesFilter) => {
	return useQuery({
		queryKey: ["payroll-changes", filter],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<IGetPayRollChangesResponse>>("/admin/payroll/changes", {
				params: filter,
			});
			return data.data;
		},
	});
};

export const useAcknowledgePayrollChange = () => {
	return useMutation({
		mutationFn: async (data: IAcknowledgePayRollChange) => {
			const response = await apiClient.patch(`/admin/payroll/changes/acknowledge/${data.changeId}`, data);
			return response.data;
		},
	});
};
