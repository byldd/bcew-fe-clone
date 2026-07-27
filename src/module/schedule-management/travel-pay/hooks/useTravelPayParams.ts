"use client";

import { getTodayDate, toDate } from "@/lib/utils/date";
import { useRouter, useSearchParams } from "next/navigation";
import { TRAVEL_PAY_REQUEST_FILTER_STATUS, TRAVEL_PAY_REQUEST_SORT, TRAVEL_PAY_REQUEST_STATUS } from "../types";

type TravelPayParams = {
	date: Date;
	status?: TRAVEL_PAY_REQUEST_FILTER_STATUS | null;
	pdf?: boolean;
	travelPayRequestId?: string;
	sort?: TRAVEL_PAY_REQUEST_SORT | null;
};

const travelPayParamsKey = {
	date: "date",
	status: "status",
	pdf: "pdf",
	travelPayRequestId: "travelPayRequestId",
	sort: "sort",
};

export const useTravelPayParams = () => {
	const searchParams = useSearchParams();
	const router = useRouter();

	const getParams = () => {
		const paramDate = searchParams.get(travelPayParamsKey.date);
		const paramStatus = searchParams.get(travelPayParamsKey.status);

		const paramPdf = searchParams.get(travelPayParamsKey.pdf);
		const paramSort = searchParams.get(travelPayParamsKey.sort) as TRAVEL_PAY_REQUEST_SORT;
		return {
			date: paramDate ? toDate(paramDate) : toDate(getTodayDate()),
			pdf: paramPdf ? true : false,
			status: Object.values(TRAVEL_PAY_REQUEST_STATUS).includes(paramStatus as TRAVEL_PAY_REQUEST_STATUS)
				? paramStatus
				: TRAVEL_PAY_REQUEST_FILTER_STATUS.ALL,
			travelPayRequestId: searchParams.get(travelPayParamsKey.travelPayRequestId),
			sort: Object.values(TRAVEL_PAY_REQUEST_SORT).includes(paramSort as TRAVEL_PAY_REQUEST_SORT)
				? paramSort
				: TRAVEL_PAY_REQUEST_SORT.NAME_ASC,
		};
	};

	const setParams = (params: Partial<TravelPayParams>, persistPreviousParams = true) => {
		const previous = getParams();
		const newParams = new URLSearchParams();

		if (persistPreviousParams) {
			Object.entries(previous).forEach(([key, value]) => {
				if (value) newParams.set(travelPayParamsKey[key as keyof typeof travelPayParamsKey], value.toString());
			});
		}

		if (params.date === null) {
			newParams.delete(travelPayParamsKey.date);
		} else if (params.date != undefined) {
			newParams.set(travelPayParamsKey.date, params.date.toString());
		}

		if (params.status === null) {
			newParams.delete(travelPayParamsKey.status);
		} else if (params.status != undefined) {
			newParams.set(travelPayParamsKey.status, params.status);
		}

		if (params.sort === null) {
			newParams.delete(travelPayParamsKey.sort);
		} else if (params.sort != undefined) {
			newParams.set(travelPayParamsKey.sort, params.sort);
		}

		newParams.delete(travelPayParamsKey.travelPayRequestId);

		router.replace(`?${newParams.toString()}`, { scroll: false });
	};

	return { getParams, setParams };
};
