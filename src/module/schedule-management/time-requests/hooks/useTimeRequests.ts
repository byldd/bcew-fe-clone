import { apiClient } from "@/lib/api";
import { useMutation, useQuery } from "@tanstack/react-query";
import { IApiResponse } from "@/types";
import { IEmployeeExtendedTime } from "@/module/job/types";
import { IMDTRCreateJobPayload } from "../../time-logs-management/types";
import { IFingerprintApproval, IMiddayStopRequest, ITimeRequestParamsFilters } from "../utils/types";
import { fingerprintApprovalStatus } from "../utils/enums";

/*-----------------------------------ETR-------------------------------------*/

export const useTimeLogsExtendedTimes = (filters: ITimeRequestParamsFilters) => {
	return useQuery({
		queryKey: ["extended-time", filters],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<IEmployeeExtendedTime[]>>(
				"/admin/time-requests/extended-time",
				{
					params: filters,
				}
			);
			return data.data;
		},
	});
};

export const useAcceptTimeLogsExtendedTime = () => {
	return useMutation({
		mutationKey: ["extended-time-accept"],
		mutationFn: async (payload: { extendedTimeId: string; adminNote: string }) => {
			const response = await apiClient.post(
				`/admin/time-requests/extended-time/accept/${payload.extendedTimeId}`,
				payload
			);
			return response.data;
		},
	});
};

export const useDeclineTimeLogsExtendedTime = () => {
	return useMutation({
		mutationKey: ["extended-time-decline"],
		mutationFn: async (payload: { extendedTimeId: string; adminNote: string }) => {
			const response = await apiClient.post(
				`/admin/time-requests/extended-time/decline/${payload.extendedTimeId}`,
				payload
			);
			return response.data;
		},
	});
};

/*-----------------------------------NEW JOB REQUESTS-------------------------------------*/

export const useMiddayStopRequests = (filters: ITimeRequestParamsFilters) => {
	return useQuery({
		queryKey: ["midday-stop-requests", filters],
		queryFn: async () => {
			const { data } = await apiClient.get("/admin/time-requests/midday-stop", {
				params: { filters },
			});
			return data.data;
		},
	});
};

export const useMDTRAddNewStop = () => {
	return useMutation({
		mutationFn: async (payload: IMDTRCreateJobPayload) => {
			const { data } = await apiClient.post("/admin/time-requests/midday-stop/schedule-job", payload);
			return data.data;
		},
	});
};

export const useMDTRequestDecline = () => {
	return useMutation({
		mutationFn: async (payload: { id: string; adminNote: string }) => {
			const { data } = await apiClient.post(`/admin/time-requests/midday-stop/decline/${payload.id}`, payload);
			return data.data;
		},
	});
};

export const useGetMDTRequestById = (id: string) => {
	return useQuery({
		queryKey: ["midday-stop-request", id],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<IMiddayStopRequest>>(`/admin/time-requests/midday-stop/${id}`);
			return data.data;
		},
	});
};

export const useFingerprintApprovalRequests = (filters?: {
	status?: string;
	search?: string;
	startDate?: string;
	endDate?: string;
}) => {
	return useQuery({
		queryKey: ["fingerprint-approval-requests", filters],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<IFingerprintApproval[]>>("/admin/time-correction-requests/", {
				params: {
					...(filters?.status ? { status: filters.status } : {}),
					...(filters?.search ? { search: filters.search } : {}),
					...(filters?.startDate ? { startDate: filters.startDate } : {}),
					...(filters?.endDate ? { endDate: filters.endDate } : {}),
				},
			});
			return data.data;
		},
	});
};

export const useUpdateFingerprintStatus = () => {
	return useMutation({
		mutationFn: async (payload: {
			id: string;
			status: fingerprintApprovalStatus;
			startTime?: string;
			endTime?: string;
		}) => {
			const { data } = await apiClient.patch(`/admin/time-correction-requests/${payload.id}/status`, {
				status: payload.status,
				startTime: payload.startTime,
				endTime: payload.endTime,
			});
			return data.data;
		},
	});
};
