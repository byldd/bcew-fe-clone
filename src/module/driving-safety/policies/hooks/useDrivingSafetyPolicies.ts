import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api";
import { IApiResponse } from "@/types";

import { IDrivingSafetyPolicies, IUpdateDrivingSafetyPoliciesPayload } from "../types";

const DRIVING_SAFETY_POLICIES_ENDPOINT = "/admin/driving-safety/policies";
const DRIVING_SAFETY_POLICIES_KEY = ["driving-safety-policies"];

export const useDrivingSafetyPolicies = () =>
	useQuery({
		queryKey: DRIVING_SAFETY_POLICIES_KEY,
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<IDrivingSafetyPolicies>>(DRIVING_SAFETY_POLICIES_ENDPOINT);
			return data.data;
		},
	});

export const useUpdateDrivingSafetyPolicies = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: ["update-driving-safety-policies"],
		mutationFn: async (payload: IUpdateDrivingSafetyPoliciesPayload) => {
			const { data } = await apiClient.put<IApiResponse<IDrivingSafetyPolicies>>(
				DRIVING_SAFETY_POLICIES_ENDPOINT,
				payload
			);
			return data.data;
		},
		onSuccess: (data) => queryClient.setQueryData(DRIVING_SAFETY_POLICIES_KEY, data),
	});
};
