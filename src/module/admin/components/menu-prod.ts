// AdminMenus.tsx
"use client";

import { routes } from "@/config/routes";
import type { NestedSidebarItem } from "@/types";
import {
	HiCalendar,
	HiOutlineCalendarDays,
	HiOutlineCurrencyDollar,
	HiOutlineExclamationTriangle,
} from "react-icons/hi2";

// React‑Icons Heroicons outline
import {
	HiOutlineHome,
	HiOutlineCalendar,
	HiOutlineUserGroup,
	HiOutlineClock,
	HiOutlineOfficeBuilding,
	HiOutlineCog,
	HiOutlineChartBar,
	HiOutlineDocumentReport,
	HiOutlineDocumentAdd,
	HiOutlineFolder,
} from "react-icons/hi";
import { BellIcon } from "lucide-react";

import { MODULE } from "@/utils/enums";
import { MdOutlinePolicy } from "react-icons/md";
import { RiAlarmWarningLine, RiUserFollowLine } from "react-icons/ri";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
import { PiClockCounterClockwise } from "react-icons/pi";
import {
	BuilderIconImage,
	FleetIconImage,
	MapIconImage,
	MaterialIconImage,
	MaterialRequestIconImage,
	PayrollIconImage,
	ProjectIconImage,
	ReportIconImage,
} from "@/components/ui/all-icons";
import { TbDeviceDesktopCode } from "react-icons/tb";

export const useAdminMenuProd = () => {
	const tCommon = useTypedTranslations(NAMESPACE.COMMON);

	const AdminMenus: NestedSidebarItem[] = [
		{
			title: tCommon.notifications,
			icon: BellIcon,
			url: routes.admin.notification,
			badgeCount: 5, // dummy data for now
		},

		{
			title: tCommon.dashboard,
			icon: HiOutlineHome,
			url: routes.admin.dashboard,
			moduleKey: MODULE.DASHBOARD,
		},
		{
			title: tCommon.scheduleManagement,
			icon: HiOutlineCalendar,
			items: [
				{
					title: tCommon.weeklySchedule,
					icon: HiOutlineCalendar,
					url: routes.admin.weeklySchedule,
					moduleKey: MODULE.WEEKLY_SCHEDULE,
				},
				{
					title: tCommon.employeeRoster,
					icon: HiOutlineCalendarDays,
					url: routes.admin.roster,
					moduleKey: MODULE.WEEKLY_SCHEDULE,
				},
				{
					title: "Payroll",
					icon: PayrollIconImage,
					url: routes.admin.payroll,
				},
				// TODO: Just Hide, needs to un-hide once this module actually functional.
				// {
				// 	title: "Jobs & Phases",
				// 	icon: HiOutlineBriefcase,
				// 	url: routes.admin.jobsAndPhases,
				//  moduleKey: MODULE.JOBS_AND_PHASES,
				// },
				{
					title: tCommon.timeLogs,
					icon: HiOutlineClock,
					url: routes.admin.timeLogs,
					moduleKey: MODULE.TIME_LOGS,
				},
				{
					title: "Attendance Records",
					icon: RiUserFollowLine,
					url: routes.admin.attendanceRecords,
					moduleKey: MODULE.TIME_LOGS,
				},
				{
					title: tCommon.timeRequest,
					icon: PiClockCounterClockwise,
					url: routes.admin.timeRequests,
				},
				{
					title: tCommon.timeVariance,
					icon: HiOutlineExclamationTriangle,
					url: routes.admin.timeVariance,
				},
				{
					title: tCommon.travelPay,
					icon: HiOutlineCurrencyDollar,
					url: routes.admin.travelPay,
				},
			],
		},
		// TODO: Just Hide, needs to un-hide once this module actually functional.
		// {
		// 	title: "Readiness & Quality",
		// 	icon: HiOutlineCheckCircle,
		// 	items: [
		// 		{
		// 			title: "Confirmed Ready",
		// 			icon: HiOutlineUserGroup,
		// 			url: "#",
		// 		},
		// 		{
		// 			title: "QC Tracker",
		// 			icon: HiOutlineClipboardCheck,
		// 			url: "#",
		// 		},
		// 	],
		// },

		{
			title: tCommon.peopleManagement,
			icon: HiOutlineUserGroup,
			items: [
				{
					title: tCommon.crew,
					icon: HiOutlineUserGroup,
					url: routes.admin.crew,
					moduleKey: MODULE.CREW_LIST,
				},
				{
					title: tCommon.employees,
					icon: HiOutlineUserGroup,
					url: routes.admin.employees,
					moduleKey: MODULE.EMPLOYEES_LIST,
				},
				{
					title: tCommon.roleManagement,
					icon: HiOutlineUserGroup,
					url: routes.admin.roles,
					moduleKey: MODULE.EMPLOYEES_LIST,
				},
				{
					title: tCommon.subContractor,
					icon: HiOutlineOfficeBuilding,
					url: routes.admin.subContractor,
					moduleKey: MODULE.SUB_CONTRACTOR,
				},
				{
					title: tCommon.attendance,
					icon: HiCalendar,
					items: [
						{
							title: "Dashboard",
							icon: HiOutlineChartBar,
							url: routes.admin.attendanceDashboard,
						},
						{
							title: "Records & Approvals",
							icon: HiOutlineDocumentReport,
							url: routes.admin.attendanceRecordsApprovals,
						},
						{
							title: "Create New Record",
							icon: HiOutlineDocumentAdd,
							url: routes.admin.attendanceCreateNewRecord,
						},
						{
							title: "Policies",
							icon: MdOutlinePolicy,
							url: routes.admin.attendancePolicies,
						},
					],
				},
			],
		},
		{
			key: "builderCommunications",
			title: "Project",
			icon: ProjectIconImage,
			url: "#",
			moduleKey: MODULE.BUILDER_COMMUNICATIONS,
			items: [
				{
					title: "Builder Communications",
					icon: BuilderIconImage,
					moduleKey: MODULE.BUILDER_COMMUNICATIONS,
					url: routes.admin.builderComms,
				},

				{
					title: "Project Map",
					icon: MapIconImage,
					url: routes.admin.projectMap,
				},
			],
		},
		{
			key: "fleet",
			title: "Fleet",
			icon: FleetIconImage,
			url: "#",
			moduleKey: MODULE.FLEET,
			items: [
				{
					title: "Geotab Exception Events",
					icon: ReportIconImage,
					url: routes.admin.gpsExceptionEvents,
				},
			],
		},

		{
			title: tCommon.safetyManagement,
			icon: RiAlarmWarningLine,
			moduleKey: MODULE.SAFETY_MANAGEMENT,
			items: [
				{
					title: "Driving Safety",
					icon: HiOutlineFolder,
					items: [
						{
							title: "Dashboard",
							icon: HiOutlineChartBar,
							url: routes.admin.drivingSafetyDashboard,
						},
						{
							title: "Add New Record",
							icon: HiOutlineDocumentAdd,
							url: routes.admin.drivingSafetyAddNewRecord,
						},
						{
							title: "Incident Reports",
							icon: HiOutlineDocumentReport,
							url: routes.admin.drivingSafetyIncidentReports,
						},
						{
							title: "Policies",
							icon: MdOutlinePolicy,
							url: routes.admin.drivingSafetyPolicies,
						},
					],
				},
				{
					title: "Job Site Safety",
					icon: HiOutlineFolder,
					items: [
						{
							title: "Dashboard",
							icon: HiOutlineChartBar,
							url: routes.admin.jobSiteSafetyDashboard,
						},
						{
							title: "Add New Record",
							icon: HiOutlineDocumentAdd,
							url: routes.admin.jobSiteSafetyAddNewRecord,
						},
						{
							title: "Incident Reports",
							icon: HiOutlineDocumentReport,
							url: routes.admin.jobSiteSafetyIncidentReports,
						},
					],
				},
			],
		},
		{
			key: "material",
			title: "Material",
			icon: MaterialIconImage,
			url: "#",
			moduleKey: MODULE.REPORTS_AND_EXPORTS,
			items: [
				{
					title: "Material Review",
					icon: MaterialRequestIconImage,
					url: routes.admin.materialRequests,
				},
				{
					title: tCommon.storageUnitReport,
					icon: MdOutlinePolicy,
					url: routes.admin.storageUnitReport,
				},
				{
					title: "Reports",
					icon: ReportIconImage,
					url: "#",
				},
			],
		},

		{
			title: tCommon.reportsAndExports,
			icon: HiOutlineChartBar,
			url: "#",
			moduleKey: MODULE.REPORTS_AND_EXPORTS,
			items: [
				{
					title: tCommon.storageUnitReport,
					icon: MdOutlinePolicy,
					url: routes.admin.storageUnitReport,
				},
			],
		},
		{
			key: "legacy",
			title: "Legacy",
			icon: TbDeviceDesktopCode,
			url: routes.admin.legacy,
		},
		{
			title: tCommon.settings,
			icon: HiOutlineCog,
			url: "#",
		},
	];
	return AdminMenus;
};
