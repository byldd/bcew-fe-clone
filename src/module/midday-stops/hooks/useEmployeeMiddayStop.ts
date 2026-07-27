import { apiClient } from "@/lib/api";
import { useMutation, useQuery } from "@tanstack/react-query";
import { IMiddayStopPayload } from "../utils/types";
import { IGetEmployeeScheduleFilter } from "@/module/job/types";
import { IMiddayStopRequest } from "@/module/schedule-management/time-requests/utils/types";
import { IApiResponse } from "@/types";

export const useUpdateMiddayStop = () => {
	return useMutation({
		mutationFn: async (payload: IMiddayStopPayload) => {
			const { data } = await apiClient.post("/employee/dailyjob/midday-stop", payload);
			return data.data;
		},
	});
};

export const useEmployeeMDTRequests = (filters: IGetEmployeeScheduleFilter) => {
	return useQuery({
		queryKey: ["employee-midday-stops", filters],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<IMiddayStopRequest[]>>(
				"/employee/schedule/midday-stops/requests",
				{
					params: filters,
				}
			);
			return data.data;
		},
	});
};

export const useDeleteMiddayStopRequest = () => {
	return useMutation({
		mutationFn: async (id: string) => {
			const { data } = await apiClient.delete(`/employee/dailyjob/midday-stop/${id}`);
			return data.data;
		},
	});
};
