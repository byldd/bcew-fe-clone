import { toDate } from "@/lib/utils/date";
import { IGetAdminNotificationItem } from "@/module/schedule-management/weekly-schedule-management/types/schedule-interface";
import { RefObject } from "react";

export const newNotificationCount = ({
	previousTopNotification,
	data,
}: {
	previousTopNotification: RefObject<{ total: number; notification: IGetAdminNotificationItem | null } | null>;
	data: IGetAdminNotificationItem[];
}) => {
	if (previousTopNotification.current?.notification) {
		const newNotification =
			data?.filter(
				(notification) =>
					notification.createdAt &&
					previousTopNotification.current?.notification?.createdAt &&
					toDate(notification.createdAt) > toDate(previousTopNotification.current?.notification?.createdAt)
			) || [];

		if (newNotification.length > 0) {
			previousTopNotification.current = {
				total: newNotification.length,
				notification: newNotification[0] || null,
			};
			return newNotification.length;
		}

		return previousTopNotification.current?.total || 0;
	} else {
		previousTopNotification.current = {
			total: 0,
			notification: data[0] || null,
		};
	}
	return 0;
};
