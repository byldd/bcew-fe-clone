"use client";
import { DataTable } from "@/components/shared/datatable/datatable";
import { dateToUTCString, getBcewWeekRange } from "@/lib/utils/date";
import React, { useState } from "react";
import { getGpsExceptionEventsColumns } from "../utils/gps-exeption-event-columns";
import { useExceptionEventParams } from "../hooks/useExceptionEventParams";
import DateRangePickModal, { DATE_PICK_APPLY_TO } from "@/components/common/date-range-modal";
import { FiSearch } from "react-icons/fi";
import { useGpsExceptionEvents } from "../hooks/useGpsExceptionEvents";
import { gruopGpsExceptionEventsByUserName } from "../utils/group-data";
import SectionHeader from "@/components/shared/section-header";

const GPSExceptionEventTemplate = () => {
	const { getParams, setParams } = useExceptionEventParams();
	const { date, ruleId } = getParams();

	const [search, setSearch] = useState("");

	const { weekStart, weekEnd } = getBcewWeekRange(date);

	const { data, isLoading } = useGpsExceptionEvents({
		startDate: dateToUTCString(weekStart),
		endDate: dateToUTCString(weekEnd),
		ruleId: ruleId,
	});

	const filterData = data?.filter((item) => {
		if (search) {
			const searchParts = search.split(" ");
			return searchParts.every((part) => item.employee?.user?.name.toLowerCase().includes(part.toLowerCase()));
		}
		return true;
	});

	const columns = getGpsExceptionEventsColumns({ weekStart, weekEnd });

	const gpsEventsByEmployee = gruopGpsExceptionEventsByUserName(filterData || []);

	return (
		<div className="space-y-4">
			{/* Responsive header — stacks on mobile, row on sm+ */}
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<SectionHeader title="GPS Exception Events" />

				{/* Controls: single unified scroll row */}
				<div className="no-scrollbar overflow-x-auto">
					<div className="flex min-w-max items-center gap-2 py-1">
						{/* Search */}
						<div className="relative">
							<FiSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-dark50" />
							<input
								type="text"
								placeholder="Search by employee name"
								className="h-10 w-[240px] rounded-[10px] border-none bg-white pl-9 pr-3 text-sm shadow-sm outline-none"
								value={search}
								onChange={(e) => setSearch(e.target.value)}
							/>
						</div>

						{/* Date range picker */}
						<DateRangePickModal
							endDate={weekEnd}
							startDate={weekStart}
							selectApplyTo={DATE_PICK_APPLY_TO.END_DATE}
							onMoveBack={(startDate) => {
								setParams({ date: startDate });
							}}
							onMoveForward={(startDate, endDate) => {
								setParams({ date: endDate });
							}}
							onChange={(startDate, endDate) => {
								setParams({ date: endDate });
							}}
							dayRange={6}
						/>
					</div>
				</div>
			</div>

			{/* Table */}
			<DataTable
				data={gpsEventsByEmployee || []}
				columns={columns}
				isLoading={isLoading}
				showGridLines
				stickyHeaderMode
				useSectionHeader={false}
			/>
		</div>
	);
};

export default GPSExceptionEventTemplate;
