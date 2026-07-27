"use client";

import { getTodayDate, toDate } from "@/lib/utils/date";
import { useRouter, useSearchParams } from "next/navigation";

type HistoryParams = {
	date: Date;
};

const paramsKey = {
	date: "date",
};

export const useEmployeeHistoryParams = () => {
	const searchParams = useSearchParams();
	const router = useRouter();

	const getParams = (): HistoryParams => {
		const today = getTodayDate();
		const paramDate = searchParams.get(paramsKey.date);
		return {
			date: paramDate ? toDate(paramDate) : today,
		};
	};

	const setParams = (params: Partial<HistoryParams>, persistPreviousParams = true) => {
		const previous = getParams();
		const newParams = new URLSearchParams();

		if (persistPreviousParams) {
			newParams.set(paramsKey.date, previous.date.toString());
		}

		if (params.date != undefined) {
			newParams.set(paramsKey.date, params.date.toString());
		}

		router.replace(`?${newParams.toString()}`, { scroll: false });
	};

	return { getParams, setParams };
};
