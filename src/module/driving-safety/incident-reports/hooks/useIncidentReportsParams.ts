"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { dateToUTCString, toDate } from "@/lib/utils/date";

import { INCIDENT_REPORT_STATUS, INCIDENT_SEVERITY, INCIDENT_TYPE, INCIDENT_TYPE_TAB } from "../utils/enums";

type IncidentReportsParams = {
	tab: INCIDENT_TYPE_TAB;
	search: string;
	startDate: Date | null;
	endDate: Date | null;
	showResolvedClosed: boolean;
	typeFilter: INCIDENT_TYPE[];
	severityFilter: INCIDENT_SEVERITY[];
	statusFilter: INCIDENT_REPORT_STATUS[];
	page: number;
	pageSize: number;
};

const paramsKey: Record<keyof IncidentReportsParams, string> = {
	tab: "tab",
	search: "search",
	startDate: "startDate",
	endDate: "endDate",
	showResolvedClosed: "showResolvedClosed",
	typeFilter: "type",
	severityFilter: "severity",
	statusFilter: "status",
	page: "page",
	pageSize: "pageSize",
};

const asEnumList = <T extends string>(value: string | null, allowed: T[]): T[] =>
	value ? value.split(",").filter((item): item is T => allowed.includes(item as T)) : [];

export const useIncidentReportsParams = () => {
	const searchParams = useSearchParams();
	const router = useRouter();

	const getParams = (): IncidentReportsParams => {
		const paramTab = searchParams.get(paramsKey.tab) as INCIDENT_TYPE_TAB;
		const paramStartDate = searchParams.get(paramsKey.startDate);
		const paramEndDate = searchParams.get(paramsKey.endDate);
		const paramPage = searchParams.get(paramsKey.page);
		const paramPageSize = searchParams.get(paramsKey.pageSize);

		return {
			tab: Object.values(INCIDENT_TYPE_TAB).includes(paramTab) ? paramTab : INCIDENT_TYPE_TAB.ALL,
			search: searchParams.get(paramsKey.search) ?? "",
			startDate: paramStartDate ? toDate(paramStartDate) : null,
			endDate: paramEndDate ? toDate(paramEndDate) : null,
			showResolvedClosed: searchParams.get(paramsKey.showResolvedClosed) === "true",
			typeFilter: asEnumList(searchParams.get(paramsKey.typeFilter), Object.values(INCIDENT_TYPE)),
			severityFilter: asEnumList(searchParams.get(paramsKey.severityFilter), Object.values(INCIDENT_SEVERITY)),
			statusFilter: asEnumList(searchParams.get(paramsKey.statusFilter), Object.values(INCIDENT_REPORT_STATUS)),
			page: paramPage ? parseInt(paramPage, 10) : 1,
			pageSize: paramPageSize ? parseInt(paramPageSize, 10) : 25,
		};
	};

	const setParams = (params: Partial<IncidentReportsParams>) => {
		const merged = { ...getParams(), ...params };
		const newParams = new URLSearchParams();

		if (merged.tab && merged.tab !== INCIDENT_TYPE_TAB.ALL) {
			newParams.set(paramsKey.tab, merged.tab);
		}
		if (merged.search) {
			newParams.set(paramsKey.search, merged.search);
		}
		if (merged.startDate) {
			newParams.set(paramsKey.startDate, dateToUTCString(merged.startDate));
		}
		if (merged.endDate) {
			newParams.set(paramsKey.endDate, dateToUTCString(merged.endDate));
		}
		if (merged.showResolvedClosed) {
			newParams.set(paramsKey.showResolvedClosed, "true");
		}
		if (merged.typeFilter.length) {
			newParams.set(paramsKey.typeFilter, merged.typeFilter.join(","));
		}
		if (merged.severityFilter.length) {
			newParams.set(paramsKey.severityFilter, merged.severityFilter.join(","));
		}
		if (merged.statusFilter.length) {
			newParams.set(paramsKey.statusFilter, merged.statusFilter.join(","));
		}
		if (merged.page !== 1) {
			newParams.set(paramsKey.page, merged.page.toString());
		}
		if (merged.pageSize !== 25) {
			newParams.set(paramsKey.pageSize, merged.pageSize.toString());
		}

		router.replace(`?${newParams.toString()}`, { scroll: false });
	};

	return { getParams, setParams };
};
