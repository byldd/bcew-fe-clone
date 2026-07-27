"use client";
import React, { useEffect, useState } from "react";
import { toDate, toMidnightDateString } from "@/lib/utils/date";
import { useGetAdminNotificationCount } from "@/module/schedule-management/weekly-schedule-management/hooks/useSchedule";
import { useNotificationParam } from "../hook/useNotificationParam";
import { Button } from "@/components/ui/button";
import NotificationCard from "./notification-card";
import { ADMIN_NOTIFICATION_GROUP, ADMIN_NOTIFICATION_TOOLTIP, INotificationGroupEntry } from "../types/type";
import { Spinner } from "@/components/ui/spinner";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
import { NOTIFICATION_TYPE } from "@/types/notification";
import { DragSortable } from "./dragSortable";
import { PiDotsSixVerticalBold } from "react-icons/pi";
import { IGetAdminNotificationItem } from "@/module/schedule-management/weekly-schedule-management/types/schedule-interface";
import { ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { LuInfo } from "react-icons/lu";
import { AppTooltip } from "@/components/ui/tooltip";
import { useUpdateNotificationOrder } from "@/module/schedule-management/weekly-schedule-management/hooks/useSchedule";
import { useRef } from "react";

type ExtendedGroupEntry = INotificationGroupEntry<IGetAdminNotificationItem> & {
	unreadCount: number;
};

const NotificationGrops = () => {
	const { getParams, setParams } = useNotificationParam();
	const tschedule = useTypedTranslations(NAMESPACE.SCHEDULE);

	const { date, isRead, notificationTypes, teamId } = getParams();

	const { data: groupedNotificationsData, isLoading } = useGetAdminNotificationCount({
		pageSize: 20,
		createdAt: date ? toMidnightDateString(toDate(date)) : undefined,
		isRead: isRead,
		types: notificationTypes?.length
			? (notificationTypes as NOTIFICATION_TYPE[])
			: (Object.keys(ADMIN_NOTIFICATION_GROUP) as NOTIFICATION_TYPE[]),
		teamId,
	});

	const { mutate: updateOrder } = useUpdateNotificationOrder();
	const debounceRef = useRef<NodeJS.Timeout | null>(null);

	React.useMemo(() => {
		const defaultGroups = Object.keys(ADMIN_NOTIFICATION_GROUP);

		if (!groupedNotificationsData?.items) {
			return defaultGroups;
		}

		let ordered = groupedNotificationsData.items.map((g) => g.type);

		if (!ordered.length) {
			return defaultGroups;
		}

		if (notificationTypes?.length) {
			ordered = ordered.filter((type) => notificationTypes.includes(type as NOTIFICATION_TYPE));
		}

		const missing = defaultGroups.filter((type) => !ordered.includes(type as NOTIFICATION_TYPE));

		return [...ordered, ...missing];
	}, [groupedNotificationsData, notificationTypes]);

	const [groupEntries, setGroupEntries] = useState<ExtendedGroupEntry[]>([]);

	useEffect(() => {
		if (!groupedNotificationsData?.items) return;

		const entries: ExtendedGroupEntry[] = groupedNotificationsData.items.map((group) => ({
			id: group.type,
			groupName: ADMIN_NOTIFICATION_GROUP[group.type as keyof typeof ADMIN_NOTIFICATION_GROUP],
			items: group.items,
			value: group.type,
			unreadCount: group.unreadCount,
		}));

		setGroupEntries(entries);
	}, [groupedNotificationsData]);

	return (
		<div className="max-h-full space-y-6 overflow-y-auto">
			<DragSortable
				items={groupEntries}
				onChange={(newOrder) => {
					setGroupEntries(newOrder);

					// debounce API call
					if (debounceRef.current) {
						clearTimeout(debounceRef.current);
					}

					debounceRef.current = setTimeout(() => {
						updateOrder(newOrder.map((g) => g.value as NOTIFICATION_TYPE));
					}, 400);
				}}
				getId={(g) => g.id}
				className="columns-1 gap-5 xl:columns-2"
				renderItem={({ groupName, items, value, unreadCount }, _, dragHandleProps, isAnyDragging) => (
					// 	{/* HEADER */}
					<Collapsible className="group/collapsible mb-5 flex break-inside-avoid flex-col rounded-[20px] border bg-white px-4 shadow-sm">
						<div className="flex items-center justify-between py-2">
							<div className="flex min-w-0 flex-1 items-center gap-1">
								<div {...dragHandleProps} className="mr-1 shrink-0 cursor-pointer">
									<PiDotsSixVerticalBold size={18} />
								</div>
								<div className="flex min-w-0 items-center gap-1">
									<h2 className="font-inter text-sm font-medium leading-tight text-brand-dark sm:text-base">
										{groupName}
									</h2>

									<AppTooltip
										text={
											ADMIN_NOTIFICATION_TOOLTIP[value as NOTIFICATION_TYPE] ?? "No additional information available"
										}
										trigger={<LuInfo className="cursor-pointer text-brand-dark50 hover:text-brand-dark" />}
									/>
								</div>
							</div>
							<div className="flex items-center">
								<span
									className={`mr-2 flex h-4 w-4 items-center justify-center rounded-full text-[8px] font-semibold ${
										unreadCount > 0 ? "bg-red-500 text-white dark:bg-red-600" : "bg-gray-200 text-brand-dark"
									}`}
								>
									{unreadCount}
								</span>
								<CollapsibleTrigger asChild>
									<button className="flex items-center justify-center rounded p-1 hover:bg-gray-100">
										<ChevronDown className="h-4 w-4 shrink-0 text-brand-dark50 transition-transform group-data-[state=open]/collapsible:rotate-180" />
									</button>
								</CollapsibleTrigger>

								<Button
									onClick={() =>
										setParams({
											activeGroup: value,
											notificationTypes: [value as NOTIFICATION_TYPE],
											moduleGroups: null,
										})
									}
									className="text-brand-primary shrink-0 px-2 text-sm font-medium hover:underline"
								>
									{tschedule.seeAll}
								</Button>
							</div>
						</div>

						{!isAnyDragging && (
							<CollapsibleContent>
								<div
									className={`space-y-3 ${
										items.length === 0
											? "flex flex-1 items-center justify-center text-center"
											: "max-h-[280px] overflow-y-auto py-2"
									}`}
								>
									{items.length === 0 && !isLoading && (
										<div className="flex min-h-[120px] items-center justify-center">
											<p className="self-center text-sm text-brand-dark50">{tschedule.noNotificationsFound}</p>
										</div>
									)}
									{isLoading && (
										<div className="flex min-h-[120px] items-center justify-center">
											<Spinner />
										</div>
									)}
									{items.map((notification, i) => (
										<NotificationCard key={`${groupName}-${notification.id}-${i}`} notification={notification} />
									))}
								</div>
							</CollapsibleContent>
						)}
					</Collapsible>
				)}
			/>
		</div>
	);
};

export default NotificationGrops;
