import { apiClient } from "@/lib/api";
import { IApiResponse, IPaginatedApiResponse } from "@/types";
import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import {
	ISubContractorAdminNotificationResponse,
	ISubContractorCrewNotificationResponse,
	ISubContractorNotificationFilters,
} from "../types/notification";
import { IPushSubscription } from "@/module/employee-notification/types/notification";
import { NOTIFICATION_TYPE } from "@/types/notification";

export const useSubContractorCrewNotification = (filters: Omit<ISubContractorNotificationFilters, "page">) => {
	return useInfiniteQuery({
		queryKey: ["sub-contractor-crew-notification-infinite", filters],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<IPaginatedApiResponse<ISubContractorCrewNotificationResponse>>>(
				"/sub-contractor/crew-leader/notification",
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

export const useSubContractorAdminNotification = (filters: Omit<ISubContractorNotificationFilters, "page">) => {
	return useInfiniteQuery({
		queryKey: ["sub-contractor-admin-notification-infinite", filters],
		queryFn: async () => {
			const { data } = await apiClient.get<ISubContractorAdminNotificationResponse>("/sub-contractor/notification", {
				params: {
					...filters,
				},
			});
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

export const useUpdateSubContractorNotification = () => {
	return useMutation({
		mutationFn: async ({ id, payload }: { id: string; payload: { isRead: boolean } }) => {
			const { data } = await apiClient.put(`/sub-contractor/notification/${id}/read`, payload);
			return data.data;
		},
	});
};

export const useUpdateSubContractorCrewNotification = () => {
	return useMutation({
		mutationFn: async ({ id, payload }: { id: string; payload: { isRead: boolean } }) => {
			const { data } = await apiClient.put(`/sub-contractor/crew-leader/notification/${id}/read`, payload);
			return data.data;
		},
	});
};

export const useSubContractorUnreadNotificationCount = (startDate: string, enabled?: boolean) => {
	return useQuery({
		queryKey: ["sub-contractor-unread-notification-count", startDate],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<number>>("/sub-contractor/notification/unread-count", {
				params: { startDate },
			});
			return data.data;
		},
		enabled: enabled ?? true,
	});
};

export const useSubContractorCrewLeaderUnreadNotificationCount = (startDate: string) => {
	return useQuery({
		queryKey: ["sub-contractor-crew-leader-unread-notification-count", startDate],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<number>>(
				"/sub-contractor/crew-leader/notification/unread-count",
				{
					params: { startDate },
				}
			);
			return data.data;
		},
	});
};

export const useMarkAllSubContractorAdminNotificationsRead = () => {
	return useMutation({
		mutationFn: async (payload?: { types?: NOTIFICATION_TYPE[]; type?: NOTIFICATION_TYPE; createdAt?: string }) => {
			const { data } = await apiClient.put("/sub-contractor/notification/read-all", payload);

			return data.data;
		},
	});
};

export const useMarkAllCrewNotificationsRead = () => {
	return useMutation({
		mutationFn: async () => {
			const { data } = await apiClient.put("/sub-contractor/crew-leader/notification/read-all");
			return data.data;
		},
	});
};

export const useSubCrewSubscribeToPushNotification = () => {
	return useMutation({
		mutationFn: async (subscription: IPushSubscription) => {
			const { data } = await apiClient.post("/sub-crew/notification/push/subscribe", subscription);
			return data.data;
		},
	});
};

export const useSubCrewUnsubscribeFromPushNotification = () => {
	return useMutation({
		mutationFn: async (subscription: Pick<IPushSubscription, "endpoint">) => {
			const { data } = await apiClient.post("/sub-crew/notification/push/unsubscribe", subscription);
			return data.data;
		},
	});
};
