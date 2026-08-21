// AdminMenus.tsx
"use client";

import { routes } from "@/config/routes";
import type { SidebarItem } from "@/types";

// React‑Icons Heroicons outline
import { HiOutlineCalendar, HiOutlineCog, HiOutlineDocumentAdd } from "react-icons/hi";

import { MODULE } from "@/utils/enums";
import { MdOutlinePolicy } from "react-icons/md";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
import {
	AttendanceIconImage,
	BcewIconImage,
	BellIconImage,
	BuilderIconImage,
	CalenderIconImage,
	CreditCardIconImage,
	CrewIconImage,
	DashboardIconImage,
	EmployessIconImage,
	FinanceIconImage,
	FleetIconImage,
	HumanResourcesIconImage,
	JobDetailsIconImage,
	JobSetupIconImage,
	MapIconImage,
	MaterialIconImage,
	MaterialRequestIconImage,
	PayrollIconImage,
	PeopleIconImage,
	PolicyIconImage,
	ProjectIconImage,
	ReportIconImage,
	RoleIconImage,
	SafetyIconImage,
	SubContractorIconImage,
	TimeRequestIconImage,
	TimeVarianceIconImage,
	TrainingIconImage,
	TrainingInformationIconImage,
	TravelPayIconImage,
	TroubleshootingIconImage,
	VehicleIconImage,
} from "@/components/ui/all-icons";
import { CgLoadbarDoc } from "react-icons/cg";
import { FiClock } from "react-icons/fi";
import { RiUserFollowLine } from "react-icons/ri";
import { TbDeviceDesktopCode } from "react-icons/tb";

export const useAdminMenu = () => {
	const tCommon = useTypedTranslations(NAMESPACE.COMMON);

	const AdminMenus: SidebarItem[] = [
		{
			key: "notifications",
			title: tCommon.notifications,
			icon: BellIconImage,
			url: routes.admin.notification,
			badgeCount: 5, // dummy data for now
		},

		{
			key: "dashboard",
			title: tCommon.dashboard,
			icon: DashboardIconImage,
			url: routes.admin.dashboard,
			moduleKey: MODULE.DASHBOARD,
		},
		{
			key: "fleet",
			title: "Fleet",
			icon: FleetIconImage,
			url: "#",
			moduleKey: MODULE.FLEET,
			items: [
				{
					title: "Vehicle",
					icon: VehicleIconImage,
					url: "#",
				},
				{
					title: "Reports",
					icon: ReportIconImage,
					url: "#",
				},
				{
					title: "Geotab Exception Events",
					icon: ReportIconImage,
					url: routes.admin.gpsExceptionEvents,
				},
			],
		},
		{
			key: "finance",
			title: "Finance",
			icon: FinanceIconImage,
			url: "#",
			moduleKey: MODULE.FINANCE,
			items: [
				{
					title: "Credit Card",
					icon: CreditCardIconImage,
					url: "#",
				},
				{
					title: "Reports",
					icon: ReportIconImage,
					url: "#",
				},
			],
		},
		{
			key: "reportsAndExports",
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
			key: "peopleManagement",
			title: tCommon.peopleManagement,
			icon: PeopleIconImage,
			items: [
				{
					title: tCommon.crew,
					icon: CrewIconImage,
					url: routes.admin.crew,
					moduleKey: MODULE.CREW_LIST,
				},
				{
					title: tCommon.employees,
					icon: EmployessIconImage,
					url: routes.admin.employees,
					moduleKey: MODULE.EMPLOYEES_LIST,
				},
				{
					title: "Team Management",
					icon: EmployessIconImage,
					url: routes.admin.teams,
					moduleKey: MODULE.EMPLOYEES_LIST,
				},
				{
					title: tCommon.roleManagement,
					icon: RoleIconImage,
					url: routes.admin.roles,
					moduleKey: MODULE.EMPLOYEES_LIST,
				},
				{
					title: tCommon.subContractor,
					icon: SubContractorIconImage,
					url: routes.admin.subContractor,
					moduleKey: MODULE.SUB_CONTRACTOR,
				},
				{
					title: "Attendance Dashboard",
					icon: AttendanceIconImage,
					url: routes.admin.attendanceDashboard,
				},
				{
					title: "Records & Approvals",
					icon: ReportIconImage,
					url: routes.admin.attendanceRecordsApprovals,
				},
				{
					title: "Create New Record",
					icon: HiOutlineDocumentAdd,
					url: routes.admin.attendanceCreateNewRecord,
				},
				{
					title: "Policies",
					icon: PolicyIconImage,
					url: routes.admin.attendancePolicies,
				},
				{
					title: "Human Resources",
					icon: HumanResourcesIconImage,
					url: "#",
				},
				{
					title: "Reports",
					icon: ReportIconImage,
					url: "#",
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
					title: "Job Details",
					icon: JobDetailsIconImage,
					moduleKey: MODULE.BUILDER_COMMUNICATIONS,
					url: routes.admin.jobLevelDetails,
				},
				{
					title: "Job Reports",
					icon: ReportIconImage,
					url: "#",
				},
				{
					title: "Job Setup",
					icon: JobSetupIconImage,
					url: "#",
				},
				{
					title: "Map",
					icon: MapIconImage,
					url: routes.admin.projectMap,
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
			key: "safetyManagement",
			title: tCommon.safetyManagement,
			icon: SafetyIconImage,
			moduleKey: MODULE.SAFETY_MANAGEMENT,
			items: [
				{
					title: tCommon.safetyPolicy,
					icon: PolicyIconImage,
					url: routes.bcew.safetyPolicy,
					newTab: true,
				},
				{
					title: tCommon.incidentReports,
					icon: ReportIconImage,
					url: routes.bcew.safetyIncidents,
					newTab: true,
				},
				{
					title: "Dashboard",
					icon: ReportIconImage,
					url: routes.admin.jobSiteSafetyDashboard,
				},
				{
					title: "Incident Reports",
					icon: ReportIconImage,
					url: routes.admin.jobSiteSafetyIncidentReports,
				},
				{
					title: "Add New Record",
					icon: ReportIconImage,
					url: routes.admin.jobSiteSafetyAddNewRecord,
				},
			],
		},

		{
			key: "scheduleManagement",
			title: tCommon.scheduleManagement,
			icon: CalenderIconImage,
			items: [
				{
					title: tCommon.weeklySchedule,
					icon: HiOutlineCalendar,
					url: routes.admin.weeklySchedule,
					moduleKey: MODULE.WEEKLY_SCHEDULE,
				},
				{
					title: tCommon.employeeRoster,
					icon: CgLoadbarDoc,
					url: routes.admin.roster,
					moduleKey: MODULE.WEEKLY_SCHEDULE,
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
					icon: FiClock,
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
					icon: TimeRequestIconImage,
					url: routes.admin.timeRequests,
				},
				{
					title: tCommon.timeVariance,
					icon: TimeVarianceIconImage,
					url: routes.admin.timeVariance,
				},
				{
					title: tCommon.travelPay,
					icon: TravelPayIconImage,
					url: routes.admin.travelPay,
				},
				{
					title: "Payroll",
					icon: PayrollIconImage,
					url: routes.admin.payroll,
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
			key: "training",
			title: "Training",
			icon: TrainingIconImage,
			url: "#",
			moduleKey: MODULE.TRAINING,
			items: [
				{
					title: "Training Information",
					icon: TrainingInformationIconImage,
					url: "#",
				},
				{
					title: "Troubleshooting",
					icon: TroubleshootingIconImage,
					url: "#",
				},
				{
					title: " Portal Guide",
					icon: BcewIconImage,
					url: "#",
				},
				{
					title: "Training Reports",
					icon: ReportIconImage,
					url: "#",
				},
			],
		},

		{
			key: "settings",
			title: tCommon.settings,
			icon: HiOutlineCog,
			url: "#",
		},
	];
	return AdminMenus;
};
