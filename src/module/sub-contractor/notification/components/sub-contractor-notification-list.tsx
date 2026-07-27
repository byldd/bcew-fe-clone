"use client";
import React, { useEffect, useRef, useCallback } from "react";
import { Spinner } from "@/components/ui/spinner";
import NotificationCard from "@/components/shared/notification/notification-card";
import NotificationEmptyState from "@/components/shared/notification/notification-empty-state";
import { useNotificationParam } from "@/module/admin/notifications/hook/useNotificationParam";
import { toDate, toMidnightDateString } from "@/lib/utils/date";
import { useQueryClient } from "@tanstack/react-query";

import {
	useSubContractorAdminNotification,
	useUpdateSubContractorNotification,
} from "../hooks/useSubContractorNotification";

import { useHandleSubContractorNotification } from "../../hooks/useHandleSubContractorNotification";
import useAuthStore from "@/store/auth-store";
import { ISubContractorAdminNotificationResponse } from "../types/notification";
import { NOTIFICATION_VIEW } from "@/module/admin/notifications/types/type";

const SubContractorNotificationList = () => {
	const { getParams } = useNotificationParam();
	const { isRead, date, type, notificationTypes, view } = getParams();

	const observerTarget = useRef<HTMLDivElement>(null);
	const queryClient = useQueryClient();

	const { user } = useAuthStore((store) => store);

	const { mutateAsync: updateNotification } = useUpdateSubContractorNotification();

	const isDefaultView = view === NOTIFICATION_VIEW.DEFAULT_VIEW;
	const isAllView = view === NOTIFICATION_VIEW.ALL;

	const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useSubContractorAdminNotification({
		pageSize: 20,
		isRead: isRead ?? undefined,
		createdAt: date ? toMidnightDateString(toDate(date)) : undefined,
		type: type,
		types: notificationTypes,
	});

	const notifications =
		(data?.pages
			.map((page) => page.items || [])
			?.flat() as unknown as ISubContractorAdminNotificationResponse["data"]["items"][number]) || [];

	const { handleNotificationClick } = useHandleSubContractorNotification({
		isAdmin: !!user,
	});

	const handleMarkRead = useCallback(
		(id: string) => {
			updateNotification(
				{ id, payload: { isRead: true } },
				{
					onSuccess: () => {
						queryClient.invalidateQueries({ queryKey: ["sub-contractor-admin-notification-infinite"] });
						queryClient.invalidateQueries({ queryKey: ["sub-contractor-notifications-grouped"] });
						queryClient.invalidateQueries({ queryKey: ["sub-contractor-unread-notification-count"] });
					},
				}
			);
		},
		[updateNotification, queryClient]
	);

	// infinite scroll
	useEffect(() => {
		const currentTarget = observerTarget.current;
		if (!currentTarget) return;

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
					fetchNextPage();
				}
			},
			{ threshold: 0.1 }
		);

		observer.observe(currentTarget);
		return () => observer.unobserve(currentTarget);
	}, [hasNextPage, isFetchingNextPage, fetchNextPage]);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-10">
				<Spinner />
			</div>
		);
	}

	return (
		<div className="space-y-2 px-2 py-4">
			{notifications.length > 0 ? (
				<>
					{notifications.map((notification, index) => (
						<NotificationCard
							key={`${notification?.id}-${index}`}
							notification={{
								createdAt: notification.notification.createdAt,
								id: notification.id,
								isRead: notification.isRead,
								updatedAt: notification.notification.updatedAt,
								data: notification.notification.data,
								message: notification.notification.message,
								title: notification.notification.title,
								key: notification.notification.key,
							}}
							onClick={() => {
								handleNotificationClick({
									key: notification.notification.key,
									data: notification.notification.data,
								});

								if (!notification.isRead) {
									handleMarkRead(notification.id);
								}
							}}
							handleMarkRead={() => handleMarkRead(notification.id)}
						/>
					))}

					{/* Infinite scroll trigger */}
					<div ref={observerTarget} className="h-10 w-full">
						{isFetchingNextPage && (
							<div className="flex justify-center py-4">
								<Spinner />
							</div>
						)}
					</div>

					{!hasNextPage && (
						<div className="py-4 text-center text-sm text-brand-dark30">No more notifications to load</div>
					)}
				</>
			) : (
				<NotificationEmptyState />
			)}
		</div>
	);
};

export default SubContractorNotificationList;
