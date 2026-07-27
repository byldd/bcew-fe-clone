"use client";

import React, { useMemo, useState } from "react";
import SectionHeader from "@/components/shared/section-header";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import EmployeeTimeConfigDatePick from "@/module/schedule-management/roster-time-configuration/components/employee-time-config-date-pick";
import { DataTable } from "@/components/shared/datatable/datatable";
import type { ColumnDef } from "@tanstack/react-table";
import { useGetAdminStorageUnits } from "../hooks/useStorageUnit";
import { dateToUTCString, toFormattedDate } from "@/lib/utils/date";
import { useAdminStorageUnitParams } from "../hooks/useAdminStorageUnitParams";
import { DATE_FORMAT } from "@/types/date";
import { Spinner } from "@/components/ui/spinner";
import { isProductionEnv } from "@/utils";

export default function StorageUnitReport() {
	const { getParams } = useAdminStorageUnitParams();
	const { startDate, endDate } = getParams;

	const { data = [], isPending } = useGetAdminStorageUnits({
		startDate: dateToUTCString(startDate),
		endDate: dateToUTCString(endDate),
	});

	const [search, setSearch] = useState("");

	const dates = useMemo(() => {
		const start = startDate ?? new Date();
		return Array.from({ length: 7 }).map((_, i) => {
			const d = new Date(start);
			d.setDate(start.getDate() + i);
			return d;
		});
	}, [startDate]);

	const filteredData = useMemo(() => {
		if (!search.trim()) return data;

		const term = search.toLowerCase();

		return data.filter(
			(m) =>
				m.FirstName.toLowerCase().includes(term) ||
				m.storageUnits.some(
					(s) => (s.projectName || "").toLowerCase().includes(term) || (s.ZoneName || "").toLowerCase().includes(term)
				)
		);
	}, [search, data]);

	const columns: ColumnDef<(typeof data)[number]>[] = useMemo(() => {
		const cols: ColumnDef<(typeof data)[number]>[] = [
			{
				accessorKey: "FirstName",
				header: "Employee",
				cell: ({ row }) => <div className="text-xs font-medium">{row.original.FirstName}</div>,
			},
		];

		dates.forEach((date, idx) => {
			const dayKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
				2,
				"0"
			)}-${String(date.getDate()).padStart(2, "0")}`;

			cols.push({
				id: `day-${idx}`,
				header: () => {
					const dayNum = date.toLocaleDateString(undefined, {
						month: "numeric",
						day: "numeric",
					});
					const weekday = date.toLocaleDateString(undefined, {
						weekday: "short",
					});
					return (
						<div className="flex flex-col items-center px-1 text-xs font-medium text-muted-foreground">
							<span>{dayNum}</span>
							<span className="text-[10px] text-gray-500">{weekday}</span>
						</div>
					);
				},
				cell: ({ row }) => {
					const entries = (row.original.storageUnits || []).filter((s) => {
						return s.ActiveFrom && toFormattedDate(s.ActiveFrom, DATE_FORMAT.YYYY_MM_DD) === dayKey;
					});

					if (!entries.length) return "--";

					return (
						<div className="flex flex-col items-center gap-1">
							{entries.map((entry, i) => (
								<div key={entry.id + "-" + i} className="w-full">
									{entry.projectName ? (
										<div className="rounded border border-gray-100 p-1.5">
											<div className="text-[10px] text-gray-500">Storage Unit</div>
											<div className="text-[11px] font-semibold text-brand-dark">{entry.projectName ?? "--"}</div>
											<div className="text-[10px] text-gray-500">Type of work</div>
											{entry.isMaterialPickup ? (
												<div className="mt-0.5 inline-flex rounded-full bg-green-50 px-1.5 py-px text-[10px] text-green-700">
													Material Pickup
												</div>
											) : (
												<div className="mt-0.5 inline-flex rounded-full bg-yellow-50 px-1.5 py-px text-[10px] text-yellow-700">
													Material DropOff
												</div>
											)}
											<div className="text-[10px] text-gray-500">{entry.ZoneName ?? ""}</div>
											{!entry.isScheduled && (
												<div className="mt-0.5 inline-flex rounded-full bg-red-50 px-1.5 py-px text-[10px] text-red-600">
													UnScheduled
												</div>
											)}
										</div>
									) : (
										<div className="rounded border border-gray-100 p-1.5 text-[11px]">--</div>
									)}
								</div>
							))}
						</div>
					);
				},
			});
		});

		return cols;
	}, [dates]);

	if (isProductionEnv()) {
		return <div>Storage Unit Report</div>;
	}

	return (
		<div className="w-full space-y-4">
			{/* Header row — stacks on mobile, side-by-side on sm+ */}
			<div className="flex flex-col gap-3 py-1 sm:flex-row sm:items-center sm:justify-between">
				<SectionHeader title="Storage Unit Report" />

				{/* Search + date picker — horizontally scrollable on very narrow screens */}
				<div className="no-scrollbar overflow-x-auto">
					<div className="flex min-w-max items-center gap-2 p-1">
						<Input
							className="w-[280px]"
							icon={<Search className="h-4 w-4 text-muted-foreground" />}
							placeholder="Search by member, project or job"
							onChange={(e) => setSearch(e.target.value)}
							value={search}
						/>
						<EmployeeTimeConfigDatePick />
					</div>
				</div>
			</div>

			{/* Table */}
			{isPending ? (
				<Spinner />
			) : (
				<DataTable showGridLines stickyHeaderMode columns={columns} data={filteredData} useSectionHeader={false} />
			)}
		</div>
	);
}
