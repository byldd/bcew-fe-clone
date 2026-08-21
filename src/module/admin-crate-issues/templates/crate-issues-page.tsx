"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import SectionHeader from "@/components/shared/section-header";
import { DataTable } from "@/components/shared/datatable/datatable";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { toDate, toMidnightDateString } from "@/lib/utils/date";
import { useDebounce } from "@/hooks/useDebounce";
import { CRATE_ISSUE_CATEGORY_OPTIONS, CRATE_ISSUE_SEVERITY_OPTIONS } from "@/module/crate-management/utils/constants";
import { CRATE_ISSUE_CATEGORY, CRATE_ISSUE_SEVERITY } from "@/module/crate-management/enums";
import CrateActivityFilterPopover from "@/module/admin-crate-activity/components/crate-activity-filter-popover";
import {
	useAdminCrateActivityEmployees,
	useAdminCrateActivityJobs,
	useAdminCrateActivityProjects,
} from "@/module/admin-crate-activity/hooks/useCrateActivity";
import { useAdminCrateIssuesParams } from "../hooks/useCrateIssuesParams";
import { useAdminCrateIssues } from "../hooks/useCrateIssues";
import { useAdminCrateIssuesColumns } from "../utils";

export default function AdminCrateIssuesPage() {
	const searchParams = useSearchParams();
	// Captured once on mount - the filter-reset effect below rewrites the URL from its own
	// known params and would otherwise strip this deep-link id out from under us.
	const [highlightedIssueId] = useState(() => searchParams.get("issueId"));
	const [search, setSearch] = useState("");
	const debouncedSearch = useDebounce(search, 500);
	const { getParams, setParams, clearDates } = useAdminCrateIssuesParams();
	const { jobNums, projectNums, technicianIds, issueTypes, severities, startDate, endDate, page, pageSize } =
		getParams();

	const [projectSearch, setProjectSearch] = useState("");
	const debouncedProjectSearch = useDebounce(projectSearch, 400);
	const { data: projects, isFetching: isProjectsFetching } = useAdminCrateActivityProjects(debouncedProjectSearch);

	const [jobSearch, setJobSearch] = useState("");
	const debouncedJobSearch = useDebounce(jobSearch, 400);
	// Job list is scoped to the selected project(s), if any - reuses admin-crate-activity's
	// project/job/employee endpoints directly rather than duplicating them per feature.
	const { data: jobs, isFetching: isJobsFetching } = useAdminCrateActivityJobs(debouncedJobSearch, projectNums ?? []);

	const { data: employees } = useAdminCrateActivityEmployees();

	// getParams() re-parses arrays from the URL on every render, so depend on their joined
	// string form here - otherwise the new array reference each render would reset page on every render.
	const jobNumsKey = jobNums?.join("|");
	const projectNumsKey = projectNums?.join("|");
	const technicianIdsKey = technicianIds?.join("|");
	const issueTypesKey = issueTypes?.join("|");
	const severitiesKey = severities?.join("|");

	// Reset to page 1 whenever search or filters change
	useEffect(() => {
		setParams({ page: 1 });
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [debouncedSearch, jobNumsKey, projectNumsKey, technicianIdsKey, issueTypesKey, severitiesKey, startDate, endDate]);

	const { data, isLoading } = useAdminCrateIssues({
		jobNums,
		projectNums,
		technicianIds,
		issueTypes,
		severities,
		startDate,
		endDate,
		page,
		pageSize,
		searchValue: debouncedSearch || undefined,
	});

	const columns = useAdminCrateIssuesColumns();

	const projectOptions = (projects?.items ?? []).map((project) => ({
		label: project.projectName,
		value: String(project.projectNum),
	}));

	const jobOptions = (jobs?.items ?? []).map((job) => ({ label: job.jobName, value: String(job.jobnum) }));

	const employeeOptions = (employees ?? []).map((employee) => ({
		label: employee.name,
		value: employee.id,
	}));

	return (
		<div className="flex flex-col gap-3 space-y-4">
			<SectionHeader
				title="Reported Issues"
				showBackButton
				actions={
					<DatePicker
						className="border-none bg-white shadow-md hover:bg-white"
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
				}
			/>

			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<Input
					className="h-10 w-[280px] bg-white"
					icon={<Search className="h-4 w-4 text-muted-foreground" />}
					iconPosition="left"
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					placeholder="Search by job name, job # "
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
							key="employee-filter"
							label="Employee"
							className="w-[160px]"
							selected={technicianIds ?? []}
							options={employeeOptions}
							onChange={(values) => setParams({ technicianIds: values.length ? values : undefined })}
							searchable
						/>
						<CrateActivityFilterPopover
							key="issue-type-filter"
							label="Issue Type"
							className="w-[160px]"
							selected={issueTypes ?? []}
							options={CRATE_ISSUE_CATEGORY_OPTIONS.map((option) => ({ label: option.label, value: option.value }))}
							onChange={(values) =>
								setParams({ issueTypes: values.length ? (values as CRATE_ISSUE_CATEGORY[]) : undefined })
							}
						/>
						<CrateActivityFilterPopover
							key="severity-filter"
							label="Severity"
							className="w-[140px]"
							selected={severities ?? []}
							options={CRATE_ISSUE_SEVERITY_OPTIONS.map((option) => ({ label: option.label, value: option.value }))}
							onChange={(values) =>
								setParams({ severities: values.length ? (values as CRATE_ISSUE_SEVERITY[]) : undefined })
							}
						/>
					</div>
				</div>
			</div>

			<DataTable
				showGridLines
				stickyHeaderMode
				compact
				mobileCompact
				columns={columns}
				data={data?.items ?? []}
				isLoading={isLoading}
				useSectionHeader={false}
				rowClassName={(row) => (row.id === highlightedIssueId ? "bg-brand-bgLightgrey" : "hover:bg-gray-50")}
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
