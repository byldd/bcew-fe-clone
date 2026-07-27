"use client";

import { Button } from "@/components/ui/button";
import { FiSearch } from "react-icons/fi";
import { useGetUserRosterForWeek } from "@/module/schedule-management/roster-time-configuration/hooks/useRoster";
import EmployeeTimeConfigDatePick from "@/module/schedule-management/roster-time-configuration/components/employee-time-config-date-pick";
import { useEmployeeTimeConfigParams } from "@/module/schedule-management/roster-time-configuration/hooks/useEmployeeTimeConfigParams";
import ErrorMessageComponent from "@/components/get-error-message";
import { useTeams } from "@/module/team/hooks/useTeams";
import { DataTable } from "@/components/shared/datatable/datatable";
import { employeeTimeConfigColumns } from "@/module/schedule-management/roster-time-configuration/utils/column";
import { ITeam } from "@/module/team/types";
import { sortTeamsByDisplayOrder } from "@/module/schedule-management/roster-time-configuration/utils";
import SectionHeader from "@/components/shared/section-header";
import { dateToUTCString, toFormattedDate } from "@/lib/utils/date";
import { DATE_FORMAT } from "@/types/date";
import { useEffect, useMemo, useState } from "react";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
import { cn } from "@/lib/utils/utils";
import { IUserRoster } from "@/module/schedule-management/roster-time-configuration/types";

const ALL_EMPLOYEES_KEY = "all";

const EmployeeTimeConfig = () => {
	const { getParams, setParams } = useEmployeeTimeConfigParams();
	const { startDate, endDate, activeTeam, userId, employeeId } = getParams;
	const { data: teams } = useTeams();
	const tSchedule = useTypedTranslations(NAMESPACE.SCHEDULE);
	const tCommon = useTypedTranslations(NAMESPACE.COMMON);
	const tEmployee = useTypedTranslations(NAMESPACE.EMPLOYEE_ROSTER);

	const [search, setSearch] = useState("");

	// If All Employees is selected, exclude activeTeam in query
	const {
		data: employeeTimeConfigurations,
		isLoading,
		error,
		isError,
	} = useGetUserRosterForWeek({
		startDate: dateToUTCString(startDate),
		endDate: dateToUTCString(endDate),
		activeTeam: activeTeam === ALL_EMPLOYEES_KEY ? undefined : activeTeam,
		userId,
	});

	// Once data is available, apply frontend filtering
	const filteredData = useMemo(() => {
		if (!employeeTimeConfigurations?.items) return [];
		if (!search.trim()) return employeeTimeConfigurations.items;

		const searchTerm = search.toLowerCase();
		return employeeTimeConfigurations.items.filter((item) => item.name.toLowerCase().includes(searchTerm));
	}, [employeeTimeConfigurations, search]);

	// If search starts while userId is active (only single record shown),
	// clear userId first so backend refetches full list
	useEffect(() => {
		if (search.trim() && userId) {
			setParams({ userId: undefined });
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [search]);

	// Auto-scroll to the highlighted employee row when navigating from a notification
	useEffect(() => {
		if (!employeeId || !filteredData.length) return;
		const timer = setTimeout(() => {
			const el = document.getElementById(employeeId);
			if (el) {
				el.scrollIntoView({ behavior: "smooth", block: "center" });
			}
		}, 100);
		return () => clearTimeout(timer);
	}, [employeeId, filteredData]);

	const activeTeamTiming = (selectedTeam: ITeam | undefined) => {
		if (!selectedTeam || !selectedTeam?.dayStartTime || !selectedTeam?.dayEndTime) return;
		const timeRange = `${toFormattedDate(selectedTeam.dayStartTime, DATE_FORMAT.HH_MM_AA_PM)} - ${toFormattedDate(
			selectedTeam.dayEndTime,
			DATE_FORMAT.HH_MM_AA_PM
		)}`;
		return <p className="py-1 text-sm font-medium text-gray-500">(Team Standard Hours: {timeRange})</p>;
	};

	if (isError) return ErrorMessageComponent({ error });

	return (
		<div className="min-h-screen w-full bg-white pb-2">
			{/* Header Section */}

			<SectionHeader title={tCommon.employeeRoster} />

			{/* Tabs */}
			{teams && teams.length > 0 && (
				<div className="no-scrollbar overflow-x-auto px-2 py-4">
					<div className="flex min-w-max items-center gap-2">
						<Button
							variant={activeTeam === ALL_EMPLOYEES_KEY || !activeTeam ? "filled" : "outline"}
							onClick={() => setParams({ activeTeam: ALL_EMPLOYEES_KEY })}
						>
							All Employees
						</Button>

						{sortTeamsByDisplayOrder(teams).map((team) => (
							<Button
								key={team.id}
								variant={team.id === activeTeam ? "filled" : "outline"}
								onClick={() => setParams({ activeTeam: team.id })}
							>
								{team.name}
							</Button>
						))}
					</div>
				</div>
			)}

			{/* Subtitle + Date */}
			<div className="flex flex-col gap-3 px-2 pb-4 sm:flex-row sm:items-center sm:justify-between">
				{/* Title */}
				<div>
					<p className="mt-2 text-[20px] font-semibold text-brand-dark">
						{tEmployee.timeConfigurationFor}{" "}
						{activeTeam === ALL_EMPLOYEES_KEY || !activeTeam
							? "all employees"
							: teams?.find((t) => t.id === activeTeam)?.name}
					</p>
					{activeTeam && activeTeam !== ALL_EMPLOYEES_KEY && activeTeamTiming(teams?.find((t) => t.id === activeTeam))}
				</div>

				{/* Search + date — single scrollable row on mobile */}
				<div className="no-scrollbar overflow-x-auto">
					<div className="flex min-w-max items-center gap-2">
						<div className="relative">
							<FiSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-dark50" />
							<input
								type="text"
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								placeholder={tSchedule.searchByEmployeeName}
								className="h-10 w-[240px] rounded-[8px] border border-brand-dark10 bg-white pl-9 pr-3 text-sm outline-none"
							/>
						</div>
						<EmployeeTimeConfigDatePick />
					</div>
				</div>
			</div>

			<div className="overflow-x-auto">
				<DataTable
					columns={employeeTimeConfigColumns}
					data={filteredData}
					isLoading={isLoading}
					useSectionHeader={false}
					showGridLines
					stickyHeaderMode
					className="flex h-full flex-col"
					rowClassName={(row: IUserRoster) =>
						cn(employeeId && row.id === employeeId ? "bg-brand-bgLightgrey" : "hover:bg-gray-50")
					}
				/>
			</div>
		</div>
	);
};

export default EmployeeTimeConfig;
