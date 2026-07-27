"use client";
import React, { useEffect } from "react";
import NotificationHeader from "../components/notification-header";
import SubContractorNotificationList from "@/module/sub-contractor/notification/components/sub-contractor-notification-list";
import { useNotificationParam } from "../hook/useNotificationParam";
import SubContractorNotificationGroups from "../components/sub-contractor-notification-group";
import { NOTIFICATION_READ_FILTER, NOTIFICATION_VIEW } from "../types/type";
import { useGetNotificationPreference } from "@/module/schedule-management/weekly-schedule-management/hooks/useSchedule";
import useAuthStore from "@/store/auth-store";
import { getTodayDate } from "@/lib/utils/date";

const SubContractorAdminDesktopNotifications = () => {
	const { user } = useAuthStore((state) => state);
	const { getParams, setParams, hasAnySearchParams } = useNotificationParam();
	const { activeGroup, view, date } = getParams();

	const { data: preference, isLoading } = useGetNotificationPreference(user);

	useEffect(() => {
		if (!preference || hasAnySearchParams()) return;

		setParams(
			{
				view: preference.view ?? NOTIFICATION_VIEW?.DEFAULT_VIEW,
				readFilter: preference.readFilter ?? NOTIFICATION_READ_FILTER?.ALL,
				teamId: preference.teamId ?? null,
				...(date === undefined && { date: getTodayDate() }),
			},
			false
		);
	}, [preference, setParams]);

	if (isLoading) return null;

	return (
		<div className="px-2">
			<NotificationHeader activeGroup={activeGroup} onBack={() => setParams({ activeGroup: null })} />

			{activeGroup || view !== NOTIFICATION_VIEW.DEFAULT_VIEW ? (
				<SubContractorNotificationList />
			) : (
				<SubContractorNotificationGroups />
			)}
		</div>
	);
};

export default SubContractorAdminDesktopNotifications;
