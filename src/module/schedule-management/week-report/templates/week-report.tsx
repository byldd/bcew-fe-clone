"use client";

import React, { useState } from "react";
import { FiSearch } from "react-icons/fi";
import SectionHeader from "@/components/shared/section-header";
import { Button } from "@/components/ui/button";
import DateRangePickModal, { DATE_PICK_APPLY_TO } from "@/components/common/date-range-modal";
import { getBcewWeekRange, toMidnightDateString } from "@/lib/utils/date";
import { useWeekReport } from "../hooks/useWeekReport";
import { useWeekReportParams } from "../hooks/useWeekReportParams";
import { filterWeekReportEntries } from "../utils";
import WeekReportCollapsibleTable from "../components/week-report-collapsible-table";
import DownloadWeekReportPdf from "../components/download-week-report-pdf";

const WeekReport = () => {
	const { getParams, setParams } = useWeekReportParams();
	const { date, pdf } = getParams();

	const [search, setSearch] = useState("");
	const [expandAll, setExpandAll] = useState(false);

	const { weekStart, weekEnd } = getBcewWeekRange(date);

	const { data, isLoading } = useWeekReport({
		startDate: toMidnightDateString(weekStart),
		endDate: toMidnightDateString(weekEnd),
	});

	const filteredData = filterWeekReportEntries(data || [], search);

	return (
		<div>
			<div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<SectionHeader title="Payroll Report" />

				<div className="no-scrollbar overflow-x-auto">
					<div className="flex min-w-max items-center gap-2 py-1">
						{!pdf && (
							<div className="relative">
								<FiSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-dark50" />
								<input
									type="text"
									placeholder="Search by employee name"
									className="h-10 w-[240px] rounded-[10px] border bg-white pl-9 pr-3 text-sm outline-none"
									value={search}
									onChange={(e) => setSearch(e.target.value)}
								/>
							</div>
						)}

						<DateRangePickModal
							endDate={weekEnd}
							startDate={weekStart}
							selectApplyTo={DATE_PICK_APPLY_TO.END_DATE}
							onMoveBack={(startDate) => setParams({ date: startDate })}
							onMoveForward={(startDate, endDate) => setParams({ date: endDate })}
							onChange={(startDate, endDate) => setParams({ date: endDate })}
							dayRange={6}
						/>

						{!pdf && (
							<>
								<Button variant="outline" className="h-10 rounded-[10px]" onClick={() => setExpandAll((prev) => !prev)}>
									{expandAll ? "Collapse all rows" : "Expand all rows"}
								</Button>
								<DownloadWeekReportPdf />
							</>
						)}
					</div>
				</div>
			</div>

			<WeekReportCollapsibleTable data={filteredData} isLoading={isLoading} forceExpandAll={pdf || expandAll} />
		</div>
	);
};

export default WeekReport;
