"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { INCIDENT_TYPE_TAB } from "../utils/enums";

type IncidentReportsParams = {
	tab: INCIDENT_TYPE_TAB;
	search: string;
};

const paramsKey: Record<keyof IncidentReportsParams, string> = {
	tab: "tab",
	search: "search",
};

export const useIncidentReportsParams = () => {
	const searchParams = useSearchParams();
	const router = useRouter();

	const getParams = (): IncidentReportsParams => {
		const paramTab = searchParams.get(paramsKey.tab) as INCIDENT_TYPE_TAB;

		return {
			tab: Object.values(INCIDENT_TYPE_TAB).includes(paramTab) ? paramTab : INCIDENT_TYPE_TAB.ALL,
			search: searchParams.get(paramsKey.search) ?? "",
		};
	};

	const setParams = (params: Partial<IncidentReportsParams>) => {
		const previous = getParams();
		const newParams = new URLSearchParams();

		const merged = { ...previous, ...params };

		if (merged.tab && merged.tab !== INCIDENT_TYPE_TAB.ALL) {
			newParams.set(paramsKey.tab, merged.tab);
		}
		if (merged.search) {
			newParams.set(paramsKey.search, merged.search);
		}

		router.replace(`?${newParams.toString()}`, { scroll: false });
	};

	return { getParams, setParams };
};
