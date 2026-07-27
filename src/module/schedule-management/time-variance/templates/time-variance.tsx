"use client";
import React, { useMemo, useState } from "react";
import { useTimeVariance } from "../hooks/useTimeVariance";
import { DataTable } from "@/components/shared/datatable/datatable";
import { useTimeVarianceColumns } from "../utils/time-variance-column";
import { useTimeVarianceParams } from "../hooks/useTimeVarianceParams";
import { getBcewWeekRange, toMidnightDateString } from "@/lib/utils/date";
import DateRangePickModal, { DATE_PICK_APPLY_TO } from "@/components/common/date-range-modal";
import { getMinAndMaxTimeVarianceDate } from "../utils/time-variance-date";
import { useDebounce } from "@/hooks/useDebounce";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
import { BsInfoCircle } from "react-icons/bs";
import TimeVarianceTooltip from "../components/time-variance-tooltip";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import SectionHeader from "@/components/shared/section-header";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const TimeVariance = () => {
	const { getParams, setParams } = useTimeVarianceParams();
	const { date } = getParams();
	const { weekStart, weekEnd } = getBcewWeekRange(date);
	const tCommon = useTypedTranslations(NAMESPACE.COMMON);

	const { data, isLoading } = useTimeVariance({
		startDate: toMidnightDateString(weekStart),
		endDate: toMidnightDateString(weekEnd),
	});
	const [search, setSearch] = useState("");
	const debounceSearch = useDebounce(search);

	const { dates } = useMemo(() => {
		return getMinAndMaxTimeVarianceDate({ timeVarianceData: data });
	}, [data]);

	const columns = useTimeVarianceColumns({ dates });
	const tTimeLogs = useTypedTranslations(NAMESPACE.TIME_LOGS);

	const filterData = useMemo(() => {
		return data?.filter((item) => item.userName?.toLowerCase().includes(debounceSearch?.toLowerCase()));
	}, [data, debounceSearch]);

	return (
		<div>
			{/* Responsive page header */}
			<div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				{/* Title + info icon */}
				<div className="flex items-center gap-2">
					<SectionHeader title={tCommon.timeVariance} />

					<Popover>
						<PopoverTrigger asChild>
							<button className="cursor-pointer text-brand-dark50 hover:text-brand-dark">
								<BsInfoCircle size={20} />
							</button>
						</PopoverTrigger>
						<PopoverContent
							align="start"
							sideOffset={6}
							collisionPadding={16}
							className="w-[min(320px,calc(100vw-2rem))] border-none p-0 shadow-md"
						>
							<TimeVarianceTooltip />
						</PopoverContent>
					</Popover>
				</div>

				{/* Search + date picker — single scrollable row on mobile */}
				<div className="no-scrollbar overflow-x-auto">
					<div className="flex min-w-max items-center gap-2">
						<Input
							className="h-10 w-[240px] bg-white"
							icon={<Search className="h-4 w-4 text-muted-foreground" />}
							iconPosition="left"
							placeholder={tTimeLogs.searchEmployeeByName}
							onChange={(e) => setSearch(e.target.value)}
							value={search}
						/>

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
							dayRange={6}
							onChange={(startDate, endDate) => {
								setParams({ date: endDate });
							}}
						/>
					</div>
				</div>
			</div>

			{/* Table — header handled above, so no built-in DataTable header */}
			<DataTable
				showGridLines
				stickyHeaderMode
				columns={columns}
				data={filterData || []}
				isLoading={isLoading}
				useSectionHeader={false}
			/>
		</div>
	);
};

export default TimeVariance;
