"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { TECHNICAL_ISSUE_STATUS, TECHNICAL_ISSUE_ACTION_FILTER } from "@/utils/enums";
import { toDate, toMidnightDateString } from "@/lib/utils/date";

type AdminTechnicalIssuesParams = {
	startDate?: string;
	endDate?: string;
	role?: string;
	status?: TECHNICAL_ISSUE_STATUS;
	action?: TECHNICAL_ISSUE_ACTION_FILTER;
	page?: number;
	pageSize?: number;
};

const adminTechnicalIssuesParamsKey = {
	startDate: "startDate",
	endDate: "endDate",
	role: "role",
	status: "status",
	action: "action",
	page: "page",
	pageSize: "pageSize",
};

export const useAdminTechnicalIssuesParams = () => {
	const searchParams = useSearchParams();
	const router = useRouter();

	const getParams = (): AdminTechnicalIssuesParams => {
		const startDateStr = searchParams.get(adminTechnicalIssuesParamsKey.startDate);
		const endDateStr = searchParams.get(adminTechnicalIssuesParamsKey.endDate);
		const pageStr = searchParams.get(adminTechnicalIssuesParamsKey.page);
		const pageSizeStr = searchParams.get(adminTechnicalIssuesParamsKey.pageSize);
		return {
			startDate: startDateStr ? toMidnightDateString(toDate(startDateStr)) : undefined,
			endDate: endDateStr ? toMidnightDateString(toDate(endDateStr)) : undefined,
			role: searchParams.get(adminTechnicalIssuesParamsKey.role) || undefined,
			status: (searchParams.get(adminTechnicalIssuesParamsKey.status) as TECHNICAL_ISSUE_STATUS) || undefined,
			action: (searchParams.get(adminTechnicalIssuesParamsKey.action) as TECHNICAL_ISSUE_ACTION_FILTER) || undefined,
			page: pageStr ? parseInt(pageStr, 10) : 1,
			pageSize: pageSizeStr ? parseInt(pageSizeStr, 10) : 25,
		};
	};

	const setParams = (params: Partial<AdminTechnicalIssuesParams>, persistPreviousParams = true) => {
		const newParams = new URLSearchParams();
		const previous = getParams();

		if (persistPreviousParams) {
			Object.entries(previous).forEach(([key, value]) => {
				if (value !== undefined && value !== null) {
					newParams.set(
						adminTechnicalIssuesParamsKey[key as keyof typeof adminTechnicalIssuesParamsKey],
						value.toString()
					);
				}
			});
		}

		if (params.startDate !== undefined) {
			newParams.set(adminTechnicalIssuesParamsKey.startDate, params.startDate.toString());
		}

		if (params.endDate !== undefined) {
			newParams.set(adminTechnicalIssuesParamsKey.endDate, params.endDate.toString());
		}

		if (params.role !== undefined) {
			newParams.set(adminTechnicalIssuesParamsKey.role, params.role);
		}

		if (params.status !== undefined) {
			newParams.set(adminTechnicalIssuesParamsKey.status, params.status);
		}

		if (params.action !== undefined) {
			newParams.set(adminTechnicalIssuesParamsKey.action, params.action);
		}

		if (params.page !== undefined) {
			newParams.set(adminTechnicalIssuesParamsKey.page, params.page.toString());
		}

		if (params.pageSize !== undefined) {
			newParams.set(adminTechnicalIssuesParamsKey.pageSize, params.pageSize.toString());
		}

		router.replace(`?${newParams.toString()}`, { scroll: false });
	};

	const clearParams = () => {
		router.replace("?", { scroll: false });
	};

	const clearDates = () => {
		const newParams = new URLSearchParams(searchParams.toString());
		newParams.delete(adminTechnicalIssuesParamsKey.startDate);
		newParams.delete(adminTechnicalIssuesParamsKey.endDate);
		router.replace(`?${newParams.toString()}`, { scroll: false });
	};

	return { getParams, setParams, clearParams, clearDates };
};
