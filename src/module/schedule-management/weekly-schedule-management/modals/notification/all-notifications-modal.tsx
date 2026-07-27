"use client";
import React, { useState } from "react";
import { useGetAdminNotifications, useUpdateAdminNotification } from "../../hooks/useSchedule";
import { useQueryClient } from "@tanstack/react-query";
import { Spinner } from "@/components/ui/spinner";
import { useModal } from "@/hooks/useModal";
import { useAdminNotificationHandlers } from "../../hooks/useNotificationHandlers";

import { PiArrowSquareIn } from "react-icons/pi";

import { NOTIFICATION_TYPE } from "@/types/notification";
import NotificationHeader from "./notification-header";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";

const AllNotificationsModal = ({ onCloseSheet }: { onCloseSheet: () => void }) => {
	const queryClient = useQueryClient();
	const { openModal, closeModal, Modal } = useModal();
	const tschedule = useTypedTranslations(NAMESPACE.SCHEDULE);
	const { handleNotificationClick } = useAdminNotificationHandlers({ openModal, closeModal });
	const [notificationTypes, setNotificationTypes] = useState<NOTIFICATION_TYPE[] | undefined>(undefined);

	const { data, isLoading } = useGetAdminNotifications({
		page: 1,
		pageSize: 10,
		types: notificationTypes,
	});

	const { mutate: updateNotification } = useUpdateAdminNotification();

	const handleMarkRead = (id: string) => {
		updateNotification(
			{ id, payload: { isRead: true } },
			{
				onSuccess: () => {
					queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
				},
			}
		);
	};

	if (isLoading) return <Spinner />;

	return (
		<div className="flex h-full flex-col px-2 py-1">
			{/* header */}
			<NotificationHeader
				onCloseSheet={onCloseSheet}
				notificationTypes={notificationTypes}
				setNotificationTypes={setNotificationTypes}
			/>

			<div className="flex-1 overflow-y-auto">
				<Modal />
				{data?.items?.length && data?.items?.length > 0 ? (
					<div className="space-y-1">
						{data?.items.map((notification, index) => (
							<div
								key={`${notification?.id}-${index}`}
								className="cursor-pointer border-b border-brand-dark10 py-4"
								onClick={() =>
									handleNotificationClick({
										key: notification.key,
										data: notification.data,
									})
								}
							>
								{!notification?.userNotification?.isRead && (
									<div className="my-1 flex items-center justify-between gap-1">
										<p className="text-sm font-medium text-brand-dark50">{tschedule.new}</p>
										<PiArrowSquareIn className="h-5 w-5 shrink-0 text-brand-dark" />
									</div>
								)}

								<p className="break-words font-inter text-sm font-normal text-brand-dark">{notification.message}</p>
								{!notification?.userNotification?.isRead && (
									<p
										className="my-1 cursor-pointer text-xs font-semibold text-brand-dark underline underline-offset-4"
										onClick={(e) => {
											e.stopPropagation();
											if (notification.userNotification?.id) {
												handleMarkRead(notification.userNotification?.id);
											}
										}}
									>
										{tschedule.markAsRead}
									</p>
								)}
							</div>
						))}
					</div>
				) : (
					<p className="text-gray-500">{tschedule.noNotificationsFound}</p>
				)}
			</div>
		</div>
	);
};

export default AllNotificationsModal;
