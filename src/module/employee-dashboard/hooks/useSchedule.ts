import { apiClient } from "@/lib/api";
import { IApiResponse } from "@/types";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

export const useGetScheduledates = (date: string, isEmployee: boolean) => {
	const url = isEmployee ? `/employee/schedule/dates` : `/sub-contractor/weekly-schedule/dates`;
	return useQuery({
		queryKey: ["employee-schedules-dates", date],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<string[]>>(url, { params: { date } });
			return data.data;
		},
		placeholderData: keepPreviousData,
	});
};
