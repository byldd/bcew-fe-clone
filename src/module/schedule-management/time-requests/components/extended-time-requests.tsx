"use client";

import React, { useMemo } from "react";
import { DataTable } from "@/components/shared/datatable/datatable";
import { useExtendedTimeRequestColumns } from "../utils/extended-time-columns";
import { applyExtendedTimeFilters, mapExtendedRequestsToRows } from "../utils";
import { toMidnightDateString } from "@/lib/utils/date";
import { useTimeLogsExtendedTimes } from "../hooks/useTimeRequests";
import { ITimeRequestFilters } from "../utils/types";

function ExtendedTimeRequests({
	startDate,
	endDate,
	filters,
}: {
	startDate: Date;
	endDate: Date;
	filters: ITimeRequestFilters;
}) {
	const { data, isPending } = useTimeLogsExtendedTimes({
		startDate: toMidnightDateString(startDate),
		endDate: toMidnightDateString(endDate),
	});

	const columns = useExtendedTimeRequestColumns();
	const tableData = mapExtendedRequestsToRows(data);

	const filteredData = useMemo(() => applyExtendedTimeFilters(tableData, filters), [tableData, filters]);

	return (
		<DataTable
			className="extended-time-table flex h-full flex-col"
			title=""
			columns={columns}
			data={filteredData ?? []}
			isLoading={isPending}
			useSectionHeader={false}
			showGridLines
			stickyHeaderMode
		/>
	);
}

export default ExtendedTimeRequests;
