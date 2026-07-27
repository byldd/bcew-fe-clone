import { apiClient } from "@/lib/api";
import { IApiResponse, IPaginatedApiResponse } from "@/types";
import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import { IEmployeeNotificationFilters, IEmployeeNotificationResponse, IPushSubscription } from "../types/notification";

export const useEmployeeNotification = (filters: IEmployeeNotificationFilters) => {
	return useQuery({
		queryKey: ["employee-notification", filters],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<IPaginatedApiResponse<IEmployeeNotificationResponse>>>(
				"/employee/notification",
				{
					params: filters,
				}
			);
			return data.data;
		},
	});
};

export const useEmployeeNotificationInfinite = (filters: Omit<IEmployeeNotificationFilters, "page">) => {
	return useInfiniteQuery({
		queryKey: ["employee-notification-infinite", filters],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<IPaginatedApiResponse<IEmployeeNotificationResponse>>>(
				"/employee/notification",
				{
					params: {
						...filters,
					},
				}
			);
			return data.data;
		},
		initialPageParam: 1,
		getNextPageParam: (lastPage, allPages) => {
			const totalPages = Math.ceil((lastPage.total || 0) / (filters.pageSize || 10));
			const nextPage = allPages.length + 1;
			return nextPage <= totalPages ? nextPage : undefined;
		},
	});
};

export const useUpdateEmployeeNotification = () => {
	return useMutation({
		mutationFn: async ({ id, payload }: { id: string; payload: { isRead: boolean } }) => {
			const { data } = await apiClient.put(`/employee/notification/${id}/read`, payload);
			return data.data;
		},
	});
};

export const useSubscribeToPushNotification = () => {
	return useMutation({
		mutationFn: async (subscription: IPushSubscription) => {
			const { data } = await apiClient.post("/user/push/subscribe", subscription);
			return data.data;
		},
	});
};

export const useUnsubscribeFromPushNotification = () => {
	return useMutation({
		mutationFn: async (subscription: Pick<IPushSubscription, "endpoint">) => {
			const { data } = await apiClient.post("/user/push/unsubscribe", subscription);
			return data.data;
		},
	});
};

export const useEmployeeUnreadNotificationCount = (startDate: string) => {
	return useQuery({
		queryKey: ["employee-unread-notification-count", startDate],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<number>>("/employee/notification/unread-count", {
				params: { startDate },
			});
			return data.data;
		},
	});
};

export const useMarkAllEmployeeNotificationsRead = () => {
	return useMutation({
		mutationFn: async () => {
			const { data } = await apiClient.put("/employee/notification/read-all");
			return data.data;
		},
	});
};
