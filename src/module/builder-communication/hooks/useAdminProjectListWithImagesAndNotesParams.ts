"use client";

import { useRouter, useSearchParams } from "next/navigation";

type AdminBuilderCommsParamsKey = {
	status?: string;
};

const adminBuilderCommsParamsKey = {
	status: "status",
};

export const useBuilderCommsParams = () => {
	const searchParams = useSearchParams();
	const router = useRouter();

	const getParams = (): AdminBuilderCommsParamsKey => {
		return {
			status: searchParams.get("status") || undefined,
		};
	};

	const setParams = (params: Partial<AdminBuilderCommsParamsKey>, persistPreviousParams = true) => {
		const newParams = new URLSearchParams();
		const previous = getParams();

		if (persistPreviousParams) {
			Object.entries(previous).forEach(([key, value]) => {
				if (value !== undefined && value !== null) {
					newParams.set(adminBuilderCommsParamsKey[key as keyof typeof adminBuilderCommsParamsKey], value.toString());
				}
			});
		}

		const finalParams = persistPreviousParams ? { ...previous, ...params } : params;

		if (finalParams.status !== undefined) {
			newParams.set(adminBuilderCommsParamsKey.status, finalParams.status);
		}

		router.replace(`?${newParams.toString()}`, { scroll: false });
	};

	const clearParams = () => {
		router.replace("?", { scroll: false });
	};

	return { getParams, setParams, clearParams };
};
