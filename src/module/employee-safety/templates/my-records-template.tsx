"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { addDays } from "date-fns";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";

import BackButton from "@/components/common/back-button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/utils";
import { routes } from "@/config/routes";
import { toFormattedDate } from "@/lib/utils/date";
import { DATE_FORMAT } from "@/types/date";
import { getWeekStartAndEndForDate } from "@/module/schedule-management/weekly-schedule-management/utils";

import MyRecordCard from "../components/my-record-card";
import { useMyRecords } from "../hooks/useVehicleAccident";
import { useMyRecordsParams } from "../hooks/useMyRecordsParams";
import { filterMyRecordsByDateRange, filterMyRecordsByQuery } from "../utils/filter-my-records";
import { MY_RECORD_TAB, SAFETY_REPORT_TYPE, TECHNICIAN_REPORT_STATUS } from "../enums";
import { IMyRecord } from "../types";
import { Button } from "@/components/ui/button";

const recordEditRoute = (record: IMyRecord): string => {
	const newReportRoute =
		record.type === SAFETY_REPORT_TYPE.JOB_SITE_INJURY
			? routes.employee.newJobSiteInjuryReport
			: routes.employee.newVehicleAccidentReport;
	return `${newReportRoute}?draftId=${record.id}`;
};

const MyRecordsTemplate = () => {
	const router = useRouter();
	const { data: records } = useMyRecords();
	const { getParams, setParams } = useMyRecordsParams();
	const { startDate, endDate } = getParams();

	const [search, setSearch] = useState("");
	const [activeTab, setActiveTab] = useState<MY_RECORD_TAB>(MY_RECORD_TAB.ALL);

	const handleDateRangeChange = (nextStart: Date | null, nextEnd: Date | null) => {
		setParams({ startDate: nextStart, endDate: nextEnd });
	};

	const currentWeek = getWeekStartAndEndForDate(new Date());
	const weekStart = startDate ?? currentWeek.start;
	const weekEnd = endDate ?? currentWeek.end;

	const handleMoveWeek = (direction: 1 | -1) => {
		handleDateRangeChange(addDays(weekStart, 7 * direction), addDays(weekEnd, 7 * direction));
	};

	const matched = useMemo(
		() => filterMyRecordsByQuery(filterMyRecordsByDateRange(records ?? [], weekStart, weekEnd), search),
		[records, search, weekStart, weekEnd]
	);

	const draftCount = matched.filter((record) => record.status === TECHNICIAN_REPORT_STATUS.DRAFT).length;
	const pendingCount = matched.filter((record) => record.status === TECHNICIAN_REPORT_STATUS.PENDING).length;

	const visible = matched.filter((record) => {
		if (activeTab === MY_RECORD_TAB.DRAFT) return record.status === TECHNICIAN_REPORT_STATUS.DRAFT;
		if (activeTab === MY_RECORD_TAB.PENDING) return record.status === TECHNICIAN_REPORT_STATUS.PENDING;
		return true;
	});

	const tabs: { tab: MY_RECORD_TAB; label: string; count: number }[] = [
		{ tab: MY_RECORD_TAB.ALL, label: "All", count: matched.length },
		{ tab: MY_RECORD_TAB.DRAFT, label: "Drafts", count: draftCount },
		{ tab: MY_RECORD_TAB.PENDING, label: "Pending", count: pendingCount },
	];

	return (
		<div className="flex min-h-screen w-full flex-col bg-brand-bgLightgrey p-4">
			<div className="mb-3 flex items-center justify-between gap-2">
				<div className="ml-[-10px] flex items-center gap-1">
					<BackButton />
					<h3 className="text-xl font-medium">My Records</h3>
				</div>
				<div className="flex h-9 shrink-0 items-center gap-2 rounded-[8px] border border-brand-dark10 bg-white px-3 text-xs font-medium text-brand-dark">
					<button type="button" onClick={() => handleMoveWeek(-1)} aria-label="Previous week">
						<ChevronLeft size={16} />
					</button>
					<span className="whitespace-nowrap">
						{toFormattedDate(weekStart, DATE_FORMAT.DATE)} - {toFormattedDate(weekEnd, DATE_FORMAT.DD_MMM)}
					</span>
					<button type="button" onClick={() => handleMoveWeek(1)} aria-label="Next week">
						<ChevronRight size={16} />
					</button>
				</div>
			</div>

			<div className="relative mb-3">
				<Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-grey" />
				<Input
					value={search}
					onChange={(event) => setSearch(event.target.value)}
					placeholder="Search here"
					className="rounded-[10px] border-none bg-white"
				/>
			</div>

			<div className="mb-3 flex items-center gap-2">
				{tabs.map(({ tab, label, count }) => (
					<Button
						key={tab}
						type="button"
						onClick={() => setActiveTab(tab)}
						className={cn(
							"h-9 rounded-[8px] px-3 text-xs font-medium",
							activeTab === tab ? "bg-brand-dark text-white" : "bg-white text-brand-dark"
						)}
					>
						{label} ({count})
					</Button>
				))}
			</div>

			<div className="space-y-3">
				{visible.map((record) => {
					const isEditable =
						record.status === TECHNICIAN_REPORT_STATUS.DRAFT || record.status === TECHNICIAN_REPORT_STATUS.PENDING;
					return (
						<MyRecordCard
							key={record.id}
							record={record}
							onClick={isEditable ? () => router.push(recordEditRoute(record)) : undefined}
						/>
					);
				})}
				{visible.length === 0 && <p className="mt-10 text-center text-sm text-brand-grey">No records for this week.</p>}
			</div>
		</div>
	);
};

export default MyRecordsTemplate;
