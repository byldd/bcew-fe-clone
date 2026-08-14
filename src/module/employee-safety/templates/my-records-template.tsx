"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

import BackButton from "@/components/common/back-button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { cn } from "@/lib/utils/utils";
import { routes } from "@/config/routes";
import { toDate } from "@/lib/utils/date";

import MyRecordCard from "../components/my-record-card";
import { useMyRecords } from "../hooks/useVehicleAccident";
import { useMyRecordsParams } from "../hooks/useMyRecordsParams";
import { filterMyRecordsByQuery } from "../utils/filter-my-records";
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
	const { getParams, setParams } = useMyRecordsParams();
	const { startDate, endDate } = getParams();
	const { data: records } = useMyRecords(startDate, endDate);

	const [search, setSearch] = useState("");
	const [activeTab, setActiveTab] = useState<MY_RECORD_TAB>(MY_RECORD_TAB.ALL);

	const matched = useMemo(() => filterMyRecordsByQuery(records ?? [], search), [records, search]);

	const countByStatus = (status: TECHNICIAN_REPORT_STATUS) =>
		matched.filter((record) => record.status === status).length;

	const visible = matched.filter((record) => {
		if (activeTab === MY_RECORD_TAB.DRAFT) return record.status === TECHNICIAN_REPORT_STATUS.DRAFT;
		if (activeTab === MY_RECORD_TAB.PENDING) return record.status === TECHNICIAN_REPORT_STATUS.PENDING;
		if (activeTab === MY_RECORD_TAB.ADDITIONAL_INFO_REQUESTED)
			return record.status === TECHNICIAN_REPORT_STATUS.ADDITIONAL_INFO_REQUESTED;
		return true;
	});

	const tabs: { tab: MY_RECORD_TAB; label: string; count: number }[] = [
		{ tab: MY_RECORD_TAB.ALL, label: "All", count: matched.length },
		{ tab: MY_RECORD_TAB.DRAFT, label: "Drafts", count: countByStatus(TECHNICIAN_REPORT_STATUS.DRAFT) },
		{ tab: MY_RECORD_TAB.PENDING, label: "Pending", count: countByStatus(TECHNICIAN_REPORT_STATUS.PENDING) },
		{
			tab: MY_RECORD_TAB.ADDITIONAL_INFO_REQUESTED,
			label: "Additional Info. Requested",
			count: countByStatus(TECHNICIAN_REPORT_STATUS.ADDITIONAL_INFO_REQUESTED),
		},
	];

	return (
		<div className="flex min-h-screen w-full flex-col bg-brand-bgLightgrey p-4">
			<div className="mb-3 flex items-center justify-between gap-2">
				<div className="ml-[-10px] flex items-center gap-1">
					<BackButton />
					<h3 className="text-xl font-medium">My Records</h3>
				</div>
				<DatePicker
					className="border-none bg-white shadow-md hover:bg-white"
					mode="range"
					selected={{
						from: startDate ? toDate(startDate) : undefined,
						to: endDate ? toDate(endDate) : undefined,
					}}
					onSelect={(value) => setParams({ startDate: value?.from ?? null, endDate: value?.to ?? null })}
					onClear={() => setParams({ startDate: null, endDate: null })}
				/>
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

			<div className="mb-3 flex items-stretch gap-2">
				{tabs.map(({ tab, label, count }) => {
					const isWrapping = tab === MY_RECORD_TAB.ADDITIONAL_INFO_REQUESTED;
					return (
						<Button
							key={tab}
							type="button"
							onClick={() => setActiveTab(tab)}
							className={cn(
								"h-auto min-h-9 rounded-[8px] px-3 py-1 text-xs font-medium leading-tight",
								isWrapping ? "min-w-0 whitespace-normal text-center" : "shrink-0 whitespace-nowrap",
								activeTab === tab ? "bg-brand-dark text-white" : "bg-white text-brand-dark"
							)}
						>
							{label} ({count})
						</Button>
					);
				})}
			</div>

			<div className="space-y-3">
				{visible.map((record) => (
					<MyRecordCard key={record.id} record={record} onClick={() => router.push(recordEditRoute(record))} />
				))}
				{visible.length === 0 && <p className="mt-10 text-center text-sm text-brand-grey">No records found.</p>}
			</div>
		</div>
	);
};

export default MyRecordsTemplate;
