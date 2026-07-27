import { apiClient } from "@/lib/api";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
	IFingerprintActionRequestPayload,
	IFingerprintApprovalStatus,
} from "@/module/schedule-management/time-requests/utils/types";
import { IApiResponse } from "@/types";

export const useFingerprintActionRequest = () => {
	return useMutation({
		mutationKey: ["fingerprint-action-request"],
		mutationFn: async (payload: IFingerprintActionRequestPayload) => {
			const response = await apiClient.post(`/employee/time-correction-requests/`, payload);
			return response.data;
		},
	});
};

export const useFingerprintLeave = () => {
	return useMutation({
		mutationKey: ["fingerprint-leave"],
		mutationFn: async (payload: { date: string }) => {
			const { data } = await apiClient.patch(`/employee/time-correction-requests/update-roster`, {
				date: payload.date,
			});
			return data;
		},
	});
};

export const useGetFingerprintApprovalStatus = ({ date }: { date: string }) => {
	return useQuery({
		queryKey: ["fingerprint-approval-status", date],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<IFingerprintApprovalStatus>>(
				"/employee/time-correction-requests/approval-status",
				{
					params: { date },
				}
			);
			if (!data.data?.id) return null;
			return data.data;
		},
		enabled: !!date,
	});
};
