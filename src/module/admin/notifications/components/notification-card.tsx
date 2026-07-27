import React, { useCallback } from "react";
import { PiArrowSquareIn } from "react-icons/pi";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils/utils";
import { toLocalFormattedDate } from "@/lib/utils/date";
import { IGetAdminNotificationItem } from "@/module/schedule-management/weekly-schedule-management/types/schedule-interface";
import { useUpdateAdminNotification } from "@/module/schedule-management/weekly-schedule-management/hooks/useSchedule";
import { useQueryClient } from "@tanstack/react-query";
import { useAdminNotificationHandlers } from "@/module/schedule-management/weekly-schedule-management/hooks/useNotificationHandlers";
import { useModal } from "@/hooks/useModal";
import { Button } from "@/components/ui/button";
import { DATE_FORMAT } from "@/types/date";
import { NotificationTitleMap } from "@/types/notification";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
import { useNotificationParam } from "../hook/useNotificationParam";
import { NOTIFICATION_VIEW } from "../types/type";

interface NotificationCardProps {
	notification: IGetAdminNotificationItem;
	hideHeader?: boolean;
}

const NotificationCard = ({ notification, hideHeader = false }: NotificationCardProps) => {
	const queryClient = useQueryClient();
	const { openModal, closeModal, Modal } = useModal();
	const { mutate: updateNotification } = useUpdateAdminNotification();
	const { handleNotificationClick } = useAdminNotificationHandlers({ openModal, closeModal });
	const tschedule = useTypedTranslations(NAMESPACE.SCHEDULE);

	const { getParams } = useNotificationParam();

	const { view } = getParams();

	const handleMarkRead = useCallback(() => {
		if (!notification.userNotification?.id) return;
		updateNotification(
			{ id: notification.userNotification?.id, payload: { isRead: true } },
			{
				onSuccess: () => {
					queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
					queryClient.invalidateQueries({ queryKey: ["admin-notifications-grouped"] });
					queryClient.invalidateQueries({ queryKey: ["admin-notifications-infinite"] });
					queryClient.invalidateQueries({ queryKey: ["admin-notifications-module-grouped"] });
					queryClient.invalidateQueries({ queryKey: ["admin-notifications-count"] });
				},
			}
		);
	}, [updateNotification, queryClient, notification]);

	const onClick = useCallback(() => {
		handleNotificationClick({ key: notification.key, data: notification.data });
		handleMarkRead();
	}, [handleNotificationClick, handleMarkRead, notification.key, notification.data]);

	const showHeader = !hideHeader && (view === NOTIFICATION_VIEW.ALL || view === NOTIFICATION_VIEW.MODULE);

	const isRead = notification?.userNotification ? notification?.userNotification?.isRead : true;

	return (
		<>
			<Modal />
			<Card
				className={cn(
					"w-full cursor-pointer rounded-[10px] border transition-all hover:shadow-md",
					!isRead && "border-l-4 border-l-blue-500 bg-blue-50/30"
				)}
				onClick={onClick}
			>
				<CardContent className="relative p-2">
					<div className="absolute right-2 top-2 flex items-center gap-3">
						{!isRead && (
							<Button
								variant={"ghost"}
								size={"sm"}
								onClick={(e) => {
									e.stopPropagation();
									handleMarkRead();
								}}
								className="h-auto p-0 text-xs font-semibold text-blue-600 underline underline-offset-2 hover:text-blue-800"
							>
								{tschedule.markAsRead}
							</Button>
						)}
						<PiArrowSquareIn className="h-5 w-5 flex-shrink-0 text-brand-dark30" />
					</div>
					<div className="flex flex-col gap-2 pr-24">
						<div className="min-w-0 flex-1">
							{showHeader && (
								<h3 className="break-words font-inter text-sm font-medium leading-5 text-brand-dark">
									{NotificationTitleMap[notification.key] ?? notification.title}
								</h3>
							)}
							<p
								className={cn(
									"break-words font-inter text-xs font-normal leading-5 text-brand-dark50 sm:text-sm sm:leading-tight",
									showHeader && "mt-2"
								)}
								dangerouslySetInnerHTML={{ __html: notification.message }}
							/>
						</div>
						<div className="text-[10px] font-medium text-brand-dark30">
							{toLocalFormattedDate(notification.createdAt, DATE_FORMAT.DATE_AND_TIME)}
						</div>
					</div>
				</CardContent>
			</Card>
		</>
	);
};

export default NotificationCard;
