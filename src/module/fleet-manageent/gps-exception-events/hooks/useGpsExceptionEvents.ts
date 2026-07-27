import { apiClient } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { IGetGpsExceptionEvents, IGetGpsExceptionEventsResponse } from "../types/gps-exception-event";

export const useGpsExceptionEvents = (filters: IGetGpsExceptionEvents) => {
	return useQuery({
		queryKey: ["gps-exception-events", filters],
		queryFn: async () => {
			const { data } = await apiClient.get<IGetGpsExceptionEventsResponse>(`/admin/gps/exception-events`, {
				params: filters,
			});
			return data?.data;
		},
	});
};
