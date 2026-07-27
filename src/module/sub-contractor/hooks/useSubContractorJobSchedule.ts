import { apiClient } from "@/lib/api";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
	ISubContractorCrewNameResponse,
	ISubContractorDailyJobDetailsResponse,
	ISubContractorDailyJobScheduleResponse,
	ISubContractorDailyJobTimeUpdatePayload,
} from "@/module/sub-contractor/types";
import { IGetEmployeeScheduleFilter } from "@/module/job/types";
import { UserType } from "@/module/profile/types";
import {
	ICreateJobDailyNotePayload,
	IDailyJob,
	IMarkJobAsNotReadyPayload,
} from "@/module/schedule-management/weekly-schedule-management/types/schedule-interface";
import { IApiSuccessResponse } from "@/types";

export const useSubContractorSchedules = (
	user: UserType["data"]["user"] | null,
	subContractorCrew: UserType["data"]["subContractorCrew"] | null,
	filters: IGetEmployeeScheduleFilter
) => {
	const canFetch = (!!user || !!subContractorCrew) && !!filters;

	return useQuery({
		queryKey: ["subContractorSchedules", user?.id ?? subContractorCrew?.id, filters],
		enabled: canFetch,
		queryFn: async () => {
			const endpoint = user ? "/sub-contractor/schedule" : "/sub-contractor/crew-leader/schedule";

			const { data } = await apiClient.get<{ data: ISubContractorDailyJobScheduleResponse }>(endpoint, {
				params: filters,
			});

			return data.data;
		},
	});
};

export const useSubContractorDailyJobDetails = (
	dailyJobId: string,
	user: UserType["data"]["user"] | null,
	subContractorCrew: UserType["data"]["subContractorCrew"] | null
) => {
	const canFetch = (!!user || !!subContractorCrew) && !!dailyJobId;

	return useQuery({
		queryKey: ["subContractorDailyJobDetails", dailyJobId, user?.id ?? subContractorCrew?.id],
		enabled: canFetch,
		queryFn: async () => {
			const endpoint = user ? `/sub-contractor/dailyJob/${dailyJobId}` : `/sub-contractor/crew-leader/${dailyJobId}`;

			const { data } = await apiClient.get<{ data: ISubContractorDailyJobDetailsResponse }>(endpoint);

			return data.data;
		},
	});
};

export const useSubContractorCrewsNames = () => {
	return useQuery({
		queryKey: ["subContractorCrews"],
		queryFn: async () => {
			const { data } = await apiClient.get<{ data: ISubContractorCrewNameResponse }>(
				`/sub-contractor/subcontractor-crew-names`
			);

			return data.data;
		},
	});
};

export const useAssignSubContractorCrew = () => {
	return useMutation({
		mutationKey: ["assignSubContractor"],
		mutationFn: async (payload: { dailyJobId: string; crewId: string }) => {
			const { data } = await apiClient.patch(`/sub-contractor/assign-crew`, payload);
			return data;
		},
	});
};

export const useUpdateSubContractorDailyJobTime = (
	user: UserType["data"]["user"] | null,
	subContractorCrew: UserType["data"]["subContractorCrew"] | null
) => {
	return useMutation({
		mutationKey: ["subContractorDailyJobTimeUpdate"],
		mutationFn: async (payload: ISubContractorDailyJobTimeUpdatePayload) => {
			if (!(user || subContractorCrew)) {
				throw new Error("SubContractor type is required to update job time");
			}

			const endpoint = user ? "/sub-contractor/daily-job/time" : "/sub-contractor/crew-leader/daily-job/time";

			const { data } = await apiClient.put(endpoint, payload);
			return data;
		},
	});
};

export const useSubContractorDailyJobCreateJobDailyNote = (
	user: UserType["data"]["user"] | null,
	subContractorCrew: UserType["data"]["subContractorCrew"] | null
) => {
	return useMutation({
		mutationKey: ["subContractorJobDailyNote"],
		mutationFn: async (payload: ICreateJobDailyNotePayload) => {
			if (!(user || subContractorCrew)) {
				throw new Error("SubContractor type is required to create a daily job note");
			}

			const endpoint = user ? "/sub-contractor/daily-job/note" : "/sub-contractor/crew-leader/daily-job/note";

			const { data } = await apiClient.post(endpoint, payload);

			return data;
		},
	});
};

export const useUpdateSubContractorDailyJobRecord = (
	id: string | undefined,
	user: UserType["data"]["user"] | null,
	subContractorCrew: UserType["data"]["subContractorCrew"] | null
) => {
	return useMutation({
		mutationKey: ["subContractorJobDailyUpdate"],
		mutationFn: async (update: IDailyJob) => {
			if (!id || !(user || subContractorCrew)) {
				throw new Error("Job ID and SubContractor type are required");
			}

			const endpoint = user ? `/sub-contractor/daily-job/${id}` : `/sub-contractor/crew-leader/daily-job/${id}`;

			const { data } = await apiClient.put<IApiSuccessResponse<IDailyJob>>(endpoint, update);

			return data;
		},
	});
};

export const useSubContractorUpdateMarkJobAsNotReady = (
	user: UserType["data"]["user"] | null,
	subContractorCrew: UserType["data"]["subContractorCrew"] | null
) => {
	return useMutation({
		mutationFn: async (payload: IMarkJobAsNotReadyPayload) => {
			if (!(user || subContractorCrew)) {
				throw new Error("Job ID and SubContractor type are required");
			}

			const endpoint = user ? `/sub-contractor/daily-job/not-ready` : `/sub-contractor/crew-leader/daily-job/not-ready`;

			const { data } = await apiClient.post(endpoint, payload);
			return data.data;
		},
	});
};
