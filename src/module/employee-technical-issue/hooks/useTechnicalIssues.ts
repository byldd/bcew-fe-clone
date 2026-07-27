"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { IApiSuccessResponse, ROLES } from "@/types";
import {
	ICreateTechnicalIssuePayload,
	IMyTechnicalIssue,
	ITechnicalIssueDetail,
	ITechnicalIssueResponse,
	IUpdateMyTechnicalIssuePayload,
} from "../track-ticket/types/types";
import { UserType } from "@/module/profile/types";
import { getTechnicalIssueEndpoint } from "../utils";

export const useCreateTechnicalIssue = (
	user: UserType["data"]["user"] | null,
	subContractorCrew?: UserType["data"]["subContractorCrew"] | null
) => {
	return useMutation({
		mutationKey: ["create-technical-issue"],
		mutationFn: async (payload: ICreateTechnicalIssuePayload) => {
			if (!user && !subContractorCrew) {
				throw new Error("Please login first!!");
			}

			const endpoint = getTechnicalIssueEndpoint(subContractorCrew ? ROLES.SUB_CONTRACTOR_CREW_LEADER : user?.userType);

			const { data } = await apiClient.post<IApiSuccessResponse<ITechnicalIssueResponse>>(endpoint, payload);

			return data.data;
		},
	});
};

export const useMyTechnicalIssues = (
	user: UserType["data"]["user"] | null,
	subContractorCrew?: UserType["data"]["subContractorCrew"] | null
) => {
	return useQuery({
		queryKey: ["my-technical-issues", user?.id],
		enabled: !!user || !!subContractorCrew,
		queryFn: async () => {
			if (!user && !subContractorCrew) {
				throw new Error("Please login first!!");
			}

			const endpoint = getTechnicalIssueEndpoint(subContractorCrew ? ROLES.SUB_CONTRACTOR_CREW_LEADER : user?.userType);

			const { data } = await apiClient.get<IApiSuccessResponse<IMyTechnicalIssue[]>>(endpoint);

			return data.data;
		},
	});
};

export const useUpdateMyTechnicalIssue = (
	user: UserType["data"]["user"] | null,
	subContractorCrew?: UserType["data"]["subContractorCrew"] | null
) => {
	return useMutation({
		mutationKey: ["update-my-technical-issue"],
		mutationFn: async (payload: { id: string } & IUpdateMyTechnicalIssuePayload) => {
			if (!user && !subContractorCrew) {
				throw new Error("Please login first!!");
			}

			const { id, ...body } = payload;
			const endpoint = getTechnicalIssueEndpoint(subContractorCrew ? ROLES.SUB_CONTRACTOR_CREW_LEADER : user?.userType);

			const { data } = await apiClient.put<IApiSuccessResponse<ITechnicalIssueDetail>>(`${endpoint}/${id}`, body);

			return data.data;
		},
	});
};

export const useMyTechnicalIssueById = (
	user: UserType["data"]["user"] | null,
	subContractorCrew?: UserType["data"]["subContractorCrew"] | null,
	id?: string
) => {
	return useQuery({
		queryKey: ["my-technical-issue", user?.id, id],
		enabled: !!user || !!subContractorCrew || !!id,
		queryFn: async () => {
			if (!user || !id) {
				throw new Error("Invalid request");
			}

			const endpoint = getTechnicalIssueEndpoint(subContractorCrew ? ROLES.SUB_CONTRACTOR_CREW_LEADER : user?.userType);

			const { data } = await apiClient.get<IApiSuccessResponse<ITechnicalIssueDetail>>(`${endpoint}/${id}`);

			return data.data;
		},
	});
};
