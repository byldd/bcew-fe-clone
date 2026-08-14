"use client";

import { useMemo, useState } from "react";

import SectionHeader from "@/components/shared/section-header";
import { FiSearch } from "react-icons/fi";
import { ATTENDANCE_SOURCE } from "../utils/enums";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { FiChevronDown } from "react-icons/fi";

import { useAttendancesParams } from "../hooks/useAttendanceParams";

import { useAttendanceData } from "../hooks/useAttendance";

import { getBcewWeekRange, toMidnightDateString } from "@/lib/utils/date";

import { DataTable } from "@/components/shared/datatable/datatable";

import { useAttendanceColumns } from "../utils/attendance-columns";

import { attendanceSourceTabs, attendanceTypeOptions } from "../utils";

import DateRangePickModal, { DATE_PICK_APPLY_TO } from "@/components/common/date-range-modal";

const AttendanceRecords = () => {
	const columns = useAttendanceColumns();

	const { getParams, setParams } = useAttendancesParams();

	const { date, source, types } = getParams();

	const { weekStart, weekEnd } = getBcewWeekRange(date);

	const [search, setSearch] = useState("");

	const { data, isLoading } = useAttendanceData({
		startDate: toMidnightDateString(weekStart),
		endDate: toMidnightDateString(weekEnd),
		types,
	});

	/**
	 * FE SEARCH FILTER
	 */
	const searchedData = useMemo(() => {
		if (!data) return [];

		if (!search.trim()) return data;

		const lowerSearch = search.toLowerCase();

		return data.filter((item) => item.employeeName?.toLowerCase().includes(lowerSearch));
	}, [data, search]);

	/**
	 * FE SOURCE FILTER
	 */
	const filteredData = useMemo(() => {
		if (source === ATTENDANCE_SOURCE.ALL) {
			return searchedData;
		}

		return searchedData.filter((item) => item.source === source);
	}, [searchedData, source]);

	return (
		<div className="w-full space-y-3 bg-white">
			{/* Header */}
			<SectionHeader title={"Attendance Records"} showBackButton />

			<div className="no-scrollbar overflow-x-auto py-2">
				<div className="flex min-w-max items-center justify-between gap-2 px-0.5">
					{/* SOURCE TABS */}
					<div className="flex items-center gap-2">
						{attendanceSourceTabs.map((tab) => (
							<Button
								className="h-10"
								key={tab.key}
								onClick={() =>
									setParams({
										source: tab.key as ATTENDANCE_SOURCE,
									})
								}
								variant={source === tab.key ? "filled" : "outline"}
							>
								{tab.label}
							</Button>
						))}
					</div>
					<div className="flex items-center gap-2">
						{/* SEARCH */}
						<div className="relative">
							<FiSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-dark50" />
							<input
								type="text"
								placeholder="Search by employee name"
								className="h-10 w-[240px] rounded-[8px] border border-brand-dark10 bg-white pl-9 pr-3 text-sm outline-none"
								value={search}
								onChange={(e) => setSearch(e.target.value)}
							/>
						</div>

						{/* TYPE FILTER */}
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant={"outline"} className="h-10 border-gray-200 bg-white text-sm shadow-sm">
									<span className={types?.length ? "font-medium text-brand-dark" : "font-normal text-gray-400"}>
										{types?.length ? `${types.length} Type${types.length > 1 ? "s" : ""} Selected` : "Select Types"}
									</span>
									<FiChevronDown />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" className="w-52">
								{attendanceTypeOptions.map((option) => {
									const isSelected = types?.includes(option.value);
									return (
										<DropdownMenuItem
											key={option.value}
											onSelect={(e) => {
												e.preventDefault();
												setParams({
													types: isSelected
														? (types?.filter((item) => item !== option.value) ?? [])
														: [...(types ?? []), option.value],
												});
											}}
											className="flex items-center gap-3"
										>
											<input
												type="checkbox"
												checked={isSelected}
												onChange={() => {}}
												className="border-brand-dark20 h-4 w-4 rounded"
												style={{ accentColor: "black" }}
											/>
											<span className="text-sm text-brand-dark">{option.label}</span>
										</DropdownMenuItem>
									);
								})}
								<DropdownMenuItem
									className="mt-2 border-t text-brand-red hover:!bg-brand-red100 hover:!text-brand-red"
									onSelect={(e) => {
										e.preventDefault();
										setParams({ types: undefined }, false);
									}}
								>
									Clear filter
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>

						{/* DATE FILTER */}
						<DateRangePickModal
							endDate={weekEnd}
							startDate={weekStart}
							selectApplyTo={DATE_PICK_APPLY_TO.END_DATE}
							onMoveBack={(startDate) => setParams({ date: startDate })}
							onMoveForward={(startDate, endDate) => setParams({ date: endDate })}
							dayRange={6}
						/>
					</div>
				</div>
			</div>

			{/* TABLE */}
			<DataTable
				showGridLines
				stickyHeaderMode
				columns={columns}
				data={filteredData}
				isLoading={isLoading}
				useSectionHeader={false}
				className="[&_thead_th]:border-gray-300 [&_thead_tr]:border-gray-300"
			/>
		</div>
	);
};

export default AttendanceRecords;
