import { apiClient } from "@/lib/api";
import { IApiResponse } from "@/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { IGetTravelPayRequestsFilters, ITravelPayRequestResponse, ITravelPayRequestsResponse } from "../types";

export const useGetTravelPayRequests = (filters: IGetTravelPayRequestsFilters) => {
	return useQuery({
		queryKey: ["travel-pay-requests", filters],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<ITravelPayRequestsResponse>>("/admin/travel-pay/request", {
				params: filters,
			});
			return data.data;
		},
	});
};

export const useGetTravelPayRequest = (id: string) => {
	return useQuery({
		queryKey: ["travel-pay-request", id],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<ITravelPayRequestResponse>>(`/admin/travel-pay/request/${id}`);
			return data.data;
		},
	});
};

export const useAddTravelPayStatus = () => {
	return useMutation({
		mutationFn: async ({
			travelPayRequestId,
			status,
			note,
		}: {
			travelPayRequestId: string;
			status: string;
			note?: string;
		}) => {
			const { data } = await apiClient.post(`/admin/travel-pay/request/${travelPayRequestId}/status`, { status, note });
			return data.data;
		},
	});
};

export const useDownloadTravelPay = () => {
	return useMutation({
		mutationFn: async ({ date }: { date: string }) => {
			const response = await apiClient.post(
				`/admin/travel-pay/request/pdf`,
				{
					date,
				},
				{
					responseType: "blob",
				}
			);
			return response;
		},
	});
};
