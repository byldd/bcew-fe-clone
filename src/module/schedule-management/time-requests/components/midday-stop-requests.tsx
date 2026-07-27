"use client";

import React, { useMemo } from "react";
import { DataTable } from "@/components/shared/datatable/datatable";
import { toMidnightDateString } from "@/lib/utils/date";
import { useMiddayStopColumns } from "../utils/midday-stop-columns";
import { useMiddayStopRequests } from "../hooks/useTimeRequests";
import { applyMiddayStopFilters } from "../utils";
import { ITimeRequestFilters } from "../utils/types";

function MiddayStopRequests({
	startDate,
	endDate,
	filters,
}: {
	startDate: Date;
	endDate: Date;
	filters: ITimeRequestFilters;
}) {
	const { data, isPending } = useMiddayStopRequests({
		startDate: toMidnightDateString(startDate),
		endDate: toMidnightDateString(endDate),
	});

	const columns = useMiddayStopColumns();
	const filteredData = useMemo(() => applyMiddayStopFilters(data, filters), [data, filters]);

	return (
		<DataTable
			className="midday-stop-table"
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

export default MiddayStopRequests;
