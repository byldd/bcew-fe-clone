"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { SUB_CONTRACTOR_CREW_STATUS } from "../types";

export const subContractorCrewsKey = {
	page: "page",
	pageSize: "pageSize",
	activeSubContractor: "activeSubContractor",
	crewStatus: "crewStatus",
};

export type SubContractorCrewsParams = {
	page: number;
	pageSize: number;
	activeSubContractor?: string;
	crewStatus: SUB_CONTRACTOR_CREW_STATUS;
};

export const useSubContractorCrewsParams = () => {
	const router = useRouter();
	const searchParams = useSearchParams();

	const getParams = (): SubContractorCrewsParams => {
		const page = parseInt(searchParams.get(subContractorCrewsKey.page) || "1");
		const pageSize = parseInt(searchParams.get(subContractorCrewsKey.pageSize) || "10");
		const activeSubContractor = searchParams.get(subContractorCrewsKey.activeSubContractor) || "";
		const crewStatus =
			(searchParams.get(subContractorCrewsKey.crewStatus) as SUB_CONTRACTOR_CREW_STATUS) ||
			SUB_CONTRACTOR_CREW_STATUS.ACTIVE;

		return { page, pageSize, activeSubContractor, crewStatus };
	};

	const setParams = (params: Partial<SubContractorCrewsParams>, persistPreviousParams = true) => {
		const newParams = new URLSearchParams();
		const previous = getParams();

		if (persistPreviousParams) {
			Object.entries(previous).forEach(([key, value]) => {
				if (value !== undefined) {
					newParams.set(subContractorCrewsKey[key as keyof typeof subContractorCrewsKey], value.toString());
				}
			});
		}

		const finalParams = persistPreviousParams ? { ...previous, ...params } : params;

		if (finalParams.page !== undefined) {
			newParams.set(subContractorCrewsKey.page, finalParams.page.toString());
		}
		if (finalParams.pageSize !== undefined) {
			newParams.set(subContractorCrewsKey.pageSize, finalParams.pageSize.toString());
		}
		if (finalParams.activeSubContractor === null) {
			newParams.delete(subContractorCrewsKey.activeSubContractor);
		} else if (finalParams.activeSubContractor !== undefined) {
			newParams.set(subContractorCrewsKey.activeSubContractor, finalParams.activeSubContractor);
		}

		if (finalParams.crewStatus === null) {
			newParams.delete(subContractorCrewsKey.crewStatus);
		} else if (finalParams.crewStatus !== undefined) {
			newParams.set(subContractorCrewsKey.crewStatus, finalParams.crewStatus);
		}

		router.replace(`?${newParams.toString()}`, { scroll: false });
	};

	return { getParams, setParams };
};
