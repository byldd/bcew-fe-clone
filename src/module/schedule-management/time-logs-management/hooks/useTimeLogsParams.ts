"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { ITimeLogsParams } from "../types";
import { TimeLogsParamsKey } from "../utils/constants";
import { convertToISODate, toDate, toFormattedDate } from "@/lib/utils/date";

export const useTimeLogsParams = () => {
	const searchParams = useSearchParams();
	const router = useRouter();

	const { effectiveStartDate } = useMemo(() => {
		const today = toDate(new Date());

		const paramStartDate = searchParams.get(TimeLogsParamsKey.startDate);
		const effectiveStartDate = paramStartDate ? toDate(convertToISODate(paramStartDate)) : today;
		return { effectiveStartDate };
	}, [searchParams]);

	const getParams = () => ({
		startDate: effectiveStartDate,
		userName: searchParams.get(TimeLogsParamsKey.userName),
		activeTeam: searchParams.get(TimeLogsParamsKey.activeTeam) || undefined,
	});

	const setParams = (params: Partial<ITimeLogsParams>, persistPreviousParams = true) => {
		const newParams = new URLSearchParams();
		const previous = getParams();

		if (persistPreviousParams) {
			Object.entries(previous).forEach(([key, value]) => {
				//  user name is temparory key no need to persist
				if (value && key != TimeLogsParamsKey.userName)
					newParams.set(
						TimeLogsParamsKey[key as keyof typeof TimeLogsParamsKey],
						key === TimeLogsParamsKey.startDate ? toFormattedDate(value).slice(0, 10) : (value as string)
					);
			});
		}

		if (params.startDate) {
			newParams.set(TimeLogsParamsKey.startDate, toFormattedDate(params.startDate).slice(0, 10));
		}
		if (params.activeTeam !== undefined) {
			newParams.set(TimeLogsParamsKey.activeTeam, params.activeTeam);
		}
		router.replace(`?${newParams.toString()}`, { scroll: false });
	};

	return { getParams, setParams };
};
