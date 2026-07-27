"use client";

import { dateToUTCString, toDate } from "@/lib/utils/date";
import { useRouter, useSearchParams } from "next/navigation";
import { MaterialRequestParams, MaterialRequestParamsInput } from "../utils/types";

const materialRequestParamsKey = {
	startDate: "startDate",
	endDate: "endDate",
	requestNumberFilter: "requestNumber",
	keywordFilter: "keyword",
	phaseFilter: "phase",
	jobFilter: "job",
	jobNumberFilter: "jobNumber",
	builderFilter: "builder",
	projectFilter: "project",
	modelFilter: "model",
	departmentFilter: "department",
	partCodeFilter: "partCode",
	partNameFilter: "partName",
	reasonFilter: "reason",
	requestedByFilter: "requestedBy",
};

export const useMaterialRequestParams = () => {
	const searchParams = useSearchParams();
	const router = useRouter();

	const serializeParamValue = (key: keyof typeof materialRequestParamsKey, value: unknown) => {
		if ((key === "startDate" || key === "endDate") && value instanceof Date) {
			return dateToUTCString(value);
		}
		return value?.toString() ?? "";
	};

	const getParams = (): MaterialRequestParams => {
		const paramStartDate = searchParams.get(materialRequestParamsKey.startDate);
		const paramEndDate = searchParams.get(materialRequestParamsKey.endDate);

		return {
			startDate: paramStartDate ? toDate(paramStartDate) : null,
			endDate: paramEndDate ? toDate(paramEndDate) : null,
			requestNumberFilter: searchParams.get(materialRequestParamsKey.requestNumberFilter) || "",
			keywordFilter: searchParams.get(materialRequestParamsKey.keywordFilter) || "",
			phaseFilter: searchParams.get(materialRequestParamsKey.phaseFilter) || "",
			jobFilter: searchParams.get(materialRequestParamsKey.jobFilter) || "",
			jobNumberFilter: searchParams.get(materialRequestParamsKey.jobNumberFilter) || "",
			builderFilter: searchParams.get(materialRequestParamsKey.builderFilter) || "",
			projectFilter: searchParams.get(materialRequestParamsKey.projectFilter) || "",
			modelFilter: searchParams.get(materialRequestParamsKey.modelFilter) || "",
			departmentFilter: searchParams.get(materialRequestParamsKey.departmentFilter) || "",
			partCodeFilter: searchParams.get(materialRequestParamsKey.partCodeFilter) || "",
			partNameFilter: searchParams.get(materialRequestParamsKey.partNameFilter) || "",
			reasonFilter: searchParams.get(materialRequestParamsKey.reasonFilter) || "",
			requestedByFilter: searchParams.get(materialRequestParamsKey.requestedByFilter) || "",
		};
	};

	const setParams = (params: MaterialRequestParamsInput, persistPreviousParams = true) => {
		// Build on top of the live URL string so no existing params are silently dropped.
		const newParams = persistPreviousParams ? new URLSearchParams(searchParams.toString()) : new URLSearchParams();

		Object.entries(params).forEach(([key, value]) => {
			const urlKey = materialRequestParamsKey[key as keyof typeof materialRequestParamsKey];
			if (!urlKey) return;
			if (value === null || value === undefined) {
				newParams.delete(urlKey);
			} else {
				newParams.set(urlKey, serializeParamValue(key as keyof typeof materialRequestParamsKey, value));
			}
		});

		router.replace(`?${newParams.toString()}`, { scroll: false });
	};

	return { getParams, setParams };
};
