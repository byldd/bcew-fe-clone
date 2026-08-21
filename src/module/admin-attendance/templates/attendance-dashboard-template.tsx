"use client";

import SectionHeader from "@/components/shared/section-header";
import { DatePicker } from "@/components/ui/date-picker";
import { useAttendanceDashboard } from "../hooks/useAttendanceDashboard";
import { useAttendanceDashboardParams } from "../hooks/useAttendanceDashboardParams";
import AttendanceStatCards from "../components/attendance-stat-cards";
import AttendanceTopTypesPanel from "../components/attendance-top-types-panel";
import AttendanceSummaryPanel from "../components/attendance-summary-panel";
import AttendancePolicyLadderPanel from "../components/attendance-policy-ladder-panel";
import AttendancePendingApprovalTable from "../components/attendance-pending-approval-table";

const AttendanceDashboardTemplate = () => {
	const { getParams, setParams } = useAttendanceDashboardParams();
	const { startDate, endDate } = getParams();

	const { data, isLoading } = useAttendanceDashboard(startDate, endDate);

	return (
		<div className="space-y-6">
			<SectionHeader
				title="Attendance Dashboard"
				actions={
					<DatePicker
						mode="range"
						placeholder="Select Date"
						alwaysShowLabel
						selected={{ from: startDate ?? undefined, to: endDate ?? undefined }}
						onSelect={(value) => setParams({ startDate: value?.from ?? null, endDate: value?.to ?? null, page: 1 })}
						onClear={() => setParams({ startDate: null, endDate: null, page: 1 })}
						required={false}
						className="!h-10 w-[160px] border border-brand-dark10 !bg-white text-sm shadow-none"
					/>
				}
			/>

			{data && (
				<>
					<AttendanceStatCards stats={data.stats} />

					<div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
						<AttendanceTopTypesPanel topTypes={data.topTypes} />
						<AttendanceSummaryPanel title="Point Assessment Summary" items={data.pointAssessmentSummary} />
						<AttendancePolicyLadderPanel title="Point Assessment Summary (2026)" items={data.pointEscalationPolicy} />
					</div>
				</>
			)}

			<AttendancePendingApprovalTable data={data?.pendingApprovals ?? []} isLoading={isLoading} />
		</div>
	);
};

export default AttendanceDashboardTemplate;
