"use client";
import React, { useEffect, useState } from "react";
import { useGetTravelPayRequests } from "../hooks/useTravelPay";
import { gettravelPayColumns } from "../utils/travel-pay-columns";
import { DataTable } from "@/components/shared/datatable/datatable";
import { getBcewWeekRange, toMidnightDateString } from "@/lib/utils/date";
import { useTravelPayParams } from "../hooks/useTravelPayParams";
import { applyFilterAndSort, gruopTravelPayDataByUserName } from "../utils/group-data";
import { FiSearch } from "react-icons/fi";
import TravelPayFilter from "../components/travel-pay-filter";
import { TRAVEL_PAY_REQUEST_STATUS } from "../types";
import DownloadPdf from "../components/download-pdf";
import DateRangePickModal, { DATE_PICK_APPLY_TO } from "@/components/common/date-range-modal";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
import SectionHeader from "@/components/shared/section-header";
import { BsInfoCircle } from "react-icons/bs";
import RuleModal from "@/module/employee-travel-pay/components/rule-modal";
import { AppTooltip } from "@/components/ui/tooltip";

const TravelPay = () => {
	const { getParams, setParams } = useTravelPayParams();
	const { date, status, pdf, travelPayRequestId, sort } = getParams();

	const [search, setSearch] = useState("");
	const tCommon = useTypedTranslations(NAMESPACE.COMMON);
	const tSchedule = useTypedTranslations(NAMESPACE.SCHEDULE);

	const { weekStart, weekEnd } = getBcewWeekRange(date);

	const travelPayColumns = gettravelPayColumns({ weekEnd, weekStart });

	const { data, isLoading } = useGetTravelPayRequests({
		startDate: toMidnightDateString(weekStart),
		endDate: toMidnightDateString(weekEnd),
		status: status as TRAVEL_PAY_REQUEST_STATUS,
	});

	const filterData = applyFilterAndSort({ data: data || [], sort, search });

	useEffect(() => {
		if (!data || !travelPayRequestId) {
			return;
		}

		const element = document.getElementById(travelPayRequestId);
		if (element) {
			element.scrollIntoView({ behavior: "smooth", block: "center" });
		}
	}, [data, travelPayRequestId]);

	const requestGroupByEmployee = gruopTravelPayDataByUserName(filterData || []);

	return (
		<div>
			<div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				{/* Title */}
				<div className="flex items-center gap-3">
					<SectionHeader title={tCommon.travelPay} />
					<AppTooltip
						trigger={<BsInfoCircle size={20} className="mt-0.5 cursor-pointer" />}
						text={
							<div className="rounded-[10px]">
								<RuleModal />
							</div>
						}
						contentClassName="border"
						align="start"
					/>
				</div>

				<div className="no-scrollbar overflow-x-auto">
					<div className="flex min-w-max items-center gap-2 py-1">
						{/* Search */}
						{!pdf && (
							<div className="relative">
								<FiSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-dark50" />
								<input
									type="text"
									placeholder={tSchedule.searchByEmployeeName}
									className="h-10 w-[240px] rounded-[10px] border-none bg-white pl-9 pr-3 text-sm outline-none"
									value={search}
									onChange={(e) => setSearch(e.target.value)}
								/>
							</div>
						)}

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

						{!pdf && (
							<>
								<TravelPayFilter />

								<DownloadPdf />
							</>
						)}
					</div>
				</div>
			</div>

			{/* Table — stickyHeaderMode  */}
			<DataTable
				columns={travelPayColumns}
				data={requestGroupByEmployee || []}
				isLoading={isLoading}
				showGridLines
				stickyHeaderMode
				useSectionHeader={false}
				rowClassName={(row) => {
					if (row?.travelPays?.some((item) => item.id === travelPayRequestId)) {
						return "bg-gray-300";
					}
					return "";
				}}
			/>
		</div>
	);
};

export default TravelPay;
