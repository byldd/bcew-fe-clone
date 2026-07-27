import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { IApiResponse } from "@/types";
import { IEmployeeHistoryDay, IGetEmployeeHistoryFilter } from "../types";

export const useGetEmployeeHistory = (filters: IGetEmployeeHistoryFilter) => {
	return useQuery({
		queryKey: ["extended-history", filters],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<IEmployeeHistoryDay[]>>("/employee/history", {
				params: filters,
			});
			return data.data;
		},
	});
};
