import { apiClient } from "@/lib/api";
import { IForemanCreateJobPayload } from "@/module/employee-dashboard/types";
import { IApiResponse } from "@/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { IEmployeeSelfScheduleResponse } from "../types/self-schedule";
import { IDayRosterTime } from "@/module/employee/types";

export const useEmployeeSelfSchedule = () => {
	return useMutation({
		mutationFn: async (payload: IForemanCreateJobPayload[]) => {
			const { data } = await apiClient.post<IApiResponse<IEmployeeSelfScheduleResponse>>(
				"/employee/self-schedule",
				payload
			);
			return data.data;
		},
	});
};

export const useEmployeeRosters = (filter: { startDate: string; endDate: string }) => {
	return useQuery({
		queryKey: ["employee-rosters", filter],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<IDayRosterTime[]>>("/employee/roster", {
				params: filter,
			});
			return data.data;
		},
		enabled: !!filter.startDate && !!filter.endDate,
	});
};
