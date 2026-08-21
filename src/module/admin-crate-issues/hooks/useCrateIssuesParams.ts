"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { CRATE_ISSUE_CATEGORY, CRATE_ISSUE_SEVERITY } from "@/module/crate-management/enums";
import { toDate, toMidnightDateString } from "@/lib/utils/date";

type AdminCrateIssuesParams = {
	jobNums?: number[];
	projectNums?: number[];
	technicianIds?: string[];
	issueTypes?: CRATE_ISSUE_CATEGORY[];
	severities?: CRATE_ISSUE_SEVERITY[];
	startDate?: string;
	endDate?: string;
	page?: number;
	pageSize?: number;
};

const adminCrateIssuesParamsKey = {
	jobNums: "jobNums",
	projectNums: "projectNums",
	technicianIds: "technicianIds",
	issueTypes: "issueTypes",
	severities: "severities",
	startDate: "startDate",
	endDate: "endDate",
	page: "page",
	pageSize: "pageSize",
};

export const useAdminCrateIssuesParams = () => {
	const searchParams = useSearchParams();
	const router = useRouter();

	const getParams = (): AdminCrateIssuesParams => {
		const jobNumsStr = searchParams.get(adminCrateIssuesParamsKey.jobNums);
		const projectNumsStr = searchParams.get(adminCrateIssuesParamsKey.projectNums);
		const technicianIdsStr = searchParams.get(adminCrateIssuesParamsKey.technicianIds);
		const issueTypesStr = searchParams.get(adminCrateIssuesParamsKey.issueTypes);
		const severitiesStr = searchParams.get(adminCrateIssuesParamsKey.severities);
		const startDateStr = searchParams.get(adminCrateIssuesParamsKey.startDate);
		const endDateStr = searchParams.get(adminCrateIssuesParamsKey.endDate);
		const pageStr = searchParams.get(adminCrateIssuesParamsKey.page);
		const pageSizeStr = searchParams.get(adminCrateIssuesParamsKey.pageSize);

		return {
			jobNums: jobNumsStr ? jobNumsStr.split("|").map((value) => parseInt(value, 10)) : undefined,
			projectNums: projectNumsStr ? projectNumsStr.split("|").map((value) => parseInt(value, 10)) : undefined,
			technicianIds: technicianIdsStr ? technicianIdsStr.split("|") : undefined,
			issueTypes: issueTypesStr ? (issueTypesStr.split("|") as CRATE_ISSUE_CATEGORY[]) : undefined,
			severities: severitiesStr ? (severitiesStr.split("|") as CRATE_ISSUE_SEVERITY[]) : undefined,
			startDate: startDateStr ? toMidnightDateString(toDate(startDateStr)) : undefined,
			endDate: endDateStr ? toMidnightDateString(toDate(endDateStr)) : undefined,
			page: pageStr ? parseInt(pageStr, 10) : 1,
			pageSize: pageSizeStr ? parseInt(pageSizeStr, 10) : 25,
		};
	};

	const setParams = (params: Partial<AdminCrateIssuesParams>, persistPreviousParams = true) => {
		const merged = persistPreviousParams ? { ...getParams(), ...params } : params;
		const newParams = new URLSearchParams();

		Object.entries(merged).forEach(([key, value]) => {
			const isEmpty = value === undefined || value === null || (Array.isArray(value) && value.length === 0);
			if (isEmpty) return;

			newParams.set(
				adminCrateIssuesParamsKey[key as keyof typeof adminCrateIssuesParamsKey],
				Array.isArray(value) ? value.join("|") : String(value)
			);
		});

		router.replace(`?${newParams.toString()}`, { scroll: false });
	};

	const clearParams = () => {
		router.replace("?", { scroll: false });
	};

	const clearDates = () => {
		const newParams = new URLSearchParams(searchParams.toString());
		newParams.delete(adminCrateIssuesParamsKey.startDate);
		newParams.delete(adminCrateIssuesParamsKey.endDate);
		router.replace(`?${newParams.toString()}`, { scroll: false });
	};

	return { getParams, setParams, clearParams, clearDates };
};
