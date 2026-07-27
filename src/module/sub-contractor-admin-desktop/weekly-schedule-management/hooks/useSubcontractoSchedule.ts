import { apiClient } from "@/lib/api";
import {
	IGetWeekScheduleFilter,
	IWeekScheduleResponse,
} from "@/module/schedule-management/weekly-schedule-management/types/schedule-interface";
import { IApiResponse } from "@/types";
import { useQuery } from "@tanstack/react-query";

export const useSubContractorWeekSchedule = (filters: IGetWeekScheduleFilter) => {
	return useQuery({
		queryKey: ["sub-contractor-week-schedule", filters],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<IWeekScheduleResponse>>("/sub-contractor/weekly-schedule", {
				params: filters,
			});
			return data.data;
		},
		staleTime: 0,
		refetchOnWindowFocus: false,
	});
};
