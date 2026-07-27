"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { TAB_TYPE } from "../types/release-note";

const releaseNoteParamsKey = {
	tab: "tab",
	date: "date",
};

export type ReleaseNoteTab = TAB_TYPE.ADMIN | TAB_TYPE.TECHNICIAN | TAB_TYPE.ALL;

type UseReleaseNoteTabParamOptions = {
	defaultTab: ReleaseNoteTab;
	allowedTabs: ReleaseNoteTab[];
};

export const useReleaseNoteTabParam = ({ defaultTab, allowedTabs }: UseReleaseNoteTabParamOptions) => {
	const pathname = usePathname();
	const router = useRouter();
	const searchParams = useSearchParams();

	const tabParam = searchParams.get(releaseNoteParamsKey.tab) as ReleaseNoteTab | null;
	const activeTab = tabParam && allowedTabs.includes(tabParam) ? tabParam : defaultTab;

	const replaceParams = (params: URLSearchParams) => {
		const query = params.toString();
		router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
	};

	const setActiveTab = (tab: ReleaseNoteTab, clearDate = false) => {
		const nextParams = new URLSearchParams(searchParams.toString());

		nextParams.set(releaseNoteParamsKey.tab, tab);

		if (clearDate) {
			nextParams.delete(releaseNoteParamsKey.date);
		}

		replaceParams(nextParams);
	};

	const clearDateParam = () => {
		const nextParams = new URLSearchParams(searchParams.toString());
		nextParams.delete(releaseNoteParamsKey.date);
		replaceParams(nextParams);
	};

	return { activeTab, setActiveTab, clearDateParam };
};
