"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import SectionHeader from "@/components/shared/section-header";
import { DataTable } from "@/components/shared/datatable/datatable";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { toDate, toMidnightDateString } from "@/lib/utils/date";
import { useDebounce } from "@/hooks/useDebounce";
import { CRATE_SCAN_ACTION } from "@/module/crate-management/enums";
import { useAdminCrateActivityParams } from "../hooks/useCrateActivityParams";
import {
	useAdminCrateActivity,
	useAdminCrateActivityDetails,
	useAdminCrateActivityFilterOptions,
} from "../hooks/useCrateActivity";
import { useAdminCrateActivityColumns } from "../utils";
import { CRATE_STATUS_LABEL } from "../utils/constants";
import CrateActivitySummaryCards from "../components/crate-activity-summary-cards";
import CrateActivityFilterPopover from "../components/crate-activity-filter-popover";

export default function AdminCrateActivityPage() {
	const [search, setSearch] = useState("");
	const debouncedSearch = useDebounce(search, 500);
	const { getParams, setParams, clearDates } = useAdminCrateActivityParams();
	const { jobNums, projectNums, status, technicianIds, startDate, endDate, page, pageSize } = getParams();
	const { data: filterOptions } = useAdminCrateActivityFilterOptions();

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

	const { data: summary, isLoading: isSummaryLoading } = useAdminCrateActivityDetails({
		jobNums,
		projectNums,
		technicianIds,
		startDate,
		endDate,
	});

	const columns = useAdminCrateActivityColumns(data?.items ?? []);

	// Project narrows which jobs are selectable - a job whose project falls out of the
	// selection is pruned from jobNums so the two filters never disagree.
	const jobOptions = (
		projectNums?.length
			? filterOptions?.jobs.filter((job) => job.projectNum !== null && projectNums.includes(job.projectNum))
			: filterOptions?.jobs
	)?.map((job) => ({ label: job.jobName, value: String(job.jobnum) }));

	const handleProjectChange = (values: string[]) => {
		const nextProjectNums = values.length ? values.map((value) => parseInt(value, 10)) : undefined;
		const allowedJobNums = nextProjectNums
			? filterOptions?.jobs
					.filter((job) => job.projectNum !== null && nextProjectNums.includes(job.projectNum))
					.map((job) => job.jobnum)
			: undefined;
		const prunedJobNums = allowedJobNums ? jobNums?.filter((jobNum) => allowedJobNums.includes(jobNum)) : jobNums;

		setParams({
			projectNums: nextProjectNums,
			jobNums: prunedJobNums?.length ? prunedJobNums : undefined,
		});
	};

	return (
		<div className="flex flex-col gap-3 space-y-4">
			<SectionHeader
				title="Crate Activity"
				actions={
					<>
						<DatePicker
							className="border-none bg-white shadow-md hover:bg-white"
							mode="range"
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
						{/* placeholder until issues-logged view is built */}
						<Button variant="outline" className="rounded-[10px] border-brand-dark10 bg-white hover:bg-white">
							Issues Logged
						</Button>
					</>
				}
			/>

			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<Input
					className="h-10 w-[240px] bg-white"
					icon={<Search className="h-4 w-4 text-muted-foreground" />}
					iconPosition="left"
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					placeholder="Search by crate number, job name..."
				/>

				<div className="no-scrollbar overflow-x-auto">
					<div className="flex min-w-max items-center gap-2">
						<CrateActivityFilterPopover
							key="project-filter"
							label="Project"
							className="w-[160px]"
							selected={projectNums?.map(String) ?? []}
							options={
								filterOptions?.projects.map((project) => ({
									label: project.projectName,
									value: String(project.projectNum),
								})) ?? []
							}
							onChange={handleProjectChange}
						/>
						<CrateActivityFilterPopover
							key="job-filter"
							label="Job"
							className="w-[160px]"
							selected={jobNums?.map(String) ?? []}
							options={jobOptions ?? []}
							onChange={(values) =>
								setParams({ jobNums: values.length ? values.map((value) => parseInt(value, 10)) : undefined })
							}
						/>
						<CrateActivityFilterPopover
							key="status-filter"
							label="Status"
							className="w-[140px]"
							selected={status ?? []}
							options={Object.values(CRATE_SCAN_ACTION).map((action) => ({
								label: CRATE_STATUS_LABEL[action],
								value: action,
							}))}
							onChange={(values) => setParams({ status: values.length ? (values as CRATE_SCAN_ACTION[]) : undefined })}
						/>
						<CrateActivityFilterPopover
							key="technician-filter"
							label="Technician"
							className="w-[160px]"
							selected={technicianIds ?? []}
							options={
								filterOptions?.technicians.map((technician) => ({
									label: technician.name,
									value: technician.id,
								})) ?? []
							}
							onChange={(values) => setParams({ technicianIds: values.length ? values : undefined })}
						/>
					</div>
				</div>
			</div>

			<CrateActivitySummaryCards summary={summary} isLoading={isSummaryLoading} />

			<DataTable
				showGridLines
				stickyHeaderMode
				columns={columns}
				data={data?.items ?? []}
				isLoading={isLoading}
				useSectionHeader={false}
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
