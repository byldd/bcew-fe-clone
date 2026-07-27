"use client";

import React from "react";
import { PiCheck } from "react-icons/pi";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNotificationParam } from "../hook/useNotificationParam";

import {
	ADMIN_NOTIFICATION_GROUP,
	SUB_CONTRACTOR_NOTIFICATION_GROUP,
	MODULE_GROUP,
	MODULE_GROUP_LABEL,
	NOTIFICATION_VIEW,
} from "../types/type";

import { NOTIFICATION_TYPE } from "@/types/notification";
import useAuthStore from "@/store/auth-store";
import { ROLES } from "@/types";

const NotificationTypeFilter = () => {
	const { getParams, setParams } = useNotificationParam();
	const { notificationTypes, moduleGroups, view, teamId } = getParams();
	const { user } = useAuthStore((state) => state);

	const isModuleView = view === NOTIFICATION_VIEW.MODULE;

	// =========================
	// TYPE OPTIONS
	// =========================
	const typeEntries: { key: NOTIFICATION_TYPE; value: string }[] = Object.entries(
		user?.userType === ROLES.SUB_CONTRACTOR ? SUB_CONTRACTOR_NOTIFICATION_GROUP : ADMIN_NOTIFICATION_GROUP
	)
		.map(([key, value]) => ({
			key: key as NOTIFICATION_TYPE,
			value,
		}))
		.sort((a, b) => a.value.localeCompare(b.value)); // alphabetical sort

	// =========================
	// MODULE OPTIONS
	// =========================
	const moduleEntries: { key: MODULE_GROUP; value: string }[] = Object.entries(MODULE_GROUP_LABEL)
		.map(([key, value]) => ({
			key: key as MODULE_GROUP,
			value,
		}))
		.sort((a, b) => a.value.localeCompare(b.value)); // alphabetical

	const entries = isModuleView ? moduleEntries : typeEntries;

	// =========================
	// SELECTION CHECK
	// =========================
	const isSelected = (key: string) => {
		if (isModuleView) {
			if (!moduleGroups) return false;
			return moduleGroups.includes(key as MODULE_GROUP);
		}

		if (!notificationTypes) return false;
		return notificationTypes.includes(key as NOTIFICATION_TYPE);
	};

	// =========================
	// HANDLE CLICK
	// =========================
	const handleClick = (key: string) => {
		// MODULE VIEW
		if (isModuleView) {
			if (!moduleGroups) {
				setParams({ moduleGroups: [key as MODULE_GROUP], teamId });
				return;
			}

			if (moduleGroups.includes(key as MODULE_GROUP)) {
				setParams({
					moduleGroups: moduleGroups.filter((g) => g !== key),
					teamId,
				});
				return;
			}

			setParams({
				moduleGroups: [...moduleGroups, key as MODULE_GROUP],
				teamId,
			});
			return;
		}

		// DEFAULT VIEW
		if (!notificationTypes) {
			setParams({ notificationTypes: [key as NOTIFICATION_TYPE], teamId });
			return;
		}

		if (notificationTypes.includes(key as NOTIFICATION_TYPE)) {
			setParams({
				notificationTypes: notificationTypes.filter((t) => t !== key),
				teamId,
			});
			return;
		}

		setParams({
			notificationTypes: [...notificationTypes, key as NOTIFICATION_TYPE],
			teamId,
		});
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					className="relative h-10 w-10 rounded-[8px] border border-brand-dark10 bg-white p-0 hover:bg-white"
					variant="outline"
				>
					<Image src="/assets/svg/filter.svg" alt="filter" width={25} height={25} />

					{((isModuleView && moduleGroups?.length) || (!isModuleView && notificationTypes?.length)) && (
						<span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-brand-dark" />
					)}
				</Button>
			</DropdownMenuTrigger>

			<DropdownMenuContent
				align="end"
				sideOffset={8}
				className="max-h-[60vh] min-w-[260px] overflow-y-auto rounded-[10px] border-none p-1 shadow-[-4px_4px_12px_0px_#21212140] sm:min-w-[300px]"
			>
				{/* ALL */}
				<DropdownMenuItem
					className="cursor-pointer"
					onClick={() =>
						isModuleView ? setParams({ moduleGroups: null, teamId }) : setParams({ notificationTypes: null, teamId })
					}
				>
					All {isModuleView ? "Modules" : "Notifications"}
					{(isModuleView ? !moduleGroups : !notificationTypes) && <PiCheck className="ml-auto h-4 w-4" />}
				</DropdownMenuItem>

				{/* LIST */}
				{entries.map(({ key, value }) => (
					<DropdownMenuItem key={key} className="cursor-pointer" onClick={() => handleClick(key)}>
						{value}
						{isSelected(key) && <PiCheck className="ml-auto h-4 w-4" />}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export default NotificationTypeFilter;
