"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { POLICY_TAB } from "../utils/enums";

export const useDrivingSafetyPoliciesParams = () => {
	const searchParams = useSearchParams();
	const router = useRouter();

	const getParams = () => {
		const tab = searchParams.get("tab");

		return {
			tab: Object.values(POLICY_TAB).includes(tab as POLICY_TAB) ? (tab as POLICY_TAB) : POLICY_TAB.VIOLATIONS,
		};
	};

	const setParams = (params: { tab?: POLICY_TAB }) => {
		const newParams = new URLSearchParams(searchParams.toString());

		if (params.tab) newParams.set("tab", params.tab);

		router.replace(`?${newParams.toString()}`, { scroll: false });
	};

	return { getParams, setParams };
};
