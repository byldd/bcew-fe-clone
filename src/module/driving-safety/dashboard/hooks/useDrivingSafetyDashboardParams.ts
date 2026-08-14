"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { dateToUTCString, toDate } from "@/lib/utils/date";

type DashboardParams = {
	startDate: Date | null;
	endDate: Date | null;
};

const paramsKey: Record<keyof DashboardParams, string> = {
	startDate: "startDate",
	endDate: "endDate",
};

export const useDrivingSafetyDashboardParams = () => {
	const searchParams = useSearchParams();
	const router = useRouter();

	const getParams = (): DashboardParams => {
		const paramStartDate = searchParams.get(paramsKey.startDate);
		const paramEndDate = searchParams.get(paramsKey.endDate);

		return {
			startDate: paramStartDate ? toDate(paramStartDate) : null,
			endDate: paramEndDate ? toDate(paramEndDate) : null,
		};
	};

	const setParams = (params: Partial<DashboardParams>) => {
		const merged = { ...getParams(), ...params };
		const newParams = new URLSearchParams();

		if (merged.startDate) {
			newParams.set(paramsKey.startDate, dateToUTCString(merged.startDate));
		}
		if (merged.endDate) {
			newParams.set(paramsKey.endDate, dateToUTCString(merged.endDate));
		}

		router.replace(`?${newParams.toString()}`, { scroll: false });
	};

	return { getParams, setParams };
};
