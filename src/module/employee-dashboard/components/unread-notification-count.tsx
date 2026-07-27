import { dateToUTCString, getTodayDate } from "@/lib/utils/date";
import { useEmployeeUnreadNotificationCount } from "@/module/employee-notification/hooks/useEmployeeNotification";
import React from "react";

const UnreadNotificationCount = () => {
	const { data: count } = useEmployeeUnreadNotificationCount(dateToUTCString(getTodayDate()));

	if (!count) return null;

	return (
		<span className="absolute right-[4px] top-[3px] flex h-2 w-2 items-center justify-center rounded-full bg-brand-lightred text-[4px] font-semibold text-white">
			{count ?? 0}
		</span>
	);
};

export default UnreadNotificationCount;
