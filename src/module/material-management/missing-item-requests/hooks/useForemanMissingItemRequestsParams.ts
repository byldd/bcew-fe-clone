"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { dateToUTCString, toDate } from "@/lib/utils/date";
import { DEFAULT_PAGE_SIZE } from "@/module/job/material-selection/utils/consttants";
import type { ForemanMissingItemRequestsParams, ForemanMissingItemRequestsParamsInput } from "../utils/types";

const foremanMissingItemRequestsParamsKey = {
	projectNumbers: "projectNumbers",
	jobNumbers: "jobNumbers",
	requestedByUserIds: "requestedByUserIds",
	jobNames: "jobNames",
	phaseNames: "phaseNames",
	statuses: "statuses",
	startDate: "startDate",
	endDate: "endDate",
	page: "page",
	pageSize: "pageSize",
	id: "id",
};

export const useForemanMissingItemRequestsParams = () => {
	const searchParams = useSearchParams();
	const router = useRouter();

	const getArrayParam = (urlKey: string) => (searchParams.get(urlKey) || "").split(",").filter(Boolean);

	const getParams = (): ForemanMissingItemRequestsParams => {
		const paramStartDate = searchParams.get(foremanMissingItemRequestsParamsKey.startDate);
		const paramEndDate = searchParams.get(foremanMissingItemRequestsParamsKey.endDate);

		const paramPage = Number(searchParams.get(foremanMissingItemRequestsParamsKey.page));
		const paramPageSize = Number(searchParams.get(foremanMissingItemRequestsParamsKey.pageSize));

		return {
			id: searchParams.get(foremanMissingItemRequestsParamsKey.id),
			startDate: paramStartDate ? toDate(paramStartDate) : null,
			endDate: paramEndDate ? toDate(paramEndDate) : null,
			projectNumbers: getArrayParam(foremanMissingItemRequestsParamsKey.projectNumbers).map(Number),
			jobNumbers: getArrayParam(foremanMissingItemRequestsParamsKey.jobNumbers).map(Number),
			jobNames: getArrayParam(foremanMissingItemRequestsParamsKey.jobNames).map(Number),
			phaseNames: getArrayParam(foremanMissingItemRequestsParamsKey.phaseNames),
			statuses: getArrayParam(foremanMissingItemRequestsParamsKey.statuses),
			requestedByUserIds: getArrayParam(foremanMissingItemRequestsParamsKey.requestedByUserIds),
			page: paramPage > 0 ? paramPage : 1,
			pageSize: paramPageSize > 0 ? paramPageSize : DEFAULT_PAGE_SIZE,
		};
	};

	const setParams = (params: ForemanMissingItemRequestsParamsInput, persistPreviousParams = true) => {
		const newParams = persistPreviousParams ? new URLSearchParams(searchParams.toString()) : new URLSearchParams();
		// Any filter/search/pagination change means the user is no longer looking
		// at a single notification deep link — drop it so the normal list resumes.
		newParams.delete(foremanMissingItemRequestsParamsKey.id);

		Object.entries(params).forEach(([key, value]) => {
			const urlKey = foremanMissingItemRequestsParamsKey[key as keyof typeof foremanMissingItemRequestsParamsKey];
			if (!urlKey) return;

			if (value === null || value === undefined || (Array.isArray(value) && value.length === 0)) {
				newParams.delete(urlKey);
				return;
			}

			if (Array.isArray(value)) {
				newParams.set(urlKey, value.join(","));
				return;
			}

			if ((key === "startDate" || key === "endDate") && value instanceof Date) {
				newParams.set(urlKey, dateToUTCString(value));
				return;
			}

			newParams.set(urlKey, String(value));
		});

		router.replace(`?${newParams.toString()}`, { scroll: false });
	};

	return { getParams, setParams };
};
