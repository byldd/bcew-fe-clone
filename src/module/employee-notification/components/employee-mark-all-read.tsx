import React from "react";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import {
	useEmployeeUnreadNotificationCount,
	useMarkAllEmployeeNotificationsRead,
} from "@/module/employee-notification/hooks/useEmployeeNotification";
import { openErrorToast, openSuccessToast } from "@/components/toast";
import { dateToUTCString, getTodayDate } from "@/lib/utils/date";

const EmployeeMarkAllRead = () => {
	const { data } = useEmployeeUnreadNotificationCount(dateToUTCString(getTodayDate()));
	const markAllRead = useMarkAllEmployeeNotificationsRead();
	const queryClient = useQueryClient();

	const handleMarkAllRead = () => {
		markAllRead.mutate(undefined, {
			onSuccess: (res) => {
				queryClient.invalidateQueries({ queryKey: ["employee-notification"] });
				queryClient.invalidateQueries({ queryKey: ["employee-notification-infinite"] });
				queryClient.invalidateQueries({ queryKey: ["employee-unread-notification-count"] });

				openSuccessToast(res?.message || "All notifications marked as read");
			},
			onError: (error) => {
				openErrorToast({ error });
			},
		});
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

export default EmployeeMarkAllRead;
