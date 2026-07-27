"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import EmployeeRosterWeekDateRangePicker from "@/module/employee/components/employee-roster-week-date-range-picker";
import { TimeSource } from "@/module/schedule-management/roster-time-configuration/enums";
import { useEmployeeWeeklyRoster } from "@/module/employee/hooks/useEmployee";
import { extractUTCDayAndTime } from "@/module/schedule-management/time-logs-management/utils";
import { getWeekRangeForDate, totalHours } from "@/module/employee/utils";
import { DataTable } from "@/components/shared/datatable/datatable";
import { useEmployeeRosterTimeConfigColumns } from "@/module/employee/utils/employee-roster-time-config-columns";
import Link from "next/link";
import { routes } from "@/config/routes";
import { FiExternalLink } from "react-icons/fi";
import { dateToUTCString } from "@/lib/utils/date";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";

interface StandardWorkingHoursCardProps {
	employeeUserId: string;
}

export default function StandardWorkingHoursCard({ employeeUserId }: StandardWorkingHoursCardProps) {
	const initialWeek = getWeekRangeForDate(new Date());
	const [startDate, setStartDate] = useState<Date>(initialWeek.startDate);
	const [endDate, setEndDate] = useState<Date>(initialWeek.endDate);
	const tPeople = useTypedTranslations(NAMESPACE.PEOPLE_MANAGEMENT);
	const column = useEmployeeRosterTimeConfigColumns();
	const { data } = useEmployeeWeeklyRoster(employeeUserId, {
		startDate: dateToUTCString(startDate),
		endDate: dateToUTCString(endDate),
	});

	return (
		<Card className="rounded-3xl border border-brand-dark10 bg-white !p-7">
			<CardHeader className="mb-4 p-0">
				<CardTitle className="flex flex-col gap-3 text-xl font-semibold sm:flex-row sm:items-center sm:justify-between">
					<div className="flex-col gap-4">
						{tPeople.standardWorkingHours}{" "}
						<span className="font-inter text-xl font-semibold text-brand-dark50">
							{data?.timeSource === TimeSource.TEAM
								? `(${"Team Standard Hours"})`
								: data?.timeSource === TimeSource.ROLE
									? `(${"Role Standard Hours"})`
									: data?.timeSource === TimeSource.CUSTOM
										? `(${"Customized Working Hours"})`
										: ""}
						</span>
						{data?.timeSource === TimeSource.CUSTOM && (
							<p className="mt-2 text-sm text-gray-500">
								Customize working hours in{" "}
								<Link
									href={`${routes?.admin?.roster}?userId=${employeeUserId}`}
									className="text-sm font-bold text-gray-600 underline"
								>
									{tPeople.employeesTimeConfigurationScreen}
								</Link>
							</p>
						)}
					</div>

					{/* Date Range Picker */}
					<div className="flex items-center space-x-2">
						<EmployeeRosterWeekDateRangePicker
							startDate={startDate}
							endDate={endDate}
							onWeekChange={(newStart, newEnd) => {
								setStartDate(newStart);
								setEndDate(newEnd);
							}}
						/>
						<div className="flex h-10 min-w-[40px] items-center justify-center rounded-[10px] border border-brand-dark10 bg-white text-lg font-semibold">
							<Link
								href={`${routes?.admin?.roster}?userId=${employeeUserId}`}
								className="flex h-full w-full items-center justify-center"
							>
								<FiExternalLink className="!size-5" />
							</Link>
						</div>
					</div>
				</CardTitle>
			</CardHeader>

			<CardContent className="p-0">
				{data?.dayRoster ? (
					<div className="flex flex-wrap items-start gap-6 sm:gap-10">
						<div>
							<p className="mb-2 text-xs font-medium text-brand-dark50">{tPeople.dayStartTime}</p>
							<p className="text-xs font-semibold text-brand-dark">
								{extractUTCDayAndTime(data?.dayRoster?.dayStartTime)}
							</p>
						</div>
						<div>
							<p className="mb-2 text-xs font-medium text-brand-dark50">{tPeople.dayEndTime}</p>
							<p className="text-xs font-semibold text-brand-dark">
								{extractUTCDayAndTime(data?.dayRoster?.dayEndTime)}
							</p>
						</div>
						<div>
							<p className="mb-2 text-xs font-medium text-brand-dark50">Total Hours</p>
							<p className="text-xs font-semibold text-brand-dark">
								{totalHours(data?.dayRoster?.dayStartTime, data?.dayRoster?.dayEndTime)}
							</p>
						</div>
					</div>
				) : data?.weekRoster ? (
					<DataTable
						showGridLines
						stickyHeaderMode
						useSectionHeader={false}
						columns={column}
						data={data?.weekRoster || []}
					/>
				) : (
					<div>{tPeople.scheduleNotCreatedForWeek}</div>
				)}
			</CardContent>
		</Card>
	);
}
