"use client";

import React, { useEffect, useState, useRef } from "react";
import { useNotificationParam } from "../hook/useNotificationParam";
import {
	useGetAdminNotificationModuleGrouped,
	useUpdateModuleOrder,
} from "@/module/schedule-management/weekly-schedule-management/hooks/useSchedule";
import { toDate, toMidnightDateString } from "@/lib/utils/date";
import { Button } from "@/components/ui/button";
import NotificationCard from "./notification-card";
import { Spinner } from "@/components/ui/spinner";
import { INotificationGroupEntry, MODULE_GROUP, MODULE_GROUP_LABEL, MODULE_GROUP_TOOLTIP } from "../types/type";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
import { DragSortable } from "./dragSortable";
import { PiDotsSixVerticalBold } from "react-icons/pi";
import { IGetAdminNotificationItem } from "@/module/schedule-management/weekly-schedule-management/types/schedule-interface";
import { ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { AppTooltip } from "@/components/ui/tooltip";
import { LuInfo } from "react-icons/lu";

type ExtendedGroupEntry = INotificationGroupEntry<IGetAdminNotificationItem> & {
	unreadCount: number;
};

const NotificationModuleGroups = () => {
	const { getParams, setParams } = useNotificationParam();
	const tschedule = useTypedTranslations(NAMESPACE.SCHEDULE);

	const { date, isRead, moduleGroups, teamId } = getParams();

	const { data, isLoading } = useGetAdminNotificationModuleGrouped({
		pageSize: 20,
		createdAt: date ? toMidnightDateString(toDate(date)) : undefined,
		isRead,
		moduleGroups,
		teamId,
	});

	const { mutate: updateOrder } = useUpdateModuleOrder();
	const debounceRef = useRef<NodeJS.Timeout | null>(null);
	const [groupEntries, setGroupEntries] = useState<ExtendedGroupEntry[]>([]);

	useEffect(() => {
		if (!data?.items) return;

		const entries: ExtendedGroupEntry[] = data.items.map((group) => ({
			id: group.group,
			groupName: MODULE_GROUP_LABEL[group.group as keyof typeof MODULE_GROUP_LABEL],
			items: group.items,
			value: group.group,
			unreadCount: group.unreadCount,
		}));

		setGroupEntries(entries);
	}, [data]);

	return (
		<div className="max-h-full space-y-6 overflow-y-auto">
			<DragSortable
				items={groupEntries}
				onChange={(newOrder) => {
					setGroupEntries(newOrder);

					if (debounceRef.current) {
						clearTimeout(debounceRef.current);
					}

					debounceRef.current = setTimeout(() => {
						updateOrder({
							order: newOrder.map((g) => g.value as MODULE_GROUP),
							groupBy: "module",
						});
					}, 400);
				}}
				getId={(g) => g.id}
				className="columns-1 gap-5 xl:columns-2"
				renderItem={({ groupName, items, value, unreadCount }, _, dragHandleProps, isAnyDragging) => (
					<Collapsible className="group/collapsible mb-5 flex break-inside-avoid flex-col rounded-[20px] border bg-white px-4 shadow-sm">
						{/* Header */}
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
										text={MODULE_GROUP_TOOLTIP[value as MODULE_GROUP] ?? "No additional information available"}
										trigger={<LuInfo size={16} className="cursor-pointer text-brand-dark50 hover:text-brand-dark" />}
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
											moduleGroups: [value as MODULE_GROUP],
											notificationTypes: null,
										})
									}
									className="text-brand-primary px-2 text-sm font-medium hover:underline"
								>
									{tschedule.seeAll}
								</Button>
							</div>
						</div>

						{/* Body */}
						{!isAnyDragging && (
							<CollapsibleContent>
								<div
									className={`space-y-3 ${
										items.length === 0
											? "flex flex-1 items-center justify-center text-center"
											: "max-h-[280px] overflow-y-auto py-2"
									}`}
								>
									{isLoading && (
										<div className="flex min-h-[120px] items-center justify-center">
											<Spinner />
										</div>
									)}

									{!isLoading && items.length === 0 && (
										<div className="flex min-h-[120px] items-center justify-center">
											<p className="self-center text-sm text-brand-dark50">{tschedule.noNotificationsFound}</p>
										</div>
									)}

									{items.map((notification, i) => (
										<NotificationCard
											key={`${groupName}-${notification.id}-${i}`}
											notification={notification}
											hideHeader={value === MODULE_GROUP.TECHNICAL_ISSUE}
										/>
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

export default NotificationModuleGroups;
