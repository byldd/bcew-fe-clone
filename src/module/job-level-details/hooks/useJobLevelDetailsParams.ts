"use client";

import { useRouter, useSearchParams } from "next/navigation";

type JobLevelDetailsParamsKey = {
	status?: string;
};

const jobLevelDetailsParamsKey = {
	status: "status",
};

export const useJobLevelDetailsParams = () => {
	const searchParams = useSearchParams();
	const router = useRouter();

	const getParams = (): JobLevelDetailsParamsKey => {
		return {
			status: searchParams.get("status") || undefined,
		};
	};

	const setParams = (params: Partial<JobLevelDetailsParamsKey>, persistPreviousParams = true) => {
		const newParams = new URLSearchParams();
		const previous = getParams();

		if (persistPreviousParams) {
			Object.entries(previous).forEach(([key, value]) => {
				if (value !== undefined && value !== null) {
					newParams.set(jobLevelDetailsParamsKey[key as keyof typeof jobLevelDetailsParamsKey], value.toString());
				}
			});
		}

		const finalParams = persistPreviousParams ? { ...previous, ...params } : params;

		if (finalParams.status !== undefined) {
			newParams.set(jobLevelDetailsParamsKey.status, finalParams.status);
		}

		router.replace(`?${newParams.toString()}`, { scroll: false });
	};

	const clearParams = () => {
		router.replace("?", { scroll: false });
	};

	return { getParams, setParams, clearParams };
};
