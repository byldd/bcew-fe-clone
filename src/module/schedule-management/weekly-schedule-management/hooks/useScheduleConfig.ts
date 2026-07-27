import { apiClient } from "@/lib/api";
import { IApiResponse, ROLES } from "@/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
	IGetSpecialJobsResponse,
	IHolidayConfiguration,
	IScheduleConfiguration,
	IUpdateScheduleConfiguration,
	IUpdateScheduleDayTimeConfiguration,
} from "../types/schedule-configuration";
import { UserType } from "@/module/profile/types";

export const useScheduleConfiguration = () => {
	return useQuery({
		queryKey: ["schedule-configuration"],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<IScheduleConfiguration>>("/admin/schedule/configuration");
			return data.data;
		},
	});
};

export const useUpdateScheduleConfiguration = () => {
	return useMutation({
		mutationFn: async ({ id, payload }: { id: string; payload: IUpdateScheduleConfiguration }) => {
			const { data } = await apiClient.put(`/admin/schedule/configuration/${id}`, payload);
			return data.data;
		},
	});
};

export const useUpdateScheduleDayTimeConfiguration = () => {
	return useMutation({
		mutationFn: async ({ id, payload }: { id: string; payload: IUpdateScheduleDayTimeConfiguration }) => {
			const { data } = await apiClient.put(`/admin/schedule/day-configuration/${id}`, payload);
			return data.data;
		},
	});
};

export const useGetSpecialJobs = () => {
	return useQuery({
		queryKey: ["special-jobs"],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<IGetSpecialJobsResponse>>("/admin/special-job");
			return data.data;
		},
	});
};

export const useHolidayConfiguration = (user?: UserType["data"]["user"] | null) => {
	return useQuery({
		queryKey: ["holiday-configuration"],
		queryFn: async () => {
			const apiRoute = user && user?.userType === ROLES.SUB_CONTRACTOR ? "/sub-contractor/holiday" : "/admin/holiday";
			const { data } = await apiClient.get<IApiResponse<IHolidayConfiguration[]>>(apiRoute);
			return data.data;
		},
	});
};

export const useCreateHolidayConfiguration = () => {
	return useMutation({
		mutationFn: async ({ payload }: { payload: IHolidayConfiguration }) => {
			const { data } = await apiClient.post(`/admin/holiday`, payload);
			return data.data;
		},
	});
};

export const useUpdateHolidayConfiguration = (id: string | undefined) => {
	return useMutation({
		mutationFn: async ({ payload }: { payload: IHolidayConfiguration }) => {
			const { data } = await apiClient.put(`/admin/holiday/${id}`, payload);
			return data.data;
		},
	});
};
export const useDeleteHolidayConfiguration = () => {
	return useMutation({
		mutationFn: async (id: string | undefined) => {
			const { data } = await apiClient.delete(`/admin/holiday/${id}`);
			return data.data;
		},
	});
};
