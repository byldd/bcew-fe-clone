"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { CRATE_SCAN_ACTION } from "@/module/crate-management/enums";
import { toDate, toMidnightDateString } from "@/lib/utils/date";

type AdminCrateActivityParams = {
	jobNums?: number[];
	projectNums?: number[];
	status?: CRATE_SCAN_ACTION[];
	technicianIds?: string[];
	startDate?: string;
	endDate?: string;
	page?: number;
	pageSize?: number;
};

const adminCrateActivityParamsKey = {
	jobNums: "jobNums",
	projectNums: "projectNums",
	status: "status",
	technicianIds: "technicianIds",
	startDate: "startDate",
	endDate: "endDate",
	page: "page",
	pageSize: "pageSize",
};

export const useAdminCrateActivityParams = () => {
	const searchParams = useSearchParams();
	const router = useRouter();

	const getParams = (): AdminCrateActivityParams => {
		const jobNumsStr = searchParams.get(adminCrateActivityParamsKey.jobNums);
		const projectNumsStr = searchParams.get(adminCrateActivityParamsKey.projectNums);
		const statusStr = searchParams.get(adminCrateActivityParamsKey.status);
		const technicianIdsStr = searchParams.get(adminCrateActivityParamsKey.technicianIds);
		const startDateStr = searchParams.get(adminCrateActivityParamsKey.startDate);
		const endDateStr = searchParams.get(adminCrateActivityParamsKey.endDate);
		const pageStr = searchParams.get(adminCrateActivityParamsKey.page);
		const pageSizeStr = searchParams.get(adminCrateActivityParamsKey.pageSize);

		return {
			jobNums: jobNumsStr ? jobNumsStr.split("|").map((value) => parseInt(value, 10)) : undefined,
			projectNums: projectNumsStr ? projectNumsStr.split("|").map((value) => parseInt(value, 10)) : undefined,
			status: statusStr ? (statusStr.split("|") as CRATE_SCAN_ACTION[]) : undefined,
			technicianIds: technicianIdsStr ? technicianIdsStr.split("|") : undefined,
			startDate: startDateStr ? toMidnightDateString(toDate(startDateStr)) : undefined,
			endDate: endDateStr ? toMidnightDateString(toDate(endDateStr)) : undefined,
			page: pageStr ? parseInt(pageStr, 10) : 1,
			pageSize: pageSizeStr ? parseInt(pageSizeStr, 10) : 25,
		};
	};

	const setParams = (params: Partial<AdminCrateActivityParams>, persistPreviousParams = true) => {
		const merged = persistPreviousParams ? { ...getParams(), ...params } : params;
		const newParams = new URLSearchParams();

		Object.entries(merged).forEach(([key, value]) => {
			const isEmpty = value === undefined || value === null || (Array.isArray(value) && value.length === 0);
			if (isEmpty) return;

			newParams.set(
				adminCrateActivityParamsKey[key as keyof typeof adminCrateActivityParamsKey],
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
		newParams.delete(adminCrateActivityParamsKey.startDate);
		newParams.delete(adminCrateActivityParamsKey.endDate);
		router.replace(`?${newParams.toString()}`, { scroll: false });
	};

	return { getParams, setParams, clearParams, clearDates };
};
