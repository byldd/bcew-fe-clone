"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { LATENESS_FILTER_TAB } from "../types";
import { dateToUTCString, getTodayDate } from "@/lib/utils/date";

export const latenessParamsKey = {
	activeTab: "tab",
	date: "date",
	employeeId: "employeeId",
};

export type LatenessParams = {
	activeTab: LATENESS_FILTER_TAB;
	date: string;
	employeeId?: string | null;
};

export const useLatenessParams = () => {
	const router = useRouter();
	const searchParams = useSearchParams();

	const getParams = useMemo<LatenessParams>(() => {
		const tab = (searchParams.get(latenessParamsKey.activeTab) as LATENESS_FILTER_TAB) ?? LATENESS_FILTER_TAB.UNHANDLED;
		const date = searchParams.get(latenessParamsKey.date) ?? dateToUTCString(getTodayDate());
		const employeeId = searchParams.get(latenessParamsKey.employeeId);

		if (!Object.values(LATENESS_FILTER_TAB).includes(tab)) {
			return { activeTab: LATENESS_FILTER_TAB.UNHANDLED, date, employeeId };
		}

		return { activeTab: tab, date, employeeId };
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [searchParams.toString()]);

	const setParams = (params: Partial<LatenessParams>, persistPreviousParams = true) => {
		const previous = getParams;
		const newParams = new URLSearchParams(searchParams.toString());

		const finalParams = persistPreviousParams ? { ...previous, ...params } : params;

		if (finalParams.activeTab) {
			newParams.set(latenessParamsKey.activeTab, finalParams.activeTab);
		}

		if (finalParams.date) {
			newParams.set(latenessParamsKey.date, finalParams.date);
		}

		if (finalParams.employeeId) {
			newParams.set(latenessParamsKey.employeeId, finalParams.employeeId);
		} else {
			newParams.delete(latenessParamsKey.employeeId);
		}

		router.replace(`?${newParams.toString()}`, { scroll: false });
	};

	return { getParams, setParams };
};
