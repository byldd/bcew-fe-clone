"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import NotificationCard from "@/components/shared/notification/notification-card";
import { Spinner } from "@/components/ui/spinner";
import { useNotificationParam } from "@/module/admin/notifications/hook/useNotificationParam";
import { toDate, toMidnightDateString } from "@/lib/utils/date";
import { useQueryClient } from "@tanstack/react-query";

import { useGetSubContractorNotificationGrouped } from "@/module/schedule-management/weekly-schedule-management/hooks/useSchedule";
import { useUpdateSubContractorNotification } from "@/module/sub-contractor/notification/hooks/useSubContractorNotification";
import { useHandleSubContractorNotification } from "@/module/sub-contractor/hooks/useHandleSubContractorNotification";
import useAuthStore from "@/store/auth-store";
import { NOTIFICATION_TYPE } from "@/types/notification";
import { openErrorToast } from "@/components/toast";
import { DragSortable } from "./dragSortable";
import { PiDotsSixVerticalBold } from "react-icons/pi";
import { ISubContractorAdminGroupedNotificationResponse } from "@/module/sub-contractor/notification/types/notification";
import { ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { AppTooltip } from "@/components/ui/tooltip";
import { LuInfo } from "react-icons/lu";
import {
	INotificationGroupEntry,
	SUB_CONTRACTOR_NOTIFICATION_GROUP,
	SUB_CONTRACTOR_NOTIFICATION_TOOLTIP,
} from "../types/type";

type NotificationItem = ISubContractorAdminGroupedNotificationResponse["data"]["items"][number]["items"][number];

type ExtendedGroupEntry = INotificationGroupEntry<NotificationItem> & {
	unreadCount: number;
};

const SubContractorNotificationGroups = () => {
	const { getParams, setParams } = useNotificationParam();
	const { date, isRead, notificationTypes } = getParams();

	const queryClient = useQueryClient();
	const { user } = useAuthStore((store) => store);

	const { handleNotificationClick } = useHandleSubContractorNotification({
		isAdmin: !!user,
	});

	const { mutateAsync: updateNotification } = useUpdateSubContractorNotification();

	const ALL_TYPES = Object.keys(SUB_CONTRACTOR_NOTIFICATION_GROUP) as NOTIFICATION_TYPE[];

	const { data: groupedNotificationsData, isLoading } = useGetSubContractorNotificationGrouped({
		pageSize: 20,
		createdAt: date ? toMidnightDateString(toDate(date)) : undefined,
		isRead,
		types: notificationTypes?.length ? notificationTypes : ALL_TYPES,
	});

	const groups = useMemo(() => {
		return notificationTypes?.length
			? Object.keys(SUB_CONTRACTOR_NOTIFICATION_GROUP).filter((key) =>
					notificationTypes.includes(key as keyof typeof SUB_CONTRACTOR_NOTIFICATION_GROUP)
				)
			: Object.keys(SUB_CONTRACTOR_NOTIFICATION_GROUP);
	}, [notificationTypes]);

	const [groupEntries, setGroupEntries] = useState<ExtendedGroupEntry[]>([]);

	useEffect(() => {
		if (!groupedNotificationsData) return;

		const entries = groups.map((key) => {
			const groupData = groupedNotificationsData.items?.find((item) => item.type === key);

			return {
				id: key,
				groupName: SUB_CONTRACTOR_NOTIFICATION_GROUP[key as keyof typeof SUB_CONTRACTOR_NOTIFICATION_GROUP],
				items: groupData?.items ?? [],
				unreadCount: groupData?.unreadCount ?? 0,
				value: key,
			};
		});

		setGroupEntries((prev) => {
			if (JSON.stringify(prev) === JSON.stringify(entries)) return prev;
			return entries;
		});
	}, [groups, groupedNotificationsData]);

	const handleMarkRead = useCallback(
		(id: string) => {
			updateNotification(
				{ id, payload: { isRead: true } },
				{
					onSuccess: () => {
						queryClient.invalidateQueries({
							queryKey: ["sub-contractor-admin-notification-infinite"],
						});
						queryClient.invalidateQueries({
							queryKey: ["sub-contractor-notifications-grouped"],
						});
						queryClient.invalidateQueries({
							queryKey: ["sub-contractor-unread-notification-count"],
						});
					},
					onError: (error) => openErrorToast({ error }),
				}
			);
		},
		[updateNotification, queryClient]
	);

	return (
		<div className="max-h-full space-y-6 overflow-y-auto">
			<DragSortable
				items={groupEntries}
				onChange={setGroupEntries}
				getId={(g) => g.id}
				className="columns-1 gap-5 xl:columns-2"
				renderItem={({ groupName, items, value, unreadCount }, _, dragHandleProps, isAnyDragging) => (
					<Collapsible className="group/collapsible mb-5 flex break-inside-avoid flex-col rounded-[20px] border bg-white px-4 shadow-sm">
						{/* HEADER */}
						<div className="flex items-center justify-between py-2">
							<div className="flex items-center gap-1">
								<div {...dragHandleProps} className="mr-1 cursor-pointer">
									<PiDotsSixVerticalBold size={18} />
								</div>

								<div className="flex items-center gap-2">
									<h2 className="font-inter text-base font-medium text-brand-dark">{groupName}</h2>
									<AppTooltip
										text={
											SUB_CONTRACTOR_NOTIFICATION_TOOLTIP[value as NOTIFICATION_TYPE] ??
											"No additional information available"
										}
										trigger={<LuInfo size={16} className="cursor-pointer text-brand-dark50 hover:text-brand-dark" />}
									/>
								</div>
							</div>

							<div className="flex items-center">
								{/* UNREAD COUNT */}
								<span
									className={`mr-2 flex h-4 w-4 items-center justify-center rounded-full text-[8px] font-semibold ${
										unreadCount > 0 ? "bg-red-500 text-white dark:bg-red-600" : "bg-gray-200 text-brand-dark"
									}`}
								>
									{unreadCount}
								</span>

								<CollapsibleTrigger asChild>
									<button className="flex items-center justify-center rounded p-1 hover:bg-gray-100">
										<ChevronDown className="h-4 w-4 shrink-0 text-brand-dark50 transition-transform group-data-[state=open]/collapsible:rotate-180" />
									</button>
								</CollapsibleTrigger>

								<Button
									onClick={() =>
										setParams({
											activeGroup: value,
											notificationTypes: null,
											moduleGroups: null,
											type: value as NOTIFICATION_TYPE,
										})
									}
									className="text-brand-primary px-2 text-sm font-medium hover:underline"
								>
									See All
								</Button>
							</div>
						</div>

						{/* BODY */}
						{!isAnyDragging && (
							<CollapsibleContent>
								<div
									className={`space-y-3 ${
										items.length === 0
											? "flex flex-1 items-center justify-center text-center"
											: "max-h-[280px] overflow-y-auto py-2"
									}`}
								>
									{isLoading && (
										<div className="flex min-h-[120px] items-center justify-center">
											<Spinner />
										</div>
									)}

									{!isLoading && items.length === 0 && (
										<div className="flex min-h-[160px] items-center justify-center bg-white py-6 shadow-none">
											<p className="text-sm text-brand-dark50">No notifications found</p>
										</div>
									)}

									{items.map((notification, i) => (
										<NotificationCard
											key={`${groupName}-${notification.id}-${i}`}
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
								</div>
							</CollapsibleContent>
						)}
					</Collapsible>
				)}
			/>
		</div>
	);
};

export default SubContractorNotificationGroups;
