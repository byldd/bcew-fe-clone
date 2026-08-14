"use client";

import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";
import { useDebounce } from "@/hooks/useDebounce";
import { PHASE_OPTIONS, ALL_VALUE } from "@/module/material-management/material-requests/utils/constants";
import {
	useMissingItemRequestEmployees,
	useMissingItemRequestJobs,
	useMissingItemRequestProjects,
} from "@/module/material-management/missing-item-requests-admin/hooks/useAdminMissingItemRequests";
import { MISSING_ITEM_REQUEST_STATUS } from "@/module/material-management/missing-item-requests-admin/utils/types";
import { MISSING_ITEM_REQUEST_STATUS_UI } from "@/module/material-management/missing-item-requests-admin/utils/missing-item-request-status";
import type { ForemanMissingItemRequestsFiltersState } from "../utils/types";
import { FilterSelectPopover } from "../../material-requests/components/filter-select-popover";

type ForemanMissingItemRequestsFiltersProps = {
	filters: ForemanMissingItemRequestsFiltersState;
	onFilterChange: <K extends keyof ForemanMissingItemRequestsFiltersState>(
		key: K,
		value: ForemanMissingItemRequestsFiltersState[K]
	) => void;
	startDate: Date | null;
	endDate: Date | null;
	onDateRangeChange: (startDate: Date | null, endDate: Date | null) => void;
	showRequestedByFilter?: boolean;
};

const withAllOption = (options: { value: string; label: string }[]) => [{ value: ALL_VALUE, label: "All" }, ...options];

const toPipeValue = (values: (string | number)[]) => values.map(String).join("|");
const fromPipeValue = (value: string) => value.split("|").filter(Boolean);

export default function ForemanMissingItemRequestsFilters({
	filters,
	onFilterChange,
	startDate,
	endDate,
	onDateRangeChange,
	showRequestedByFilter = true,
}: ForemanMissingItemRequestsFiltersProps) {
	const { data: employees } = useMissingItemRequestEmployees(showRequestedByFilter);

	const [projectSearch, setProjectSearch] = useState("");
	const debouncedProjectSearch = useDebounce(projectSearch, 400);
	const { data: projects, isFetching: isProjectsFetching } = useMissingItemRequestProjects(debouncedProjectSearch);

	const [jobSearch, setJobSearch] = useState("");
	const debouncedJobSearch = useDebounce(jobSearch, 400);
	// Job# / Job Name are scoped to the selected project(s), if any — both are cleared
	// server-side to "all jobs" when no project is selected.
	const { data: jobs, isFetching: isJobsFetching } = useMissingItemRequestJobs(
		debouncedJobSearch,
		filters.projectNumbers
	);

	const projectSelectOptions = useMemo(
		() =>
			withAllOption(
				(projects?.items ?? []).map((project) => ({
					value: project.recnum.toString(),
					label: project.clnnme,
				}))
			),
		[projects]
	);

	const jobNumberSelectOptions = useMemo(
		() => withAllOption((jobs?.items ?? []).map((job) => ({ value: job.recnum, label: job.recnum }))),
		[jobs]
	);

	const jobNameSelectOptions = useMemo(
		() => withAllOption((jobs?.items ?? []).map((job) => ({ value: job.recnum, label: job.jobnme }))),
		[jobs]
	);

	const phaseSelectOptions = useMemo(
		() =>
			withAllOption(
				PHASE_OPTIONS.map((option) => ({ value: option.replaceAll(" ", "_").toLowerCase(), label: option }))
			),
		[]
	);

	const statusSelectOptions = useMemo(
		() =>
			withAllOption(
				Object.values(MISSING_ITEM_REQUEST_STATUS).map((status) => ({
					value: status,
					label: MISSING_ITEM_REQUEST_STATUS_UI[status].label,
				}))
			),
		[]
	);

	const requestedBySelectOptions = useMemo(
		() => withAllOption((employees ?? []).map((employee) => ({ value: employee.id, label: employee.name }))),
		[employees]
	);

	return (
		<div className="py-0.5">
			<div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-end">
				<div className="flex flex-col gap-0.5">
					<FilterSelectPopover
						label="Project"
						value={toPipeValue(filters.projectNumbers)}
						options={projectSelectOptions}
						onApply={(value) => onFilterChange("projectNumbers", fromPipeValue(value).map(Number))}
						triggerClassName="h-9 w-full sm:w-[180px]"
						searchable
						onSearch={setProjectSearch}
						loading={isProjectsFetching}
					/>
				</div>

				<div className="flex flex-col gap-0.5">
					<FilterSelectPopover
						label="Job#"
						value={toPipeValue(filters.jobNumbers)}
						options={jobNumberSelectOptions}
						onApply={(value) => onFilterChange("jobNumbers", fromPipeValue(value).map(Number))}
						triggerClassName="h-9 w-full sm:w-[140px]"
						searchable
						onSearch={setJobSearch}
						loading={isJobsFetching}
					/>
				</div>

				<div className="flex flex-col gap-0.5">
					<FilterSelectPopover
						label="Job Name"
						value={toPipeValue(filters.jobNames)}
						options={jobNameSelectOptions}
						onApply={(value) => onFilterChange("jobNames", fromPipeValue(value).map(Number))}
						triggerClassName="h-9 w-full sm:w-[180px]"
						searchable
						onSearch={setJobSearch}
						loading={isJobsFetching}
					/>
				</div>

				<div className="flex flex-col gap-0.5">
					<FilterSelectPopover
						label="Phase"
						value={toPipeValue(filters.phaseNames)}
						options={phaseSelectOptions}
						onApply={(value) => onFilterChange("phaseNames", fromPipeValue(value))}
						triggerClassName="h-9 w-full sm:w-[140px]"
					/>
				</div>

				<div className="flex flex-col gap-0.5">
					<FilterSelectPopover
						label="Status"
						value={toPipeValue(filters.statuses)}
						options={statusSelectOptions}
						onApply={(value) => onFilterChange("statuses", fromPipeValue(value))}
						triggerClassName="h-9 w-full sm:w-[140px]"
					/>
				</div>

				{showRequestedByFilter && (
					<div className="flex flex-col gap-0.5">
						<FilterSelectPopover
							label="Requested by"
							value={toPipeValue(filters.requestedByUserIds)}
							options={requestedBySelectOptions}
							onApply={(value) => onFilterChange("requestedByUserIds", fromPipeValue(value))}
							triggerClassName="h-9 w-full sm:w-[160px]"
							searchable
						/>
					</div>
				)}

				<div className="col-span-2 flex flex-col gap-0.5 sm:col-span-1">
					<div className="flex items-center gap-1 border border-brand-dark10">
						<DatePicker
							mode="range"
							selected={{ from: startDate ?? undefined, to: endDate ?? undefined }}
							onSelect={(value) => {
								if (!value?.from) {
									onDateRangeChange(null, null);
									return;
								}
								onDateRangeChange(value.from, value.to ?? null);
							}}
							required={false}
							className="!h-9 border-0 !bg-white text-xs shadow-none"
						/>
						{startDate && (
							<button
								type="button"
								onClick={() => onDateRangeChange(null, null)}
								className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-brand-dark50 transition-colors hover:bg-brand-bgLightgrey hover:text-brand-dark"
							>
								<X className="h-3.5 w-3.5" />
							</button>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
