"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import SectionHeader from "@/components/shared/section-header";
import { routes } from "@/config/routes";
import { DatePicker } from "@/components/ui/date-picker";
import { ADD_RECORD_TAB } from "../enums";
import { useJobSiteSafetyDashboard } from "../hooks/useJobSiteSafetyDashboard";
import { useJobSiteSafetyDashboardParams } from "../hooks/useJobSiteSafetyDashboardParams";
import JobSiteSafetyRecordsTable from "../components/job-site-safety-records-table";
import JobSiteSafetyStatCards from "../components/job-site-safety-stat-cards";
import WriteAccessWrapper from "@/module/admin/components/write-access-wrapper";

const JobSiteSafetyDashboardTemplate = () => {
	const router = useRouter();
	const { getParams, setParams } = useJobSiteSafetyDashboardParams();
	const { startDate, endDate, page, pageSize } = getParams();

	const { data, isLoading } = useJobSiteSafetyDashboard(startDate, endDate);
	const rows = data ?? [];
	const pagedRows = rows.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize);

	return (
		<div className="w-full space-y-4">
			<div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
				<SectionHeader title="Job Site Safety" />

				<div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
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
					<WriteAccessWrapper>
						<Button
							type="button"
							variant="filled"
							className="w-full sm:w-auto"
							onClick={() =>
								router.push(`${routes.admin.jobSiteSafetyAddNewRecord}?tab=${ADD_RECORD_TAB.JOB_SITE_SAFETY_VIOLATION}`)
							}
						>
							Create Job Site Safety Violation
						</Button>
					</WriteAccessWrapper>
				</div>
			</div>

			<JobSiteSafetyStatCards rows={rows} />

			<JobSiteSafetyRecordsTable
				data={pagedRows}
				isLoading={isLoading}
				paginatorOptions={{
					pageSize,
					total: rows.length,
					currentPage: page,
					setPageSize: (size: number) => setParams({ pageSize: size, page: 1 }),
					setPage: (p: number) => setParams({ page: p }),
				}}
			/>
		</div>
	);
};

export default JobSiteSafetyDashboardTemplate;
