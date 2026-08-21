"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import SectionHeader from "@/components/shared/section-header";
import { DataTable } from "@/components/shared/datatable/datatable";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { routes } from "@/config/routes";
import { toDate, toMidnightDateString } from "@/lib/utils/date";
import { useDebounce } from "@/hooks/useDebounce";
import { CRATE_SCAN_ACTION } from "@/module/crate-management/enums";
import { useAdminCrateActivityParams } from "../hooks/useCrateActivityParams";
import {
	useAdminCrateActivity,
	useAdminCrateActivityDetails,
	useAdminCrateActivityEmployees,
	useAdminCrateActivityJobs,
	useAdminCrateActivityProjects,
} from "../hooks/useCrateActivity";
import { useAdminCrateActivityColumns } from "../utils";
import { CRATE_STATUS_LABEL } from "../utils/constants";
import CrateActivitySummaryCards from "../components/crate-activity-summary-cards";
import CrateActivityFilterPopover from "../components/crate-activity-filter-popover";

export default function AdminCrateActivityPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	// Captured once on mount - the filter-reset effect below rewrites the URL from its own
	// known params and would otherwise strip this deep-link id out from under us.
	const [highlightedCrateEventId] = useState(() => searchParams.get("crateEventId"));
	const [search, setSearch] = useState("");
	const debouncedSearch = useDebounce(search, 500);
	const { getParams, setParams, clearDates } = useAdminCrateActivityParams();
	const { jobNums, projectNums, status, technicianIds, startDate, endDate, page, pageSize } = getParams();

	const [projectSearch, setProjectSearch] = useState("");
	const debouncedProjectSearch = useDebounce(projectSearch, 400);
	const { data: projects, isFetching: isProjectsFetching } = useAdminCrateActivityProjects(debouncedProjectSearch);

	const [jobSearch, setJobSearch] = useState("");
	const debouncedJobSearch = useDebounce(jobSearch, 400);
	// Job list is scoped to the selected project(s), if any - matches
	// foreman/material-management/missing-item-requests' job filter.
	const { data: jobs, isFetching: isJobsFetching } = useAdminCrateActivityJobs(debouncedJobSearch, projectNums ?? []);

	const { data: employees } = useAdminCrateActivityEmployees();

	// getParams() re-parses arrays from the URL on every render, so depend on their joined
	// string form here - otherwise the new array reference each render would reset page on every render.
	const jobNumsKey = jobNums?.join("|");
	const projectNumsKey = projectNums?.join("|");
	const statusKey = status?.join("|");
	const technicianIdsKey = technicianIds?.join("|");

	// Reset to page 1 whenever search or filters change
	useEffect(() => {
		setParams({ page: 1 });
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [debouncedSearch, jobNumsKey, projectNumsKey, statusKey, technicianIdsKey, startDate, endDate]);

	const { data, isLoading } = useAdminCrateActivity({
		jobNums,
		projectNums,
		status,
		technicianIds,
		startDate,
		endDate,
		page,
		pageSize,
		searchValue: debouncedSearch || undefined,
	});

	const { data: summary, isLoading: isSummaryLoading } = useAdminCrateActivityDetails();

	const columns = useAdminCrateActivityColumns();

	const projectOptions = (projects?.items ?? []).map((project) => ({
		label: project.projectName,
		value: String(project.projectNum),
	}));

	const jobOptions = (jobs?.items ?? []).map((job) => ({ label: job.jobName, value: String(job.jobnum) }));

	const employeeOptions = (employees ?? []).map((employee) => ({
		label: employee.name,
		value: employee.id,
	}));

	const statusOptions = Object.values(CRATE_SCAN_ACTION).map((action) => ({
		label: CRATE_STATUS_LABEL[action],
		value: action,
	}));

	return (
		<div className="flex flex-col gap-3 space-y-4">
			<SectionHeader
				title="Crate Management"
				actions={
					<>
						<DatePicker
							className="border-none bg-white shadow-sm hover:bg-white"
							mode="range"
							alwaysShowLabel
							placeholder="Select Date"
							onClear={clearDates}
							selected={{
								from: startDate ? toDate(startDate) : undefined,
								to: endDate ? toDate(endDate) : undefined,
							}}
							onSelect={(value) => {
								setParams({
									startDate: value?.from ? toMidnightDateString(value.from) : undefined,
									endDate: value?.to ? toMidnightDateString(value.to) : undefined,
								});
							}}
							key="date-picker"
							required={false}
						/>
						<Button
							variant="outline"
							className="h-10 rounded-[8px] border-brand-dark10 bg-white hover:bg-white"
							onClick={() => router.push(routes.admin.crateIssues)}
						>
							Reported Issues
						</Button>
					</>
				}
			/>

			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<Input
					className="h-10 w-[320px] bg-white"
					icon={<Search className="h-4 w-4 text-muted-foreground" />}
					iconPosition="left"
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					placeholder="Search by crate id, job name, job # "
				/>

				<div className="no-scrollbar overflow-x-auto py-1">
					<div className="flex min-w-max items-center gap-2">
						<CrateActivityFilterPopover
							key="project-filter"
							label="Project"
							className="w-[160px]"
							selected={projectNums?.map(String) ?? []}
							options={projectOptions}
							onChange={(values) =>
								setParams({ projectNums: values.length ? values.map((value) => parseInt(value, 10)) : undefined })
							}
							searchable
							onSearch={setProjectSearch}
							loading={isProjectsFetching}
						/>
						<CrateActivityFilterPopover
							key="job-filter"
							label="Job"
							className="w-[160px]"
							selected={jobNums?.map(String) ?? []}
							options={jobOptions}
							onChange={(values) =>
								setParams({ jobNums: values.length ? values.map((value) => parseInt(value, 10)) : undefined })
							}
							searchable
							onSearch={setJobSearch}
							loading={isJobsFetching}
						/>
						<CrateActivityFilterPopover
							key="status-filter"
							label="Status"
							className="w-[140px]"
							selected={status ?? []}
							options={statusOptions}
							onChange={(values) => setParams({ status: values.length ? (values as CRATE_SCAN_ACTION[]) : undefined })}
						/>
						<CrateActivityFilterPopover
							key="employee-filter"
							label="Employee"
							className="w-[160px]"
							selected={technicianIds ?? []}
							options={employeeOptions}
							onChange={(values) => setParams({ technicianIds: values.length ? values : undefined })}
							searchable
						/>
					</div>
				</div>
			</div>

			<CrateActivitySummaryCards summary={summary} isLoading={isSummaryLoading} />

			<DataTable
				showGridLines
				stickyHeaderMode
				compact
				columns={columns}
				data={data?.items ?? []}
				isLoading={isLoading}
				useSectionHeader={false}
				rowClassName={(row) => (row.id === highlightedCrateEventId ? "bg-brand-bgLightgrey" : "hover:bg-gray-50")}
				paginatorOptions={{
					pageSize: pageSize ?? 25,
					total: data?.total ?? 0,
					currentPage: page ?? 1,
					setPageSize: (size: number) => setParams({ pageSize: size, page: 1 }),
					setPage: (p: number) => setParams({ page: p }),
				}}
			/>
		</div>
	);
}
