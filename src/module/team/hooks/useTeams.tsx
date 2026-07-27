import { apiClient } from "@/lib/api";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
	ICreateTeamPayload,
	ITeam,
	ITeamDetailsResponse,
	ITeamUserOption,
	IUpdateTeamMembersPayload,
	IUpdateTeamPayload,
} from "@/module/team/types";

export const useTeams = () => {
	return useQuery<ITeam[]>({
		queryKey: ["teams"],
		queryFn: async () => {
			const { data } = await apiClient.get<{ data: ITeam[] }>("/admin/team");
			return data.data;
		},
	});
};

export const useUpdateTeams = () => {
	return useMutation({
		mutationKey: ["updatedTeam"],
		mutationFn: async (payload: IUpdateTeamPayload[]) => {
			const { data } = await apiClient.patch("/admin/team/times", payload);
			return data;
		},
	});
};

export const useCreateTeam = () => {
	return useMutation({
		mutationKey: ["createTeam"],
		mutationFn: async (payload: ICreateTeamPayload) => {
			const { data } = await apiClient.post("/admin/team", payload);

			return data;
		},
	});
};

export const useTeam = (teamId: string) => {
	return useQuery({
		queryKey: ["team", teamId],
		queryFn: async () => {
			const { data } = await apiClient.get<{
				data: ITeamDetailsResponse;
			}>(`/admin/team/${teamId}`);

			return data.data;
		},
		enabled: !!teamId,
	});
};

export const useUpdateTeam = (teamId: string) => {
	return useMutation({
		mutationKey: ["updateTeam"],
		mutationFn: async (payload: IUpdateTeamPayload) => {
			const { data } = await apiClient.put(`/admin/team/${teamId}`, payload);

			return data;
		},
	});
};

export const useTeamUsers = (teamId: string) => {
	return useQuery({
		queryKey: ["teamUsers", teamId],

		queryFn: async () => {
			const { data } = await apiClient.get<{
				data: ITeamUserOption[];
			}>("/admin/team/users", {
				params: {
					teamId,
				},
			});

			return data.data;
		},
	});
};

export const useUpdateTeamMembers = (teamId: string) => {
	return useMutation({
		mutationKey: ["updateTeamMembers", teamId],

		mutationFn: async (payload: IUpdateTeamMembersPayload) => {
			const { data } = await apiClient.patch(`/admin/team/${teamId}/members`, payload);

			return data;
		},
	});
};
