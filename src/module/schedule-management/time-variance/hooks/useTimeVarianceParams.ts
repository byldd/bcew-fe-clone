"use client";

import { getTodayDate, toDate, toFormattedDate } from "@/lib/utils/date";
import { useRouter, useSearchParams } from "next/navigation";

type TimeVarianceParams = {
	date: Date | null;
};

const timeVarianceParamsKey = {
	date: "date",
};

export const useTimeVarianceParams = () => {
	const searchParams = useSearchParams();
	const router = useRouter();

	const getParams = () => {
		const paramDate = searchParams.get(timeVarianceParamsKey.date);
		return {
			date: paramDate ? toDate(paramDate) : toDate(getTodayDate()),
		};
	};
	const setParams = (params: Partial<TimeVarianceParams>, persistPreviousParams = true) => {
		const previous = getParams();
		const newParams = new URLSearchParams();

		if (persistPreviousParams) {
			Object.entries(previous).forEach(([key, value]) => {
				if (value)
					newParams.set(
						timeVarianceParamsKey[key as keyof typeof timeVarianceParamsKey],
						toFormattedDate(value).slice(0, 10)
					);
			});
		}

		if (params.date === null) {
			newParams.delete(timeVarianceParamsKey.date);
		} else if (params.date !== undefined) {
			newParams.set(timeVarianceParamsKey.date, params.date.toString());
		}

		router.replace(`?${newParams.toString()}`, { scroll: false });
	};

	return { getParams, setParams };
};
