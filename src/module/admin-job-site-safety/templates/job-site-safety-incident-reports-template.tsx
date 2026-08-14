"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import SectionHeader from "@/components/shared/section-header";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { routes } from "@/config/routes";
import { DatePicker } from "@/components/ui/date-picker";
import { ADD_RECORD_TAB, JOB_SITE_SAFETY_TAB } from "../enums";
import { useJobSiteSafetyDashboard } from "../hooks/useJobSiteSafetyDashboard";
import { useJobSiteSafetyDashboardParams } from "../hooks/useJobSiteSafetyDashboardParams";
import { IJobSiteSafetyDashboardRow } from "../types";
import {
	isClosedJobSiteSafetyRecord,
	matchesJobSiteSafetySearch,
	matchesJobSiteSafetyTab,
} from "../utils/dashboard-constants";
import JobSiteSafetyRecordsFilters from "../components/job-site-safety-records-filters";
import JobSiteSafetyRecordsTable from "../components/job-site-safety-records-table";

const TAB_TRIGGER_CLASS =
	"inline-flex items-center justify-center whitespace-nowrap rounded-[8px] border border-brand-dark10 px-3 py-2 text-sm font-medium transition-all data-[state=active]:bg-brand-dark data-[state=inactive]:bg-white data-[state=active]:text-white data-[state=inactive]:text-brand-dark";

const JobSiteSafetyIncidentReportsTemplate = () => {
	const router = useRouter();
	const { getParams, setParams } = useJobSiteSafetyDashboardParams();
	const { startDate, endDate, tab, search, showResolvedClosed, typeFilter, sourceFilter, statusFilter } = getParams();

	const { data, isLoading } = useJobSiteSafetyDashboard(startDate, endDate);

	// The toggle narrows the list down to closed records rather than adding them to
	// it — off shows everything, on shows only Resolved / Resolved Internally.
	const matchesResolvedClosed = (row: IJobSiteSafetyDashboardRow) =>
		!showResolvedClosed || isClosedJobSiteSafetyRecord(row);

	const rows = useMemo(
		() =>
			(data ?? []).filter(
				(row: IJobSiteSafetyDashboardRow) =>
					matchesJobSiteSafetyTab(row, tab) &&
					matchesResolvedClosed(row) &&
					(!typeFilter.length || typeFilter.includes(row.type)) &&
					(!sourceFilter.length || sourceFilter.includes(row.source)) &&
					(!statusFilter.length || statusFilter.includes(row.status)) &&
					matchesJobSiteSafetySearch(row, search)
			),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[data, tab, showResolvedClosed, typeFilter, sourceFilter, statusFilter, search]
	);

	const allCount = (data ?? []).filter(
		(row) => matchesJobSiteSafetyTab(row, JOB_SITE_SAFETY_TAB.ALL) && matchesResolvedClosed(row)
	).length;

	return (
		<div className="w-full space-y-4">
			<div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
				<SectionHeader title="Incident Reports" />

				<div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
					<DatePicker
						mode="range"
						placeholder="Select date"
						alwaysShowLabel
						selected={{ from: startDate ?? undefined, to: endDate ?? undefined }}
						onSelect={(value) => setParams({ startDate: value?.from ?? null, endDate: value?.to ?? null })}
						onClear={() => setParams({ startDate: null, endDate: null })}
						required={false}
						className="!h-10 w-[200px] border border-brand-dark10 !bg-white text-sm shadow-none"
					/>
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
				</div>
			</div>

			<Tabs value={tab} onValueChange={(value) => setParams({ tab: value as JOB_SITE_SAFETY_TAB })}>
				<div className="no-scrollbar overflow-x-auto py-1">
					<TabsList className="inline-flex h-9 w-max items-center justify-start gap-2 rounded-[8px] bg-transparent">
						<TabsTrigger className={TAB_TRIGGER_CLASS} value={JOB_SITE_SAFETY_TAB.ALL}>
							All ({allCount})
						</TabsTrigger>
						<TabsTrigger className={TAB_TRIGGER_CLASS} value={JOB_SITE_SAFETY_TAB.INJURIES}>
							Injuries
						</TabsTrigger>
						<TabsTrigger className={TAB_TRIGGER_CLASS} value={JOB_SITE_SAFETY_TAB.VIOLATIONS}>
							Violations
						</TabsTrigger>
						<TabsTrigger className={TAB_TRIGGER_CLASS} value={JOB_SITE_SAFETY_TAB.DRAFTS}>
							Drafts
						</TabsTrigger>
					</TabsList>
				</div>
			</Tabs>

			<JobSiteSafetyRecordsFilters
				search={search}
				typeFilter={typeFilter}
				sourceFilter={sourceFilter}
				statusFilter={statusFilter}
				showResolvedClosed={showResolvedClosed}
				onChange={setParams}
			/>

			<JobSiteSafetyRecordsTable data={rows} isLoading={isLoading} />
		</div>
	);
};

export default JobSiteSafetyIncidentReportsTemplate;
