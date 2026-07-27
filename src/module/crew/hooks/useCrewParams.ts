"use client";

import { useRouter, useSearchParams } from "next/navigation";

type CrewParams = {
	department?: string;
	crewLeader?: string;
	startDate?: string;
	endDate?: string;
};

const crewParamsKey = {
	department: "department",
	crewLeader: "crewLeader",
	startDate: "startDate",
	endDate: "endDate",
};

export const useCrewParams = () => {
	const searchParams = useSearchParams();
	const router = useRouter();

	const getParams = () => {
		return {
			department: searchParams.get(crewParamsKey.department) || undefined,
			crewLeader: searchParams.get(crewParamsKey.crewLeader) || undefined,
			startDate: searchParams.get(crewParamsKey.startDate) || undefined,
			endDate: searchParams.get(crewParamsKey.endDate) || undefined,
		};
	};

	const setParams = (params: Partial<CrewParams>, persistPreviousParams = true) => {
		const newParams = new URLSearchParams();
		const previous = getParams();

		if (persistPreviousParams) {
			Object.entries(previous).forEach(([key, value]) => {
				if (value) newParams.set(crewParamsKey[key as keyof typeof crewParamsKey], value.toString());
			});
		}

		const finalParams = persistPreviousParams ? { ...previous, ...params } : params;

		if (finalParams.department !== undefined) {
			newParams.set(crewParamsKey.department, finalParams.department);
		}
		if (finalParams.crewLeader !== undefined) {
			newParams.set(crewParamsKey.crewLeader, finalParams.crewLeader);
		}
		if (finalParams.startDate !== undefined) {
			newParams.set(crewParamsKey.startDate, finalParams.startDate);
		}
		if (finalParams.endDate !== undefined) {
			newParams.set(crewParamsKey.endDate, finalParams.endDate);
		}

		router.replace(`?${newParams.toString()}`, { scroll: false });
	};

	return { getParams, setParams };
};
