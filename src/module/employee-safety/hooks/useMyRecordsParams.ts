"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { dateToUTCString, toDate } from "@/lib/utils/date";

import { IMyRecordsParams, IMyRecordsParamsInput } from "../types";

const myRecordsParamsKey = {
	startDate: "startDate",
	endDate: "endDate",
};

export const useMyRecordsParams = () => {
	const searchParams = useSearchParams();
	const router = useRouter();

	const getParams = (): IMyRecordsParams => {
		const paramStartDate = searchParams.get(myRecordsParamsKey.startDate);
		const paramEndDate = searchParams.get(myRecordsParamsKey.endDate);

		return {
			startDate: paramStartDate ? toDate(paramStartDate) : null,
			endDate: paramEndDate ? toDate(paramEndDate) : null,
		};
	};

	const setParams = (params: IMyRecordsParamsInput, persistPreviousParams = true) => {
		const newParams = persistPreviousParams ? new URLSearchParams(searchParams.toString()) : new URLSearchParams();

		Object.entries(params).forEach(([key, value]) => {
			const urlKey = myRecordsParamsKey[key as keyof typeof myRecordsParamsKey];
			if (!urlKey) return;
			if (value === null || value === undefined) {
				newParams.delete(urlKey);
			} else {
				newParams.set(urlKey, dateToUTCString(value));
			}
		});

		router.replace(`?${newParams.toString()}`, { scroll: false });
	};

	return { getParams, setParams };
};
