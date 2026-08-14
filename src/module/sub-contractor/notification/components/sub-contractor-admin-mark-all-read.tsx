import React from "react";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { openErrorToast, openSuccessToast } from "@/components/toast";

import { dateToUTCString, getTodayDate, toDate, toMidnightDateString } from "@/lib/utils/date";

import {
	useMarkAllSubContractorAdminNotificationsRead,
	useSubContractorUnreadNotificationCount,
} from "../hooks/useSubContractorNotification";
import { useNotificationParam } from "@/module/admin/notifications/hook/useNotificationParam";

const SubContractorAdminMarkAllRead = () => {
	const { getParams } = useNotificationParam();

	const { date, notificationTypes, type } = getParams();

	const { data } = useSubContractorUnreadNotificationCount(dateToUTCString(getTodayDate()));

	const markAllRead = useMarkAllSubContractorAdminNotificationsRead();

	const queryClient = useQueryClient();

	const handleMarkAllRead = () => {
		markAllRead.mutate(
			{
				types: notificationTypes ?? undefined,
				type: type ?? undefined,

				createdAt: date ? toMidnightDateString(toDate(date)) : undefined,
			},
			{
				onSuccess: (res) => {
					queryClient.invalidateQueries({
						queryKey: ["sub-contractor-admin-notification-infinite"],
					});

					queryClient.invalidateQueries({
						queryKey: ["sub-contractor-notifications-grouped"],
					});

					queryClient.invalidateQueries({
						queryKey: ["sub-contractor-unread-notification-count"],
					});

					openSuccessToast(res?.message || "All notifications marked as read");
				},

				onError: (error) => {
					openErrorToast({ error });
				},
			}
		);
	};

	return (
		<Button
			onClick={handleMarkAllRead}
			disabled={data === 0 || markAllRead.isPending}
			className="h-10 rounded-[8px] border-none bg-white text-brand-dark shadow-sm"
			size="sm"
		>
			Mark All as Read
		</Button>
	);
};

export default SubContractorAdminMarkAllRead;
