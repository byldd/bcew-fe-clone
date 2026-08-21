"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";

import SectionHeader from "@/components/shared/section-header";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { routes } from "@/config/routes";
import { dateToUTCString } from "@/lib/utils/date";
import { ADD_RECORD_TAB, ADD_RECORD_TAB_PARAM } from "@/module/admin-driving-safety/enums";

import IncidentReports from "../../incident-reports/templates/incident-reports";
import DashboardStatCards from "../components/dashboard-stat-cards";
import IncidentsBySeverityChart from "../components/incidents-by-severity-chart";
import IncidentsByTypeChart from "../components/incidents-by-type-chart";
import { useDrivingSafetyDashboard } from "../hooks/useDrivingSafetyDashboard";
import { useDrivingSafetyDashboardParams } from "../hooks/useDrivingSafetyDashboardParams";
import { IDashboardDateRange } from "../types";
import WriteAccessWrapper from "@/module/admin/components/write-access-wrapper";

const DrivingSafetyDashboard = () => {
	const router = useRouter();
	const { getParams, setParams } = useDrivingSafetyDashboardParams();
	const { startDate, endDate } = getParams();

	const goToCreateViolation = () =>
		router.push(
			`${routes.admin.drivingSafetyAddNewRecord}?${ADD_RECORD_TAB_PARAM}=${ADD_RECORD_TAB.DRIVING_SAFETY_VIOLATION}`
		);

	const range = useMemo<IDashboardDateRange>(
		() => ({
			startDate: startDate ? dateToUTCString(startDate) : undefined,
			endDate: endDate ? dateToUTCString(endDate) : undefined,
		}),
		[startDate, endDate]
	);

	const { data, isLoading } = useDrivingSafetyDashboard(range);

	return (
		<div className="space-y-6">
			<SectionHeader
				title="Driving Safety"
				actions={
					<>
						<DatePicker
							mode="range"
							placeholder="Select Date"
							alwaysShowLabel
							selected={{ from: startDate ?? undefined, to: endDate ?? undefined }}
							onSelect={(value) => {
								if (!value?.from) {
									setParams({ startDate: null, endDate: null });
									return;
								}
								setParams({ startDate: value.from, endDate: value.to ?? null });
							}}
							onClear={() => setParams({ startDate: null, endDate: null })}
							required={false}
							className="!h-10 w-[180px] border border-brand-dark10 !bg-white text-sm shadow-none"
						/>
						<WriteAccessWrapper>
							<Button type="button" variant="filled" onClick={goToCreateViolation}>
								Create Driving Safety Violation
							</Button>
						</WriteAccessWrapper>
					</>
				}
			/>

			<DashboardStatCards summary={data?.summary} isLoading={isLoading} />

			<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
				<IncidentsByTypeChart data={data?.violationTypeBreakdown} isLoading={isLoading} />
				<IncidentsBySeverityChart data={data?.severityBreakdown} isLoading={isLoading} />
			</div>

			<IncidentReports
				range={range}
				title="Incident Reports — Accidents, Violations & Breakdowns"
				titleClassName="text-sm font-semibold text-brand-dark"
				showTabs={false}
				hideSidebarToggle
			/>
		</div>
	);
};

export default DrivingSafetyDashboard;
