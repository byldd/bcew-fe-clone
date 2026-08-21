"use client";

import { getTodayDate, toDate } from "@/lib/utils/date";
import { useRouter, useSearchParams } from "next/navigation";

type WeekReportParams = {
	date: Date;
	pdf?: boolean;
};

const weekReportParamsKey = {
	date: "date",
	pdf: "pdf",
};

export const useWeekReportParams = () => {
	const searchParams = useSearchParams();
	const router = useRouter();

	const getParams = () => {
		const paramDate = searchParams.get(weekReportParamsKey.date);
		const paramPdf = searchParams.get(weekReportParamsKey.pdf);

		return {
			date: paramDate ? toDate(paramDate) : toDate(getTodayDate()),
			pdf: paramPdf ? true : false,
		};
	};

	const setParams = (params: Partial<WeekReportParams>) => {
		const newParams = new URLSearchParams(searchParams.toString());

		if (params.date != undefined) {
			newParams.set(weekReportParamsKey.date, params.date.toString());
		}

		router.replace(`?${newParams.toString()}`, { scroll: false });
	};

	return { getParams, setParams };
};
