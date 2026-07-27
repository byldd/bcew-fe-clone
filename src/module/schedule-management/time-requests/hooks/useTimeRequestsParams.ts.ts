"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { getTodayDate, toFormattedDate } from "@/lib/utils/date";
import { toDate } from "date-fns";
import { tabParams } from "../utils/enums";

export const useTimeRequestsParams = () => {
	const searchParams = useSearchParams();
	const router = useRouter();

	const getParams = () => {
		const paramDate = searchParams.get("date");

		return {
			date: paramDate ? toDate(new Date(paramDate)) : toDate(getTodayDate()),
			tab: searchParams.get("tab") ?? tabParams.EXTENDED_TIME,
			status: searchParams.get("status") ?? undefined,
			type: searchParams.get("type") ?? undefined,
			employeeId: searchParams.get("employeeId") ?? undefined,
		};
	};

	const setParams = (params: {
		date?: Date | null;
		tab?: string;
		status?: string;
		type?: string;
		employeeId?: string;
	}) => {
		const previous = getParams();
		const newParams = new URLSearchParams();

		Object.entries(previous).forEach(([key, value]) => {
			if (!value) return;

			if (key === "date") {
				newParams.set("date", toFormattedDate(value as Date).slice(0, 10));
			} else {
				newParams.set(key, value as string);
			}
		});

		if (params.date === null) {
			newParams.delete("date");
		} else if (params.date) {
			newParams.set("date", toFormattedDate(params.date).slice(0, 10));
		}

		if (params.tab !== undefined) {
			if (params.tab) newParams.set("tab", params.tab);
			else newParams.delete("tab");
		}

		if (params.status !== undefined) {
			if (params.status) newParams.set("status", params.status);
			else newParams.delete("status");
		}

		if (params.type !== undefined) {
			if (params.type) newParams.set("type", params.type);
			else newParams.delete("type");
		}

		if (params.employeeId !== undefined) {
			if (params.employeeId) newParams.set("employeeId", params.employeeId);
			else newParams.delete("employeeId");
		}

		router.replace(`?${newParams.toString()}`, { scroll: false });
	};

	return { getParams, setParams };
};
