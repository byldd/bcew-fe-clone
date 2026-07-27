"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { EMPYEE_STATUS_FILTER } from "../types";

type EmployeeParams = {
	department?: string;
	jobRole?: string;
	startDate?: string;
	endDate?: string;
	status: EMPYEE_STATUS_FILTER;
};

const employeeParamsKey = {
	department: "department",
	jobRole: "jobRole",
	startDate: "startDate",
	endDate: "endDate",
	status: "status",
};

export const useEmployeeParams = () => {
	const searchParams = useSearchParams();
	const router = useRouter();

	const getParams = (): EmployeeParams => {
		return {
			department: searchParams.get(employeeParamsKey.department) || undefined,
			jobRole: searchParams.get(employeeParamsKey.jobRole) || undefined,
			startDate: searchParams.get(employeeParamsKey.startDate) || undefined,
			endDate: searchParams.get(employeeParamsKey.endDate) || undefined,
			status: (searchParams.get(employeeParamsKey.status) as EMPYEE_STATUS_FILTER) || EMPYEE_STATUS_FILTER.ACTIVE,
		};
	};

	const setParams = (params: Partial<EmployeeParams>, persistPreviousParams = true) => {
		const newParams = new URLSearchParams();
		const previous = getParams();

		const finalParams = persistPreviousParams ? { ...previous, ...params } : params;

		if (finalParams.department) {
			newParams.set(employeeParamsKey.department, finalParams.department);
		}
		if (finalParams.jobRole) {
			newParams.set(employeeParamsKey.jobRole, finalParams.jobRole);
		}
		if (finalParams.startDate) {
			newParams.set(employeeParamsKey.startDate, finalParams.startDate);
		}
		if (finalParams.endDate) {
			newParams.set(employeeParamsKey.endDate, finalParams.endDate);
		}

		if (finalParams.status) {
			newParams.set(employeeParamsKey.status, finalParams.status);
		}

		router.replace(`?${newParams.toString()}`, { scroll: false });
	};

	return { getParams, setParams };
};
