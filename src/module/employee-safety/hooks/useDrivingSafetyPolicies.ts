import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api";
import { IDrivingSafetyPolicies } from "@/module/driving-safety/policies/types";
import { IApiResponse } from "@/types";

export const useDrivingSafetyPolicies = () =>
	useQuery({
		queryKey: ["safety-driving-safety-policies"],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<IDrivingSafetyPolicies>>(
				"/employee/safety/driving-safety-policies"
			);
			return data.data;
		},
	});
