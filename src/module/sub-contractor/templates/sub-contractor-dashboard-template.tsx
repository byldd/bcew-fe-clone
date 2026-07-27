"use client";

import { WeeklyCalendar } from "@/module/employee-dashboard/components/weekly-calendar";
import { SubContractorJobList } from "@/module/sub-contractor/components/sub-contractor-job-list";
import { SubContractorDashboardHeader } from "@/module/sub-contractor/components/sub-contractor-dashboard-header";

export default function SubContractorDashboardTemplate() {
	return (
		<div className="min-h-screen bg-brand-bgLightgrey">
			<SubContractorDashboardHeader />
			<div className="space-y-4 pb-20 pt-36">
				<WeeklyCalendar />
				<SubContractorJobList />
			</div>
		</div>
	);
}
