"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { dateToUTCString, toDate } from "@/lib/utils/date";
import { REPORT_SOURCE, SAFETY_REPORT_STATUS } from "@/module/employee-safety/enums";
import { JOB_SITE_SAFETY_REPORT_TYPE, JOB_SITE_SAFETY_TAB } from "../enums";

type JobSiteSafetyDashboardParams = {
	startDate: Date | null;
	endDate: Date | null;
	tab: JOB_SITE_SAFETY_TAB;
	search: string;
	showResolvedClosed: boolean;
	typeFilter: JOB_SITE_SAFETY_REPORT_TYPE[];
	sourceFilter: REPORT_SOURCE[];
	statusFilter: SAFETY_REPORT_STATUS[];
	page: number;
	pageSize: number;
};

const paramsKey: Record<keyof JobSiteSafetyDashboardParams, string> = {
	startDate: "startDate",
	endDate: "endDate",
	tab: "tab",
	search: "search",
	showResolvedClosed: "showResolvedClosed",
	typeFilter: "type",
	sourceFilter: "source",
	statusFilter: "status",
	page: "page",
	pageSize: "pageSize",
};

const asEnumList = <T extends string>(value: string | null, allowed: T[]): T[] =>
	value ? value.split(",").filter((item): item is T => allowed.includes(item as T)) : [];

export const useJobSiteSafetyDashboardParams = () => {
	const searchParams = useSearchParams();
	const router = useRouter();

	const getParams = (): JobSiteSafetyDashboardParams => {
		const paramStartDate = searchParams.get(paramsKey.startDate);
		const paramEndDate = searchParams.get(paramsKey.endDate);
		const paramTab = searchParams.get(paramsKey.tab) as JOB_SITE_SAFETY_TAB;
		const paramPage = searchParams.get(paramsKey.page);
		const paramPageSize = searchParams.get(paramsKey.pageSize);

		return {
			startDate: paramStartDate ? toDate(paramStartDate) : null,
			endDate: paramEndDate ? toDate(paramEndDate) : null,
			tab: Object.values(JOB_SITE_SAFETY_TAB).includes(paramTab) ? paramTab : JOB_SITE_SAFETY_TAB.ALL,
			search: searchParams.get(paramsKey.search) ?? "",
			showResolvedClosed: searchParams.get(paramsKey.showResolvedClosed) === "true",
			typeFilter: asEnumList(searchParams.get(paramsKey.typeFilter), Object.values(JOB_SITE_SAFETY_REPORT_TYPE)),
			sourceFilter: asEnumList(searchParams.get(paramsKey.sourceFilter), Object.values(REPORT_SOURCE)),
			statusFilter: asEnumList(searchParams.get(paramsKey.statusFilter), Object.values(SAFETY_REPORT_STATUS)),
			page: paramPage ? parseInt(paramPage, 10) : 1,
			pageSize: paramPageSize ? parseInt(paramPageSize, 10) : 25,
		};
	};

	const setParams = (params: Partial<JobSiteSafetyDashboardParams>) => {
		const merged = { ...getParams(), ...params };
		const newParams = new URLSearchParams();

		if (merged.startDate) {
			newParams.set(paramsKey.startDate, dateToUTCString(merged.startDate));
		}
		if (merged.endDate) {
			newParams.set(paramsKey.endDate, dateToUTCString(merged.endDate));
		}
		if (merged.tab !== JOB_SITE_SAFETY_TAB.ALL) {
			newParams.set(paramsKey.tab, merged.tab);
		}
		if (merged.search) {
			newParams.set(paramsKey.search, merged.search);
		}
		if (merged.showResolvedClosed) {
			newParams.set(paramsKey.showResolvedClosed, "true");
		}
		if (merged.typeFilter.length) {
			newParams.set(paramsKey.typeFilter, merged.typeFilter.join(","));
		}
		if (merged.sourceFilter.length) {
			newParams.set(paramsKey.sourceFilter, merged.sourceFilter.join(","));
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
