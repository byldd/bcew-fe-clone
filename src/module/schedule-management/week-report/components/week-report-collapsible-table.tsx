"use client";

import React, { useMemo, useState } from "react";
import { TableBody, TableHead, TableHeader, TableRow, TableCell } from "@/components/ui/table";
import { Spinner } from "@/components/ui/spinner";
import { IoMdArrowDropdown, IoMdArrowDropup } from "react-icons/io";
import { cn } from "@/lib/utils/utils";
import { IWeekReportEntry } from "../types";
import { sortWeekReportEntries, weekReportColumns } from "../utils";
import WeekReportPrimaryRow from "./week-report-primary-row";
import WeekReportExpandedSection from "./week-report-expanded-section";
import { SORT_ORDER } from "@/types";

const WEEK_REPORT_COL_COUNT = 8;

const WeekReportCollapsibleTable = ({
	data,
	isLoading,
	forceExpandAll,
}: {
	data: IWeekReportEntry[];
	isLoading: boolean;
	forceExpandAll?: boolean;
}) => {
	const [expandedRows, setExpandedRows] = useState<string[]>([]);
	const [sort, setSort] = useState<{ key: string; dir: SORT_ORDER }>({ key: "lastName", dir: SORT_ORDER.ASC });

	const handleToggleRow = (employeeNum: string) => {
		setExpandedRows((prev) =>
			prev.includes(employeeNum) ? prev.filter((r) => r !== employeeNum) : [...prev, employeeNum]
		);
	};

	const handleSort = (key: string) => {
		setSort((prev) =>
			prev.key === key
				? { key, dir: prev.dir === SORT_ORDER.ASC ? SORT_ORDER.DESC : SORT_ORDER.ASC }
				: { key, dir: SORT_ORDER.ASC }
		);
	};

	const sortedData = useMemo(() => sortWeekReportEntries(data, sort.key, sort.dir), [data, sort]);

	return (
		<div className="overflow-x-auto rounded-3xl border bg-white">
			<table className="w-full min-w-[900px] caption-bottom border-collapse text-sm">
				<TableHeader className="h-[60px] bg-brand-bgLightgrey [&_tr]:border-accent/15">
					<TableRow className="hover:bg-transparent">
						{weekReportColumns.map((column) => (
							<TableHead
								key={column.key}
								className="cursor-pointer text-nowrap border-b border-r text-left text-sm font-semibold text-brand-dark50"
								onClick={() => handleSort(column.key)}
							>
								<div className="flex items-center gap-1">
									{column.label}
									<span className="flex flex-col">
										<IoMdArrowDropup
											className={cn(
												"h-3 w-3",
												sort.key === column.key && sort.dir === SORT_ORDER.ASC ? "text-brand-dark" : "text-gray-400"
											)}
										/>
										<IoMdArrowDropdown
											className={cn(
												"-mt-1.5 h-3 w-3",
												sort.key === column.key && sort.dir === SORT_ORDER.DESC ? "text-brand-dark" : "text-gray-400"
											)}
										/>
									</span>
								</div>
							</TableHead>
						))}
						<TableHead className="border-b text-left text-sm font-semibold text-brand-dark50" />
					</TableRow>
				</TableHeader>

				<TableBody className="[&_tr]:border-accent/15">
					{isLoading ? (
						<TableRow>
							<TableCell colSpan={WEEK_REPORT_COL_COUNT} className="py-20 text-center">
								<div className="flex items-center justify-center">
									<Spinner />
								</div>
							</TableCell>
						</TableRow>
					) : sortedData.length === 0 ? (
						<TableRow>
							<TableCell colSpan={WEEK_REPORT_COL_COUNT} className="py-16 text-center text-sm text-brand-dark50">
								No employees found for this week
							</TableCell>
						</TableRow>
					) : (
						sortedData.map((entry) => {
							const isExpanded = forceExpandAll || expandedRows.includes(entry.employeeNum);
							return (
								<React.Fragment key={entry.employeeNum}>
									<WeekReportPrimaryRow
										entry={entry}
										isExpanded={isExpanded}
										onToggle={() => handleToggleRow(entry.employeeNum)}
									/>
									{isExpanded && <WeekReportExpandedSection entry={entry} />}
								</React.Fragment>
							);
						})
					)}
				</TableBody>
			</table>
		</div>
	);
};

export default WeekReportCollapsibleTable;
