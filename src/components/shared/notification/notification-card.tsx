import React from "react";
import { PiArrowSquareIn } from "react-icons/pi";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils/utils";
import { toLocalFormattedDate } from "@/lib/utils/date";
import { Button } from "@/components/ui/button";
import { DATE_FORMAT } from "@/types/date";
import { NOTIFICATION_KEY, NotificationTitleMap } from "@/types/notification";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
import { useNotificationParam } from "@/module/admin/notifications/hook/useNotificationParam";
import { NOTIFICATION_VIEW } from "@/module/admin/notifications/types/type";

interface NotificationCardProps {
	notification: {
		id: string;
		isRead: boolean;
		message: string;
		title: string;
		createdAt: string;
		updatedAt: string;
		data?: string;
		key: NOTIFICATION_KEY;
	};
	handleMarkRead?: (id: string) => void;
	onClick?: () => void;
	hideHeader?: boolean;
}

/**
 * Notification Card
 *
 * Used in the technician/subcontractor mobile interface.
 *
 * NOTE:
 * This component is NOT intended for the admin side.
 * Admin notifications follow different behavior and are handled
 * separately within the admin notification page components.
 */

const NotificationCard = ({ notification, handleMarkRead, onClick, hideHeader = false }: NotificationCardProps) => {
	const tschedule = useTypedTranslations(NAMESPACE.SCHEDULE);
	const { getParams } = useNotificationParam();
	const { view } = getParams();
	const showHeader = !hideHeader && (view === NOTIFICATION_VIEW.ALL || view === NOTIFICATION_VIEW.MODULE);
	return (
		<Card
			className={cn(
				"w-full cursor-pointer rounded-[10px] border transition-all hover:shadow-md",
				!notification?.isRead && "border-l-4 border-l-blue-500 bg-blue-50/30"
			)}
			onClick={() => onClick?.()}
		>
			<CardContent className="relative p-2">
				<div className="absolute right-2 top-2 flex items-center gap-3">
					{!notification?.isRead && (
						<Button
							variant={"ghost"}
							size={"sm"}
							onClick={(e) => {
								e.stopPropagation();
								handleMarkRead?.(notification.id);
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
							<div className="flex items-center gap-2">
								<h3 className="break-words font-inter text-sm font-medium leading-5 text-brand-dark">
									{NotificationTitleMap[notification.key] ?? notification.title}
								</h3>
							</div>
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
	);
};

export default NotificationCard;
