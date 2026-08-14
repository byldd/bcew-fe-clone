import React from "react";
import { routes } from "@/config/routes";
import { LuCalendar, LuSettings } from "react-icons/lu";
import { FiPlus } from "react-icons/fi";
import { IoCarOutline } from "react-icons/io5";
import { PiCurrencyCircleDollar } from "react-icons/pi";
import { MdOutlineHistory, MdOutlineBugReport, MdOutlineHealthAndSafety } from "react-icons/md";
import { HiOutlineRefresh } from "react-icons/hi";
import { TbBox } from "react-icons/tb";
import { MdOutlineLogout } from "react-icons/md";
import { isProductionEnv } from "@/utils";

export interface NavItem {
	label: string;
	icon: React.ReactNode;
	iconBg: string;
	iconColor: string;
	onClick: () => void;
	disabled?: boolean;
	children?: { label: string; onClick: () => void; disabled?: boolean }[];
	topSeparator?: boolean;
}

interface GetNavItemsParams {
	navigate: (path: string) => void;
	handleSignOut: () => void;
	isTimeLogPending?: boolean;
	isWeekendSelfSchedulingAllowed?: boolean;
	isSelfSchedulingAllowed?: boolean;
	setSelfScheduleOpen?: (open: boolean) => void;
}

export const getNavItems = ({
	navigate,
	handleSignOut,
	isTimeLogPending,
	isWeekendSelfSchedulingAllowed,
	isSelfSchedulingAllowed,
	setSelfScheduleOpen,
}: GetNavItemsParams): NavItem[] => [
	{
		label: "Vehicle History",
		icon: <IoCarOutline size={18} />,
		iconBg: "bg-[#B8733315]",
		iconColor: "text-[#B87333]",
		onClick: () => navigate(routes.employee.vehicleHistory),
	},
	{
		label: "Travel Pay",
		icon: <PiCurrencyCircleDollar size={18} />,
		iconBg: "bg-green-100",
		iconColor: "text-green-600",
		onClick: () => navigate(routes.employee.travelPay),
		disabled: isTimeLogPending,
	},
	{
		label: "Self Schedule",
		icon: <FiPlus size={18} />,
		iconBg: "bg-[#15151515]",
		iconColor: "text-brand-dark",
		onClick: () => setSelfScheduleOpen?.(true),
		disabled: isTimeLogPending || (!isSelfSchedulingAllowed && !isWeekendSelfSchedulingAllowed),
	},
	{
		label: "Materials",
		icon: <LuCalendar size={18} />,
		iconBg: "bg-gray-100",
		iconColor: "text-gray-500",
		onClick: () => {},
		disabled: isTimeLogPending,
		children: [
			{
				label: "Request Material",
				onClick: () => navigate(routes.employee.materialRequests),
			},
			{
				label: "Unknown Items",
				onClick: () => navigate(routes.employee.missingItemRequests),
			},
		],
	},

	{
		label: "Safety",
		icon: <MdOutlineHealthAndSafety size={18} />,
		iconBg: "bg-orange-50",
		iconColor: "text-orange-500",
		onClick: () => {},
		children: [
			{
				label: "Report Vehicle Accident",
				onClick: () => navigate(routes.employee.reportVehicleAccident),
			},
			{
				label: "Report Vehicle Breakdown",
				onClick: () => navigate(routes.employee.reportVehicleBreakdown),
			},
			{
				label: "Report Job Site Injury",
				onClick: () => navigate(routes.employee.reportJobSiteInjury),
			},
			{
				label: "My Records",
				onClick: () => navigate(routes.employee.safetyMyRecords),
			},
			{
				label: "Safety Policies",
				onClick: () => navigate(routes.employee.safetyPolicies),
			},
		],
	},
	{
		label: "My History",
		icon: <MdOutlineHistory size={18} />,
		iconBg: "bg-[#78787815]",
		iconColor: "text-grey-600",
		onClick: () => navigate(routes.employee.history),
	},
	{
		label: "Track Technical Issues",
		icon: <MdOutlineBugReport size={18} />,
		iconBg: "bg-blue-50",
		iconColor: "text-blue-500",
		onClick: () => navigate(routes.employee.technicalIssue),
	},

	...(isProductionEnv()
		? []
		: [
				{
					label: "Crate Management",
					icon: <TbBox size={18} />,
					iconBg: "bg-gray-100",
					iconColor: "text-gray-500",
					onClick: () => navigate(routes.employee.crateManagement),
				},
			]),
	{
		label: "My Attendance",
		icon: <LuCalendar size={18} />,
		iconBg: "bg-gray-100",
		iconColor: "text-gray-500",
		onClick: () => window.open(routes.bcew.attendance, "_blank"),
	},
	{
		label: "Settings",
		icon: <LuSettings size={18} />,
		iconBg: "bg-gray-100",
		iconColor: "text-gray-500",
		disabled: true,
		onClick: () => navigate(routes.employee.dashboard),
	},

	{
		label: "Log Out",
		icon: <MdOutlineLogout size={18} />,
		iconBg: "bg-red-50",
		iconColor: "text-red-500",
		onClick: handleSignOut,
	},
	{
		label: "App Updates",
		icon: <HiOutlineRefresh size={18} />,
		iconBg: "bg-purple-100",
		iconColor: "text-purple-500",
		topSeparator: true,
		onClick: () => navigate(routes.employee.releaseNotes),
	},
];
