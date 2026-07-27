import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { EMPLOYEE_TYPE_OPTION, MapTab } from "../types/zone";
import { mapSubTabValues } from "../utils/zone";

export type IMapParams = {
	jobStatus: string | null;
	foremanEmpNums: string[] | null;
	employeeType: EMPLOYEE_TYPE_OPTION | null;
	includedTabs: MapTab[];
};

const mapParamsKeys = {
	jobStatus: "jobStatus",
	foremanEmpNums: "foremanEmpNums",
	employeeType: "employeeType",
	includedTabs: "includedTabs",
};

const useMapParams = () => {
	const router = useRouter();
	const searchParams = useSearchParams();

	// Memoized so consumers (e.g. a useMemo filtering zones) can depend on `getParams` itself
	// instead of its return value — otherwise every render would produce a new params object,
	// defeating any memoization keyed on it.
	const getParams = useCallback(() => {
		const jobStatus = searchParams.get(mapParamsKeys.jobStatus) as string | null;
		const foremanEmpNums = searchParams.getAll(mapParamsKeys.foremanEmpNums);

		const employeeType = searchParams.get(mapParamsKeys.employeeType) as EMPLOYEE_TYPE_OPTION | null;
		const includedTabs = searchParams.getAll(mapParamsKeys.includedTabs) as MapTab[];

		return {
			jobStatus: jobStatus ?? "",
			foremanEmpNums: foremanEmpNums ?? [],
			employeeType: employeeType ?? EMPLOYEE_TYPE_OPTION.ALL,
			includedTabs: includedTabs.length > 0 ? includedTabs : mapSubTabValues,
		};
	}, [searchParams]);

	const setParams = useCallback(
		(params: Partial<IMapParams>, persistPreviousParams = true) => {
			const previous = getParams();
			const newParams = new URLSearchParams();

			// Carry every previous value forward first — including multi-value params, which
			// must be re-appended individually rather than joined into one string.
			if (persistPreviousParams) {
				Object.entries(previous).forEach(([key, value]) => {
					const paramKey = mapParamsKeys[key as keyof typeof mapParamsKeys];
					if (Array.isArray(value)) {
						value.forEach((item) => newParams.append(paramKey, String(item)));
					} else if (value) {
						newParams.set(paramKey, value.toString());
					}
				});
			}

			if (params.jobStatus !== undefined) {
				if (params.jobStatus) newParams.set(mapParamsKeys.jobStatus, params.jobStatus);
				else newParams.delete(mapParamsKeys.jobStatus);
			}

			if (params.foremanEmpNums !== undefined) {
				newParams.delete(mapParamsKeys.foremanEmpNums);
				if (params.foremanEmpNums && params.foremanEmpNums.length > 0) {
					params.foremanEmpNums.forEach((empNum) => {
						newParams.append(mapParamsKeys.foremanEmpNums, empNum);
					});
				}
			}

			if (params.employeeType === null) {
				newParams.delete(mapParamsKeys.employeeType);
			} else if (params.employeeType !== undefined) {
				newParams.set(mapParamsKeys.employeeType, params.employeeType);
			}

			if (params.includedTabs !== undefined) {
				newParams.delete(mapParamsKeys.includedTabs);
				if (params.includedTabs.length > 0) {
					params.includedTabs.forEach((includedTab) => {
						newParams.append(mapParamsKeys.includedTabs, includedTab);
					});
				}
			}

			router.replace(`?${newParams.toString()}`, { scroll: false });
		},
		[getParams, router]
	);

	return { getParams, setParams };
};

export default useMapParams;
