"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { addDays } from "date-fns";

const userActivityParamsKey = {
	startDate: "startDate",
	endDate: "endDate",
};

export const useUserActivityParams = () => {
	const searchParams = useSearchParams();
	const router = useRouter();

	const { startDate, endDate } = useMemo(() => {
		const today = new Date();
		const normalizedToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

		const paramStartDate = searchParams.get(userActivityParamsKey.startDate);
		const derivedStartDate = paramStartDate ? new Date(paramStartDate) : normalizedToday;

		const derivedEndDate = addDays(derivedStartDate, 6); // 7-day range

		return { startDate: derivedStartDate, endDate: derivedEndDate };
	}, [searchParams]);

	const setParams = (newStartDate: Date) => {
		const newEndDate = addDays(newStartDate, 6);
		const params = new URLSearchParams();
		params.set(userActivityParamsKey.startDate, newStartDate.toISOString());
		params.set(userActivityParamsKey.endDate, newEndDate.toISOString());

		router.replace(`?${params.toString()}`, { scroll: false });
	};

	return { startDate, endDate, setParams };
};
