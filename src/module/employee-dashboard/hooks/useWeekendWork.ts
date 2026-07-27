import { apiClient } from "@/lib/api";
import { IApiResponse } from "@/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
	ICreateUserWeekendWorkFilters,
	IGetUserWeekendWorkResponse,
	IUpdateUserWeekendWorkPayload,
} from "../types/weekend-work";

export const useGetUserWeekendWork = (filters: ICreateUserWeekendWorkFilters) => {
	return useQuery({
		queryKey: ["user-weekend-works", filters],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<IGetUserWeekendWorkResponse>>("/employee/weekend-work", {
				params: filters,
			});
			return data.data;
		},
	});
};

export const useUpdateUserWeekendWork = () => {
	return useMutation({
		mutationFn: async (payload: IUpdateUserWeekendWorkPayload) => {
			const { data } = await apiClient.put("/employee/weekend-work", payload);
			return data.data;
		},
	});
};
