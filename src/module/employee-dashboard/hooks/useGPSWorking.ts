import { apiClient } from "@/lib/api";

import { IEmployeeGPSWorking } from "@/module/job/types";
import { IApiResponse } from "@/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { IGetGPSAfterHourUsageResponse } from "../types";

export const useEmployeeGPSWorking = () => {
	return useQuery({
		queryKey: ["employee-gps-working"],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<IEmployeeGPSWorking>>("/employee/gps-working");
			return data.data;
		},
	});
};

export const useEmployeeGPSOnline = () => {
	return useMutation({
		mutationKey: ["employee-gps-online"],
		mutationFn: async () => {
			const response = await apiClient.put(`/employee/gps-working/online`);
			return response.data;
		},
	});
};

export const useEmployeeGPSOffline = () => {
	return useMutation({
		mutationKey: ["employee-gps-offline"],
		mutationFn: async () => {
			const response = await apiClient.put(`/employee/gps-working/offline`);
			return response.data;
		},
	});
};

export const useGPSAfterHourUsage = ({ date }: { date: string }) => {
	return useQuery({
		queryKey: ["gps-after-hour-usage", date],
		queryFn: async () => {
			const { data } = await apiClient.get<IGetGPSAfterHourUsageResponse>(`/employee/gps-working/after-hour-usage`, {
				params: { date },
			});
			return data.data;
		},
	});
};

export const useAddGPSAfterHourUsageExplanation = () => {
	return useMutation({
		mutationKey: ["add-gps-after-hour-usage-explanation"],
		mutationFn: async (payload: { explanation: string; date: string }) => {
			const response = await apiClient.post(`/employee/gps-working/after-hour-usage-explanation`, payload);
			return response.data;
		},
	});
};
