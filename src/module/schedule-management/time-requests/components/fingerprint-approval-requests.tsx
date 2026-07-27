"use client";

import React, { useEffect, useMemo } from "react";
import { DataTable } from "@/components/shared/datatable/datatable";
import { useFingerprintApprovalRequests } from "../hooks/useTimeRequests";
import { useFingerprintApprovalColumns } from "../utils/fingerprint-approval-columns";
import { useTimeRequestsParams } from "../hooks/useTimeRequestsParams.ts";
import { cn } from "@/lib/utils/utils";
import { IFingerprintApproval, ITimeRequestFilters } from "../utils/types";
import { isSameDate, toMidnightDateString } from "@/lib/utils/date";
import { mapToFingerprintStatus } from "../utils";

interface FingerprintApprovalRequestsProps {
	startDate: Date;
	endDate: Date;
	filters: ITimeRequestFilters;
}

function FingerprintApprovalRequests({ startDate, endDate, filters }: FingerprintApprovalRequestsProps) {
	const { data, isPending } = useFingerprintApprovalRequests({
		status: mapToFingerprintStatus(filters.requestStatus),
		search: filters.search || undefined,
		startDate: toMidnightDateString(startDate),
		endDate: toMidnightDateString(endDate),
	});
	const { getParams } = useTimeRequestsParams();
	const { employeeId, date } = getParams();

	const columns = useFingerprintApprovalColumns();

	const highlightedRowId = useMemo(() => {
		if (!employeeId || !date || !data?.length) return undefined;
		return data.find((row) => row.employeeId === employeeId && isSameDate(row.date, date))?.id;
	}, [employeeId, date, data]);

	useEffect(() => {
		if (!highlightedRowId) return;
		const timer = setTimeout(() => {
			const el = document.getElementById(highlightedRowId);
			if (el) {
				el.scrollIntoView({ behavior: "smooth", block: "center" });
			}
		}, 100);
		return () => clearTimeout(timer);
	}, [highlightedRowId]);

	const isHighlighted = (row: IFingerprintApproval) =>
		!!employeeId && !!date && row.employeeId === employeeId && isSameDate(row.date, date);

	return (
		<DataTable
			className="fingerprint-approval-table flex h-full flex-col"
			title=""
			columns={columns}
			data={data ?? []}
			isLoading={isPending}
			useSectionHeader={false}
			showGridLines
			stickyHeaderMode
			rowClassName={(row: IFingerprintApproval) => cn(isHighlighted(row) ? "bg-brand-bgLightgrey" : "hover:bg-gray-50")}
		/>
	);
}

export default FingerprintApprovalRequests;
