"use client";

import { useGetAdminNotificationsCount } from "@/module/schedule-management/weekly-schedule-management/hooks/useSchedule";
import useAuthStore from "@/store/auth-store";
import { ROLES } from "@/types";
import { createContext, useContext, useEffect } from "react";

// import { newNotificationCount } from "../notifications/utils/new-notification-count";

interface IAdminNotificationContext {
	notificationCount: number;
}

const AdminNotificationContext = createContext<IAdminNotificationContext>({
	notificationCount: 0,
});

const AdminNotificationProvider = ({ children }: { children: React.ReactNode }) => {
	const { user } = useAuthStore((user) => user);
	const enabled = user?.userType === ROLES.ADMIN;
	const { data, refetch } = useGetAdminNotificationsCount(user?.userType === ROLES.ADMIN);

	// TODO:- may require in future

	// const { data, refetch, isFetching } = useGetAdminNotifications({
	// 	page: 1,
	// 	pageSize: 5,
	// });

	// const previousTopNotification = useRef<{ total: number; notification: IGetAdminNotificationItem | null } | null>(
	// 	null
	// );

	// const newNotificationsCount = useMemo(() => {
	// 	return newNotificationCount({ previousTopNotification, data: data?.items || [] });
	// 	// Do Not Remove es warn, keep isFetching in dependencies
	// }, [data, isFetching]);

	useEffect(() => {
		if (!enabled) return;

		const interval = setInterval(() => {
			refetch();
		}, 300000); // 5 minutes

		return () => clearInterval(interval);
	}, [refetch, enabled]);

	return (
		<AdminNotificationContext.Provider value={{ notificationCount: data?.count || 0 }}>
			{children}
		</AdminNotificationContext.Provider>
	);
};

export const useAdminNotification = () => {
	return useContext(AdminNotificationContext);
};

export { AdminNotificationProvider };
