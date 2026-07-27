"use client";

import { getTodayDate, toDate } from "@/lib/utils/date";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

const employeeScheduleParamsKey = {
	startDate: "startDate",
	screenLockout: "screenLockout",
};

interface IEmployeeScheduleParams {
	screenLockout: string;
	startDate: Date;
}

export const useEmployeeScheduleParams = () => {
	const searchParams = useSearchParams();
	const router = useRouter();

	const paramsDate = useMemo(() => {
		return searchParams.get(employeeScheduleParamsKey.startDate);
	}, [searchParams]);

	const screenLockout = useMemo(() => {
		return searchParams.get(employeeScheduleParamsKey.screenLockout);
	}, [searchParams]);

	const startDate = useMemo(() => {
		return paramsDate ? toDate(new Date(paramsDate)) : getTodayDate();
	}, [paramsDate]);

	const getParams = useCallback(() => {
		return {
			startDate,
			screenLockout,
		};
	}, [screenLockout, startDate]);

	const setParams = useCallback(
		(params: Partial<IEmployeeScheduleParams>, persistPreviousParams = true) => {
			const newParams = new URLSearchParams();
			const previous = getParams();

			if (persistPreviousParams) {
				Object.entries(previous).forEach(([key, value]) => {
					if (value)
						newParams.set(employeeScheduleParamsKey[key as keyof typeof employeeScheduleParamsKey], value.toString());
				});
			}

			if (params.startDate !== undefined) {
				newParams.set(employeeScheduleParamsKey.startDate, params.startDate.toString());
			}
			// if screenLockout is true, set it to true, else delete it
			if (params.screenLockout) {
				newParams.set(employeeScheduleParamsKey.screenLockout, params.screenLockout.toString());
			} else {
				newParams.delete(employeeScheduleParamsKey.screenLockout);
			}

			router.replace(`?${newParams.toString()}`, { scroll: false });
		},
		[router, getParams]
	);

	return { getParams, setParams };
};
