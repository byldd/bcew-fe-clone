import React from "react";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import {
	useGetAdminNotificationsCount,
	useMarkAllAdminNotificationsRead,
} from "@/module/schedule-management/weekly-schedule-management/hooks/useSchedule";
import { openErrorToast, openSuccessToast } from "@/components/toast";
import { toMidnightDateString } from "@/lib/utils/date";
import { useNotificationParam } from "../hook/useNotificationParam";

const AdminMarkAllRead = () => {
	const { getParams } = useNotificationParam();

	const { date, notificationTypes, moduleGroups, teamId } = getParams();

	const { data } = useGetAdminNotificationsCount();

	const markAllRead = useMarkAllAdminNotificationsRead();

	const queryClient = useQueryClient();

	const handleMarkAllRead = () => {
		markAllRead.mutate(
			{
				types: notificationTypes ?? undefined,
				moduleGroups: moduleGroups ?? undefined,
				createdAt: date ? toMidnightDateString(date) : undefined,
				teamId: teamId ?? undefined,
			},
			{
				onSuccess: (res) => {
					queryClient.invalidateQueries({
						queryKey: ["admin-notifications"],
					});

					queryClient.invalidateQueries({
						queryKey: ["admin-notifications-grouped"],
					});

					queryClient.invalidateQueries({
						queryKey: ["admin-notifications-infinite"],
					});

					queryClient.invalidateQueries({
						queryKey: ["admin-notifications-count"],
					});

					queryClient.invalidateQueries({
						queryKey: ["admin-notifications-module-grouped"],
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
			disabled={data?.count === 0 || markAllRead.isPending}
			size="sm"
			className="h-10 rounded-[8px] border-none bg-white px-4 text-sm text-brand-dark shadow-md"
		>
			Mark All as Read
		</Button>
	);
};

export default AdminMarkAllRead;
