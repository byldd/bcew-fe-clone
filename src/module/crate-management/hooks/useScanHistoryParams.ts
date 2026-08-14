"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { CRATE_SCAN_ACTION } from "../enums";

export const SCAN_HISTORY_TAB_ALL = "all" as const;
export type ScanHistoryTab = typeof SCAN_HISTORY_TAB_ALL | CRATE_SCAN_ACTION;

type ScanHistoryParams = {
	tab: ScanHistoryTab;
	startDate?: string;
	endDate?: string;
};

const scanHistoryParamsKey = {
	tab: "tab",
	startDate: "startDate",
	endDate: "endDate",
};

export const useScanHistoryParams = () => {
	const searchParams = useSearchParams();
	const router = useRouter();

	const getParams = (): ScanHistoryParams => {
		const tab = searchParams.get(scanHistoryParamsKey.tab) as ScanHistoryTab | null;

		return {
			tab: tab ?? SCAN_HISTORY_TAB_ALL,
			startDate: searchParams.get(scanHistoryParamsKey.startDate) ?? undefined,
			endDate: searchParams.get(scanHistoryParamsKey.endDate) ?? undefined,
		};
	};

	const setParams = (params: Partial<ScanHistoryParams>, persistPreviousParams = true) => {
		const newParams = new URLSearchParams();
		const previous = getParams();

		if (persistPreviousParams) {
			Object.entries(previous).forEach(([key, value]) => {
				if (value !== undefined && value !== null) {
					newParams.set(scanHistoryParamsKey[key as keyof typeof scanHistoryParamsKey], value.toString());
				}
			});
		}

		if (params.tab !== undefined) {
			newParams.set(scanHistoryParamsKey.tab, params.tab);
		}
		if (params.startDate !== undefined) {
			newParams.set(scanHistoryParamsKey.startDate, params.startDate);
		}
		if (params.endDate !== undefined) {
			newParams.set(scanHistoryParamsKey.endDate, params.endDate);
		}

		router.replace(`?${newParams.toString()}`, { scroll: false });
	};

	const clearDates = () => {
		const newParams = new URLSearchParams(searchParams.toString());
		newParams.delete(scanHistoryParamsKey.startDate);
		newParams.delete(scanHistoryParamsKey.endDate);
		router.replace(`?${newParams.toString()}`, { scroll: false });
	};

	return { getParams, setParams, clearDates };
};
