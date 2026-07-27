import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { IApiResponse } from "@/types";
import { IGetTimeVarianceFilters, ITimeVarianceResponse } from "../utils/types";

export const useTimeVariance = (filters: IGetTimeVarianceFilters) => {
	return useQuery({
		queryKey: ["time-variance", filters],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<ITimeVarianceResponse[]>>("/admin/timelogs/time-variance", {
				params: filters,
			});
			return data.data;
		},
		staleTime: 0,
		refetchOnWindowFocus: false,
	});
};
