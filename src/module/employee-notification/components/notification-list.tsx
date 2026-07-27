"use client";
import React, { useCallback, useEffect, useRef } from "react";
import { Spinner } from "@/components/ui/spinner";
import { useEmployeeNotificationInfinite, useUpdateEmployeeNotification } from "../hooks/useEmployeeNotification";
import { useNotificationParam } from "@/module/admin/notifications/hook/useNotificationParam";
import { toDate, toMidnightDateString } from "@/lib/utils/date";
import NotificationEmptyState from "@/components/shared/notification/notification-empty-state";
import NotificationCard from "@/components/shared/notification/notification-card";
import { useQueryClient } from "@tanstack/react-query";
import { useHandleEmployeeNotification } from "../hooks/useHandleEmployeeNitification";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
import { useModal } from "@/hooks/useModal";

const NotificationList = () => {
	const { getParams } = useNotificationParam();
	const { isRead, date } = getParams();
	const observerTarget = useRef<HTMLDivElement>(null);
	const { openModal, closeModal, Modal } = useModal();

	const tschedule = useTypedTranslations(NAMESPACE.SCHEDULE);

	const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useEmployeeNotificationInfinite({
		pageSize: 20,
		isRead: isRead ?? undefined,
		createdAt: date ? toMidnightDateString(toDate(date)) : undefined,
	});

	const notifications = data?.pages.flatMap((page) => page.items || []) || [];

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

		return () => {
			observer.unobserve(currentTarget);
		};
	}, [hasNextPage, isFetchingNextPage, fetchNextPage]);

	const queryClient = useQueryClient();
	const { mutate: updateNotification } = useUpdateEmployeeNotification();
	const { handleNotificationClick } = useHandleEmployeeNotification({ openModal, closeModal });

	const handleMarkRead = useCallback(
		(id: string) => {
			updateNotification(
				{ id, payload: { isRead: true } },
				{
					onSuccess: () => {
						queryClient.invalidateQueries({ queryKey: ["employee-notification"] });
						queryClient.invalidateQueries({ queryKey: ["employee-notification-infinite"] });
					},
				}
			);
		},
		[updateNotification, queryClient]
	);

	if (isLoading) {
		return (
			<div className="flex min-h-full items-center justify-center">
				<Spinner />
			</div>
		);
	}

	return (
		<div className="space-y-4 px-2">
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
							handleMarkRead={() => {
								handleMarkRead(notification.id);
							}}
						/>
					))}

					{/* Infinite scroll trigger */}
					<div ref={observerTarget} className="h-10 w-full">
						{isFetchingNextPage && (
							<div className="flex items-center justify-center py-4">
								<Spinner />
							</div>
						)}
					</div>

					{!hasNextPage && notifications.length > 0 && (
						<div className="py-6 text-center text-sm text-brand-dark30">{tschedule.noMoreNotifications}</div>
					)}
				</>
			) : (
				<NotificationEmptyState />
			)}
			<Modal />
		</div>
	);
};

export default NotificationList;
