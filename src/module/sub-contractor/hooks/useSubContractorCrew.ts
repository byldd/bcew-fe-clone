import { apiClient } from "@/lib/api";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
	ICreateSubContractorCrewPayload,
	ISubContractorAdminGetCrewJobsFilter,
	ISubContractorCrewsResponse,
	ISubContractorDailyJobScheduleResponse,
	IUpdateSubContractorCrewPayload,
} from "@/module/sub-contractor/types";
import { UserType } from "@/module/profile/types";
import { ISubContractorCrewQuery } from "@/module/admin-sub-contractor/types";
import { IApiResponse } from "@/types";

export const useSubContractorCrews = (
	user: UserType["data"]["user"] | null,
	subContractorCrew: UserType["data"]["subContractorCrew"] | null,
	query: ISubContractorCrewQuery
) => {
	const canFetch = !!user || !!subContractorCrew;
	return useQuery({
		queryKey: ["subContractorCrews", user?.id ?? subContractorCrew?.id, query],
		enabled: canFetch,
		queryFn: async () => {
			const endpoint = user ? "/sub-contractor/crew" : "/sub-contractor/crew-leader/assigned-crews";

			const { data } = await apiClient.get<{ data: ISubContractorCrewsResponse }>(endpoint, {
				params: query,
			});
			return data.data;
		},
	});
};

export const useCreateSubContractorCrew = () => {
	return useMutation({
		mutationKey: ["createSubContractorCrew"],
		mutationFn: async (payload: ICreateSubContractorCrewPayload) => {
			const { data } = await apiClient.post("/sub-contractor/crew", payload);
			return data?.data?.item;
		},
	});
};

export const useUpdateSubContractorCrew = (id: string) => {
	return useMutation({
		mutationKey: ["updateSubContractorCrew"],
		mutationFn: async (payload: IUpdateSubContractorCrewPayload) => {
			const { data } = await apiClient.put(`/sub-contractor/${id}/crew`, payload);
			return data;
		},
	});
};

export const useDeleteSubContractorCrew = () => {
	return useMutation({
		mutationKey: ["deleteSubContractorCrew"],
		mutationFn: async (id: string) => {
			const { data } = await apiClient.delete(`/sub-contractor/${id}/crew`);
			return data;
		},
	});
};

export const useGetSubContractorCrewJobs = (filter: ISubContractorAdminGetCrewJobsFilter) => {
	const canFetch = !!filter?.subcontractorCrewId;
	return useQuery({
		queryKey: ["sub-contractor-crew-jobs", filter],
		enabled: canFetch,
		queryFn: async () => {
			const endpoint = `/sub-contractor/crew/${filter?.subcontractorCrewId}/jobs`;

			const { data } = await apiClient.get<IApiResponse<ISubContractorDailyJobScheduleResponse>>(endpoint);
			return data.data;
		},
	});
};
