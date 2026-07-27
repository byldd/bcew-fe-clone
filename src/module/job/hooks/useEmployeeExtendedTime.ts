import { apiClient } from "@/lib/api";
import { IApiResponse } from "@/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { IEmployeeExtendedData, IEmployeeExtendedTime } from "../types";

interface IExtendedTimePayload {
	requestId: string | undefined | null;
	id: string | undefined | null;
	startTime: string | Date | undefined;
	endTime: string | Date | undefined;
	extendedReason: string | undefined;
	extendedType: string | undefined;
	date: string;
	note?: string | undefined;
	jobStartTime?: string | undefined;
	jobEndTime?: string | undefined;
	jobDailyRecordId?: string | null;
	stopName?: string | null;
	assignmentId?: string | null;
}

export const useUpdateExtendedTime = () => {
	return useMutation({
		mutationKey: ["employee-extended-time"],
		mutationFn: async (payload: IExtendedTimePayload) => {
			const response = await apiClient.post(`/employee/daytime/extended-time`, payload);
			return response.data;
		},
	});
};

export const useGetExtendedTimeById = (id: string) => {
	return useQuery({
		queryKey: ["extended-time", id],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<IEmployeeExtendedData>>(
				`/employee/daytime/extended-time/${id}`
			);
			return data.data;
		},
	});
};

export const useGetExtendedRequest = (startDate: string) => {
	return useQuery({
		queryKey: ["extended-request", startDate],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<IEmployeeExtendedTime>>(`/employee/daytime/extended-request`, {
				params: {
					startDate,
				},
			});
			return data.data;
		},
	});
};
