"use client";
import React, { useEffect, useRef } from "react";
import { Spinner } from "@/components/ui/spinner";
import { useGetAdminNotificationsInfinite } from "@/module/schedule-management/weekly-schedule-management/hooks/useSchedule";
import { useNotificationParam } from "../hook/useNotificationParam";
import { toDate, toMidnightDateString } from "@/lib/utils/date";
import NotificationCard from "./notification-card";
import NotificationEmptyState from "@/components/shared/notification/notification-empty-state";

import { NOTIFICATION_VIEW } from "../types/type";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";

const NotificationList = () => {
	const { getParams } = useNotificationParam();

	const { date, notificationTypes, isRead, moduleGroups, view, teamId } = getParams();

	const isDefaultView = view === NOTIFICATION_VIEW.DEFAULT_VIEW;
	const tschedule = useTypedTranslations(NAMESPACE.SCHEDULE);

	const observerTarget = useRef<HTMLDivElement>(null);

	const isModuleView = view === NOTIFICATION_VIEW.MODULE;

	const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useGetAdminNotificationsInfinite({
		pageSize: 20,
		types: isModuleView ? undefined : notificationTypes,
		moduleGroups: isModuleView ? moduleGroups : undefined,
		isRead: isDefaultView ? undefined : isRead,
		createdAt: date ? toMidnightDateString(toDate(date)) : undefined,
		teamId,
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
		return () => observer.unobserve(currentTarget);
	}, [hasNextPage, isFetchingNextPage, fetchNextPage]);

	if (isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<Spinner />
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{notifications.length > 0 ? (
				<>
					<div className="space-y-2">
						{notifications.map((n) => (
							<NotificationCard key={n.id} notification={n} />
						))}
					</div>

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
		</div>
	);
};

export default NotificationList;
