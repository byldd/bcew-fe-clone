"use client";
import useAuthStore from "@/store/auth-store";
import {
	useSubContractorCrewNotification,
	useUpdateSubContractorCrewNotification,
} from "../hooks/useSubContractorNotification";
import React, { useCallback, useEffect, useRef } from "react";
import { Spinner } from "@/components/ui/spinner";
import { useHandleSubContractorNotification } from "../../hooks/useHandleSubContractorNotification";
import NotificationHeader from "../components/notification-header";
import { useNotificationParam } from "@/module/admin/notifications/hook/useNotificationParam";
import { toDate, toMidnightDateString } from "@/lib/utils/date";
import NotificationEmptyState from "@/components/shared/notification/notification-empty-state";
import NotificationCard from "@/components/shared/notification/notification-card";
import { useQueryClient } from "@tanstack/react-query";

const SubContractorCrewNotification = () => {
	const { getParams } = useNotificationParam();
	const { isRead, date } = getParams();
	const observerTarget = useRef<HTMLDivElement>(null);
	const queryClient = useQueryClient();

	const { mutateAsync: updateNotification } = useUpdateSubContractorCrewNotification();

	const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useSubContractorCrewNotification({
		pageSize: 20,
		isRead: isRead ?? undefined,
		createdAt: date ? toMidnightDateString(toDate(date)) : undefined,
	});

	const { user } = useAuthStore((store) => store);

	const { handleNotificationClick } = useHandleSubContractorNotification({
		isAdmin: !!user,
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

	const handleMarkRead = useCallback(
		(id: string) => {
			updateNotification(
				{ id, payload: { isRead: true } },
				{
					onSuccess: () => {
						queryClient.invalidateQueries({ queryKey: ["sub-contractor-crew-notification-infinite"] });
						queryClient.invalidateQueries({ queryKey: ["sub-contractor-crew-leader-unread-notification-count"] });
					},
				}
			);
		},
		[updateNotification, queryClient]
	);

	return (
		<div className="rounded-[20px] px-6 py-4">
			{/* Header */}
			<NotificationHeader />

			{isLoading ? (
				<div>
					<Spinner />
				</div>
			) : notifications.length > 0 ? (
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
								if (!notification.isRead) {
									handleMarkRead(notification.id);
								}
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
						<div className="py-6 text-center text-sm text-brand-dark30">No more notifications to load</div>
					)}
				</>
			) : (
				<NotificationEmptyState />
			)}
		</div>
	);
};

export default SubContractorCrewNotification;
