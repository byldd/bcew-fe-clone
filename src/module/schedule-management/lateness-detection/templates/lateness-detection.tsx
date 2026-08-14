"use client";
import { useState, useMemo, useEffect } from "react";
import { RxTextAlignBottom } from "react-icons/rx";
import { dateToUTCString } from "@/lib/utils/date";
import { DataTable } from "@/components/shared/datatable/datatable";
import CreateLateEntryModalTrigger from "../components/create-late-entry-modal-trigger";
import { useLateEmployees } from "../hooks/useLateness";
import { useLatenssColumns } from "../utils/lateness-columns";

import { LATENESS_FILTER_TAB } from "../types";
import { useLatenessParams } from "../hooks/useLatenessParams";
import { LATENESS_FILTER_TABS } from "../../roster-time-configuration/constants";
import SectionHeader from "@/components/shared/section-header";
import { FiSearch } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
import DatePickModal from "@/components/common/date-pick-modal";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { BsInfoCircle } from "react-icons/bs";
import LatenessTooltip from "../components/lateness-tooltip";

const LatenessDetection = () => {
	const { getParams, setParams } = useLatenessParams();
	const { activeTab, date, employeeId } = getParams;
	const latenessColumns = useLatenssColumns();

	const { data: unhandledData, isLoading: isUnhandledLoading } = useLateEmployees({
		date: dateToUTCString(date),
		type: LATENESS_FILTER_TAB.UNHANDLED,
	});

	const { data: handledData, isLoading: isHandledLoading } = useLateEmployees({
		date: dateToUTCString(date),
		type: LATENESS_FILTER_TAB.HANDLED,
	});

	const [search, setSearch] = useState("");
	const [sortAsc, setSortAsc] = useState(true);

	// Search filter
	const mergedData = useMemo(() => {
		switch (activeTab) {
			case LATENESS_FILTER_TAB.HANDLED:
				return handledData ?? [];

			case LATENESS_FILTER_TAB.UNHANDLED:
				return unhandledData ?? [];

			case LATENESS_FILTER_TAB.ALL:
			default:
				return [...(unhandledData ?? []), ...(handledData ?? [])];
		}
	}, [activeTab, handledData, unhandledData]);

	const searchedData = useMemo(() => {
		if (!mergedData.length) return [];

		if (!search.trim()) return mergedData;

		const s = search.toLowerCase();

		return mergedData.filter((row) => row.user.name.toLowerCase().includes(s));
	}, [mergedData, search]);

	// Name sorting
	const sortedData = useMemo(() => {
		const rows = [...searchedData];
		rows.sort((a, b) => {
			const n1 = a.user.name.toLowerCase();
			const n2 = b.user.name.toLowerCase();
			return sortAsc ? n1.localeCompare(n2) : n2.localeCompare(n1);
		});
		return rows;
	}, [searchedData, sortAsc]);

	useEffect(() => {
		if (!employeeId || isUnhandledLoading) return;

		const element = document.getElementById(`${employeeId}`);

		if (element) {
			element.scrollIntoView({
				behavior: "smooth",
				block: "start",
			});

			return;
		}

		// only switch tab if currently on unhandled
		if (activeTab === LATENESS_FILTER_TAB.UNHANDLED) {
			const existsInUnhandled = (unhandledData ?? []).some(
				(row) => String(row.user?.employee?.id) === String(employeeId)
			);

			if (!existsInUnhandled) {
				setParams({
					activeTab: LATENESS_FILTER_TAB.HANDLED,
					employeeId,
				});
			}
		}
	}, [employeeId, unhandledData, handledData, activeTab, setParams, isUnhandledLoading]);

	const handleSortToggle = () => setSortAsc((p) => !p);
	const tTimeLogs = useTypedTranslations(NAMESPACE.TIME_LOGS);
	const tSchedule = useTypedTranslations(NAMESPACE.SCHEDULE);

	return (
		<div className="min-h-screen w-full space-y-3 bg-white pb-2">
			<div className="flex items-center gap-2">
				<SectionHeader title={tTimeLogs.lateStartEarlyQuitDetection} showBackButton />

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
						<LatenessTooltip />
					</PopoverContent>
				</Popover>
			</div>

			{/* Tabs */}

			<div className="flex flex-col gap-3 py-1 sm:hidden">
				<div className="no-scrollbar overflow-x-auto">
					<div className="flex gap-2">
						{LATENESS_FILTER_TABS.map((tab) => (
							<Button
								key={tab.key}
								onClick={() => setParams({ activeTab: tab.key, employeeId: undefined })}
								variant={activeTab === tab.key ? "filled" : "outline"}
							>
								{tab.label}
							</Button>
						))}
					</div>
				</div>
				<div className="no-scrollbar overflow-x-auto px-0.5 py-0.5">
					<div className="flex items-center gap-2">
						<div className="relative">
							<FiSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-dark50" />
							<input
								type="text"
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								placeholder={tSchedule.searchByEmployeeName}
								className="h-10 w-[240px] rounded-[8px] border border-brand-dark10 bg-white pl-9 pr-3 text-sm outline-none"
							/>
						</div>
						<DatePickModal
							value={date ? date : undefined}
							onChange={(selectedDate) => {
								if (selectedDate) setParams({ date: selectedDate });
							}}
						/>
						<RxTextAlignBottom
							size={30}
							className="mx-1 mb-1.5 shrink-0 cursor-pointer text-brand-dark"
							onClick={handleSortToggle}
						/>
						<CreateLateEntryModalTrigger />
					</div>
				</div>
			</div>

			<div className="no-scrollbar hidden overflow-x-auto py-1 sm:block">
				<div className="flex w-full min-w-max items-center justify-between gap-4">
					<div className="flex items-center gap-2">
						{LATENESS_FILTER_TABS.map((tab) => (
							<Button
								key={tab.key}
								onClick={() => setParams({ activeTab: tab.key, employeeId: undefined })}
								variant={activeTab === tab.key ? "filled" : "outline"}
							>
								{tab.label}
							</Button>
						))}
					</div>
					<div className="flex items-center gap-2">
						<div className="relative">
							<FiSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-dark50" />
							<input
								type="text"
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								placeholder={tSchedule.searchByEmployeeName}
								className="h-10 w-[240px] rounded-[8px] border border-brand-dark10 bg-white pl-9 pr-3 text-sm outline-none"
							/>
						</div>
						<DatePickModal
							value={date ? date : undefined}
							onChange={(selectedDate) => {
								if (selectedDate) setParams({ date: selectedDate });
							}}
						/>
						<RxTextAlignBottom
							size={30}
							className="mx-1 mb-1.5 shrink-0 cursor-pointer text-brand-dark"
							onClick={handleSortToggle}
						/>
						<CreateLateEntryModalTrigger />
					</div>
				</div>
			</div>

			{/* DataTable */}
			<DataTable
				showGridLines
				stickyHeaderMode
				className="flex h-full flex-col"
				columns={latenessColumns}
				data={sortedData}
				isLoading={isUnhandledLoading || isHandledLoading}
				useSectionHeader={false}
				rowClassName={(row) =>
					employeeId && String(row.user?.employee?.id) === String(employeeId) ? "bg-gray-300 " : ""
				}
			/>
		</div>
	);
};

export default LatenessDetection;
