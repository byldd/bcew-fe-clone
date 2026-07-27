"use client";

import { getTodayDate, toDate, toFormattedDate } from "@/lib/utils/date";

import { useRouter, useSearchParams } from "next/navigation";

import { ATTENDANCE_SOURCE, BCEW_ATTENDANCE_TYPE } from "../utils/enums";

type AttendanceParams = {
	date: Date;
	types?: BCEW_ATTENDANCE_TYPE[];
	source?: ATTENDANCE_SOURCE;
};

const attendanceParamsKey = {
	date: "date",
	types: "types",
	source: "source",
};

export const useAttendancesParams = () => {
	const searchParams = useSearchParams();

	const router = useRouter();

	const getParams = (): AttendanceParams => {
		const paramDate = searchParams.get(attendanceParamsKey.date);

		return {
			date: paramDate ? toDate(paramDate) : toDate(getTodayDate()),

			source: (searchParams.get(attendanceParamsKey.source) as ATTENDANCE_SOURCE) ?? ATTENDANCE_SOURCE.ALL,

			types: searchParams
				.getAll(attendanceParamsKey.types)
				.map((item) => Number(item))
				.filter((item) =>
					Object.values(BCEW_ATTENDANCE_TYPE).includes(item as BCEW_ATTENDANCE_TYPE)
				) as BCEW_ATTENDANCE_TYPE[],
		};
	};

	const setParams = (params: Partial<AttendanceParams>, persistPreviousParams = true) => {
		const previous = getParams();

		const newParams = new URLSearchParams();

		if (persistPreviousParams) {
			Object.entries(previous).forEach(([key, value]) => {
				if (value !== undefined && value !== null) {
					if (Array.isArray(value)) {
						value.forEach((item) => {
							newParams.append(attendanceParamsKey[key as keyof typeof attendanceParamsKey], item.toString());
						});
					} else if (value instanceof Date) {
						newParams.set(
							attendanceParamsKey[key as keyof typeof attendanceParamsKey],
							toFormattedDate(value).slice(0, 10)
						);
					} else {
						newParams.set(attendanceParamsKey[key as keyof typeof attendanceParamsKey], value.toString());
					}
				}
			});
		}

		if (params.date === null) {
			newParams.delete(attendanceParamsKey.date);
		} else if (params.date !== undefined) {
			newParams.set(attendanceParamsKey.date, params.date.toString());
		}

		if (params.source !== undefined) {
			newParams.set(attendanceParamsKey.source, params.source.toString());
		}

		if (params.types !== undefined) {
			newParams.delete(attendanceParamsKey.types);

			params.types.forEach((type) => {
				newParams.append(attendanceParamsKey.types, type.toString());
			});
		}

		router.replace(`?${newParams.toString()}`, {
			scroll: false,
		});
	};

	return {
		getParams,
		setParams,
	};
};
