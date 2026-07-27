"use client";

import { getTodayDate, toDate } from "@/lib/utils/date";
import { NOTIFICATION_TYPE } from "@/types/notification";

import { useRouter, useSearchParams } from "next/navigation";
import { NOTIFICATION_READ_FILTER, NOTIFICATION_VIEW, MODULE_GROUP } from "../types/type";
import useAuthStore from "@/store/auth-store";
import { ROLES } from "@/types";

type NotificationParam = {
	notificationTypes: NOTIFICATION_TYPE[] | undefined | null;
	moduleGroups: MODULE_GROUP[] | undefined | null;
	date: Date | string | undefined | null;
	isRead: boolean | undefined | null;
	readFilter: NOTIFICATION_READ_FILTER | undefined | null;
	activeGroup: string | null;
	view: NOTIFICATION_VIEW | undefined | null;
	teamId: string | undefined | null;
	type?: NOTIFICATION_TYPE | null;
};

const notificationParamKey = {
	notificationTypes: "notificationTypes",
	moduleGroups: "moduleGroups",
	date: "date",
	isRead: "isRead",
	readFilter: "readFilter",
	activeGroup: "activeGroup",
	view: "view",
	teamId: "teamId",
	type: "type",
};

/**
 * This is the hook to get and set the notification parameters in the URL.
 * Used on admin-notifications page and employee-notifications page.
 */
export const useNotificationParam = () => {
	const searchParams = useSearchParams();
	const router = useRouter();
	const { user } = useAuthStore((state) => state);

	const getParams = (): NotificationParam => {
		const paramReadFilter = searchParams.get(notificationParamKey.readFilter) as NOTIFICATION_READ_FILTER | undefined;
		const paramDate = searchParams.get(notificationParamKey.date);
		const rawTeamId = searchParams.get(notificationParamKey.teamId);
		const notificationView = searchParams.get(notificationParamKey.view) as NOTIFICATION_VIEW | undefined;

		return {
			notificationTypes: searchParams.get(notificationParamKey.notificationTypes)?.split(",").filter(Boolean) as
				| NOTIFICATION_TYPE[]
				| undefined,

			moduleGroups: searchParams.get(notificationParamKey.moduleGroups)?.split(",").filter(Boolean) as
				| MODULE_GROUP[]
				| undefined,

			date: paramDate ? toDate(new Date(paramDate)) : undefined,

			isRead:
				paramReadFilter === NOTIFICATION_READ_FILTER.UNREADS
					? false
					: paramReadFilter === NOTIFICATION_READ_FILTER.READS
						? true
						: undefined,

			readFilter: paramReadFilter ?? NOTIFICATION_READ_FILTER.ALL,

			activeGroup: searchParams.get(notificationParamKey.activeGroup) ?? null,

			view: notificationView
				? notificationView
				: user?.userType === ROLES.SUB_CONTRACTOR
					? NOTIFICATION_VIEW.DEFAULT_VIEW
					: NOTIFICATION_VIEW.MODULE,

			teamId: rawTeamId === "all" ? null : (rawTeamId ?? undefined),

			type: searchParams.get(notificationParamKey.type) as NOTIFICATION_TYPE | undefined,
		};
	};

	const setParams = (params: Partial<NotificationParam>, persistPreviousParams = true, useReplace = false) => {
		const newParams = new URLSearchParams();
		const previous = getParams();

		if (persistPreviousParams) {
			Object.entries(previous).forEach(([key, value]) => {
				if (value !== undefined && value !== null) {
					newParams.set(key, value.toString());
				}
			});
		}

		// notificationTypes
		if (params.notificationTypes === null || params.notificationTypes?.length === 0) {
			newParams.delete(notificationParamKey.notificationTypes);
		} else if (params.notificationTypes !== undefined) {
			newParams.set(notificationParamKey.notificationTypes, params.notificationTypes.join(","));
		}

		// moduleGroups
		if (params.moduleGroups === null || params.moduleGroups?.length === 0) {
			newParams.delete(notificationParamKey.moduleGroups);
		} else if (params.moduleGroups !== undefined) {
			newParams.set(notificationParamKey.moduleGroups, params.moduleGroups.join(","));
		}

		// date
		if (params.date === null) {
			newParams.delete(notificationParamKey.date);
		} else if (params.date !== undefined) {
			newParams.set(notificationParamKey.date, params.date.toString());
		}

		// readFilter
		if (params.readFilter) {
			newParams.set(notificationParamKey.readFilter, params.readFilter);
		}

		// activeGroup
		if (params.activeGroup === null) {
			newParams.delete(notificationParamKey.activeGroup);
		} else if (params.activeGroup !== undefined) {
			newParams.set(notificationParamKey.activeGroup, params.activeGroup);
		}

		// view
		if (params.view === null) {
			newParams.delete(notificationParamKey.view);
		} else if (params.view !== undefined) {
			newParams.set(notificationParamKey.view, params.view);
		}

		// teamId
		if (params.teamId === null) {
			newParams.set(notificationParamKey.teamId, "all");
		} else if (params.teamId !== undefined) {
			newParams.set(notificationParamKey.teamId, params.teamId);
		}

		// type
		if (params.type === null) {
			newParams.delete(notificationParamKey.type);
		} else if (params.type !== undefined) {
			newParams.set(notificationParamKey.type, params.type);
		}

		const url = `?${newParams.toString()}`;

		if (useReplace) {
			router.replace(url, { scroll: false });
		} else {
			router.push(url, { scroll: false });
		}
	};

	const clearParams = () => {
		router.push(`?`, { scroll: false });
	};

	const hasAnySearchParams = () => {
		return searchParams.toString().length > 0;
	};

	return { getParams, setParams, clearParams, hasAnySearchParams };
};
