import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import {
	IEmployeeTravelPayEligibilityResponse,
	IEmployeeTravelPayPayload,
	IEmployeeTravelPayRequestsResponse,
	IGetEmployeeTravelPayFilter,
} from "../types";
import { IApiResponse } from "@/types";

export const useGetEmployeeTravelPayRequests = (filter: IGetEmployeeTravelPayFilter) => {
	return useQuery({
		queryKey: ["employee-travel-pay-requests", filter],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<IEmployeeTravelPayRequestsResponse>>(
				"/employee/travel-pay/request",
				{
					params: filter,
				}
			);
			return data.data;
		},
		refetchOnWindowFocus: false,
	});
};

export const useCheckTravelPayEligibility = (payload: IEmployeeTravelPayPayload) => {
	return useQuery({
		queryKey: ["travel-pay-eligibility", payload],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<IEmployeeTravelPayEligibilityResponse>>(
				"/employee/travel-pay/eligibility",
				{
					params: payload,
				}
			);
			return data.data;
		},
		refetchOnWindowFocus: false,
	});
};

export const useCreateEmployeeTravelPayRequests = () => {
	return useMutation({
		mutationKey: ["employee-travel-pay-requests"],
		mutationFn: async (payload: IEmployeeTravelPayPayload) => {
			const { data } = await apiClient.post<IApiResponse<IEmployeeTravelPayEligibilityResponse>>(
				"/employee/travel-pay/request",
				payload
			);
			return data.data;
		},
	});
};

export const useAddNoteToTravelPayRequest = () => {
	return useMutation({
		mutationKey: ["travel-pay-request-note"],
		mutationFn: async (data: { travelPayRequestId: string; note: string }) => {
			const { data: response } = await apiClient.post(`employee/travel-pay/request/${data.travelPayRequestId}/note`, {
				note: data.note,
			});
			return response.data;
		},
	});
};
