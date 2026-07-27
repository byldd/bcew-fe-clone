import { apiClient } from "@/lib/api";
import {
	IEmployeeDayTime,
	IGetWeekScheduleFilter,
	IWeekScheduleResponse,
} from "@/module/schedule-management/weekly-schedule-management/types/schedule-interface";
import { IApiResponse } from "@/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { IEarlyClarification, IForemanCreateJobPayload, ILateClarification } from "../types";
import { endPointEmployeeDayTime } from "../constants";

export const useScheduleJobs = (filters: IGetWeekScheduleFilter, options?: { enabled?: boolean }) => {
	return useQuery({
		queryKey: ["week-schedule", filters],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<IWeekScheduleResponse>>("/foreman/schedule-jobs", {
				params: filters,
			});
			return data.data;
		},
		staleTime: 0,
		refetchOnWindowFocus: false,
		enabled: options?.enabled ?? true,
	});
};

export const useForemanAddNewJob = () => {
	return useMutation({
		mutationFn: async (payload: IForemanCreateJobPayload) => {
			const { data } = await apiClient.post("/foreman/schedule-job", payload);
			return data.data;
		},
	});
};

export const useEmployeeDayTime = (stableFilters: { startDate: string }) => {
	return useQuery({
		queryKey: ["employee-day-time-technician", stableFilters],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<IEmployeeDayTime>>(endPointEmployeeDayTime, {
				params: stableFilters,
			});
			return data.data;
		},
	});
};

export const useAttendanceReasonNotification = (id?: string) => {
	return useMutation({
		mutationFn: async (payload: { late?: ILateClarification; early?: IEarlyClarification }) => {
			if (!id) {
				return Promise.reject(new Error("EmployeeDayTime id is required"));
			}

			const { data } = await apiClient.post(`/employee/lateness/reason/${id}`, payload);

			return data;
		},
	});
};
