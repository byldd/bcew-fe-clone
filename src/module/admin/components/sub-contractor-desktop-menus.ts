// AdminMenus.tsx
"use client";

import { routes } from "@/config/routes";
import type { SidebarItem } from "@/types";

// React‑Icons Heroicons outline
import { HiOutlineCalendar, HiOutlineCog } from "react-icons/hi";

import { MODULE } from "@/utils/enums";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
import {
	BellIconImage,
	CalenderIconImage,
	CrewIconImage,
	DashboardIconImage,
	PeopleIconImage,
} from "@/components/ui/all-icons";

export const useSubContractorAdminDesktopMenus = () => {
	const tCommon = useTypedTranslations(NAMESPACE.COMMON);

	const SubContractorAdminDesktopMenus: SidebarItem[] = [
		{
			title: tCommon.notifications,
			icon: BellIconImage,
			url: routes.subContractorAdminDesktop.notification,
			badgeCount: 5,
		},
		{
			title: tCommon.dashboard,
			icon: DashboardIconImage,
			url: routes.subContractorAdminDesktop.dashboard,
			moduleKey: MODULE.DASHBOARD,
		},
		{
			title: tCommon.scheduleManagement,
			icon: CalenderIconImage,
			items: [
				{
					title: tCommon.weeklySchedule,
					icon: HiOutlineCalendar,
					url: routes.subContractorAdminDesktop.weeklySchedule,
					moduleKey: MODULE.WEEKLY_SCHEDULE,
				},
			],
		},
		{
			title: tCommon.peopleManagement,
			icon: PeopleIconImage,
			items: [
				{
					title: tCommon.crew,
					icon: CrewIconImage,
					url: routes.subContractorAdminDesktop.crew,
					moduleKey: MODULE.CREW_LIST,
				},
			],
		},
		{
			title: tCommon.settings,
			icon: HiOutlineCog,
			url: "#",
		},
	];

	return SubContractorAdminDesktopMenus;
};
