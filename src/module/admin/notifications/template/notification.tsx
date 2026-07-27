"use client";
import React, { useEffect } from "react";
import { ScheduleProvider } from "@/module/schedule-management/weekly-schedule-management/context/schedule-context";
import NotificationHeader from "../components/notification-header";
import NotificationList from "../components/notification-list";
import { useNotificationParam } from "../hook/useNotificationParam";
import NotificationGrops from "../components/notification-groups";
import { NOTIFICATION_READ_FILTER, NOTIFICATION_VIEW } from "../types/type";
import NotificationModuleGroups from "../components/notification-module-groups";
import { useGetNotificationPreference } from "@/module/schedule-management/weekly-schedule-management/hooks/useSchedule";
import useAuthStore from "@/store/auth-store";
import { getTodayDate } from "@/lib/utils/date";
const AdminNotification = () => {
	const { user } = useAuthStore((state) => state);
	const { getParams, setParams, hasAnySearchParams } = useNotificationParam();
	const { activeGroup, view, date } = getParams();
	const { data: preference, isLoading } = useGetNotificationPreference(user);

	useEffect(() => {
		if (!preference || hasAnySearchParams()) return;

		setParams(
			{
				view: preference.view ?? NOTIFICATION_VIEW.MODULE,
				readFilter: preference.readFilter ?? NOTIFICATION_READ_FILTER.ALL,
				teamId: preference.teamId ?? null,
				...(date === undefined && { date: getTodayDate() }),
			},
			false
		);
	}, [date, hasAnySearchParams, preference, setParams]);

	if (isLoading) return null;

	return (
		<ScheduleProvider>
			{" "}
			<div>
				{" "}
				<NotificationHeader activeGroup={activeGroup} onBack={() => setParams({ activeGroup: null })} />{" "}
				{activeGroup ? (
					<NotificationList />
				) : view === NOTIFICATION_VIEW.MODULE ? (
					<NotificationModuleGroups />
				) : view === NOTIFICATION_VIEW.ALL ? (
					<NotificationList />
				) : (
					<NotificationGrops />
				)}{" "}
			</div>{" "}
		</ScheduleProvider>
	);
};
export default AdminNotification;
