import React from "react";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import {
	useMarkAllCrewNotificationsRead,
	useSubContractorCrewLeaderUnreadNotificationCount,
} from "../hooks/useSubContractorNotification";
import { openErrorToast, openSuccessToast } from "@/components/toast";
import { dateToUTCString, getTodayDate } from "@/lib/utils/date";

const CrewMarkAllRead = () => {
	const { data } = useSubContractorCrewLeaderUnreadNotificationCount(dateToUTCString(getTodayDate()));
	const markAllRead = useMarkAllCrewNotificationsRead();
	const queryClient = useQueryClient();

	const handleMarkAllRead = () => {
		markAllRead.mutate(undefined, {
			onSuccess: (res) => {
				queryClient.invalidateQueries({ queryKey: ["sub-contractor-crew-notification-infinite"] });
				queryClient.invalidateQueries({ queryKey: ["sub-contractor-crew-leader-unread-notification-count"] });

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
			className="h-10 rounded-[8px] border-none bg-white text-brand-dark shadow-md"
			size="sm"
		>
			Mark All as Read
		</Button>
	);
};

export default CrewMarkAllRead;
