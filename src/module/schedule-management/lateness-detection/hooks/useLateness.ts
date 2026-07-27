import { apiClient } from "@/lib/api";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
	ICreateEarlyReleaseEntryPayload,
	ICreateLateEntryPayload,
	IEmployeeWithTodayEntryResponse,
	ILateEmployeesAPIResponse,
	LATENESS_FILTER_TAB,
} from "../types";
import { IDayTime } from "@/module/job/types";

export const useLateEmployees = (query: { date?: string; type?: LATENESS_FILTER_TAB }) => {
	return useQuery<ILateEmployeesAPIResponse>({
		queryKey: ["late-employees", query],
		queryFn: async () => {
			const endpoint =
				query.type === LATENESS_FILTER_TAB.HANDLED ? "/admin/late-employees/handled" : "/admin/late-employees";

			const { data } = await apiClient.get<{
				data: ILateEmployeesAPIResponse;
			}>(endpoint, {
				params: {
					date: query.date,
				},
			});

			return data.data;
		},
	});
};

export const useEmployeesWithDayTime = (query: { date?: string }) => {
	return useQuery<IEmployeeWithTodayEntryResponse>({
		queryKey: ["employee-with-day-time", query],
		queryFn: async () => {
			const { data } = await apiClient.get<{ data: IEmployeeWithTodayEntryResponse }>(
				"/admin/late-employees/employees-with-today-day-time",
				{
					params: query,
				}
			);
			return data.data;
		},
	});
};

export const useCreateLateEntry = () => {
	return useMutation({
		mutationKey: ["createLateEntry"],
		mutationFn: async (payload: ICreateLateEntryPayload) => {
			const { data } = await apiClient.post("/admin/late-employees/late-entry", payload);
			return data;
		},
	});
};

export const useCreateEarlyReleaseEntry = () => {
	return useMutation({
		mutationKey: ["createEarlyReleaseEntry"],
		mutationFn: async (payload: ICreateEarlyReleaseEntryPayload) => {
			const { data } = await apiClient.post("/admin/late-employees/early-entry", payload);
			return data;
		},
	});
};

export const useUpdateLatenessDayTime = (id?: string) => {
	return useMutation({
		mutationKey: ["editLatenessDayTime", id],
		mutationFn: async (update: IDayTime) => {
			if (!id) {
				throw new Error("DayTime id is required to update lateness");
			}

			const response = await apiClient.post<{ data: IDayTime }>(`/admin/late-employees/day-time/${id}`, { update });

			return response.data;
		},
	});
};
