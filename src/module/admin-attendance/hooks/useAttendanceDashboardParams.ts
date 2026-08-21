"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { dateToUTCString, toDate } from "@/lib/utils/date";

type AttendanceDashboardParams = {
	startDate: Date | null;
	endDate: Date | null;
	page: number;
	pageSize: number;
};

const paramsKey: Record<keyof AttendanceDashboardParams, string> = {
	startDate: "startDate",
	endDate: "endDate",
	page: "page",
	pageSize: "pageSize",
};

export const useAttendanceDashboardParams = () => {
	const searchParams = useSearchParams();
	const router = useRouter();

	const getParams = (): AttendanceDashboardParams => {
		const paramStartDate = searchParams.get(paramsKey.startDate);
		const paramEndDate = searchParams.get(paramsKey.endDate);
		const paramPage = searchParams.get(paramsKey.page);
		const paramPageSize = searchParams.get(paramsKey.pageSize);

		return {
			startDate: paramStartDate ? toDate(paramStartDate) : null,
			endDate: paramEndDate ? toDate(paramEndDate) : null,
			page: paramPage ? parseInt(paramPage, 10) : 1,
			pageSize: paramPageSize ? parseInt(paramPageSize, 10) : 10,
		};
	};

	const setParams = (params: Partial<AttendanceDashboardParams>) => {
		const merged = { ...getParams(), ...params };
		const newParams = new URLSearchParams();

		if (merged.startDate) {
			newParams.set(paramsKey.startDate, dateToUTCString(merged.startDate));
		}
		if (merged.endDate) {
			newParams.set(paramsKey.endDate, dateToUTCString(merged.endDate));
		}
		if (merged.page !== 1) {
			newParams.set(paramsKey.page, merged.page.toString());
		}
		if (merged.pageSize !== 10) {
			newParams.set(paramsKey.pageSize, merged.pageSize.toString());
		}

		router.replace(`?${newParams.toString()}`, { scroll: false });
	};

	return { getParams, setParams };
};
