import { apiClient } from "@/lib/api";
import { IApiResponse, IPaginatedApiResponse } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { IGetScheduleHistoryFilters, IScheduleHistory } from "../utils/schedule-history-type";

export const useGetScheduleHistory = (filters: IGetScheduleHistoryFilters) => {
	return useQuery({
		queryKey: ["schedule-history", filters],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<IPaginatedApiResponse<IScheduleHistory>>>(
				"/admin/schedule/history",
				{
					params: filters,
				}
			);
			return data.data;
		},
	});
};
