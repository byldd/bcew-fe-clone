import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { IAllocateTimePayload, IAllocateTimeResponse, IFingerprintLogEntry } from "@/module/matching-finger/types";
import { IApiResponse } from "@/types";

export const useAllocateTime = () => {
	return useMutation({
		mutationKey: ["allocateTime"],
		mutationFn: async (payload: IAllocateTimePayload) => {
			const { data } = await apiClient.post<IAllocateTimeResponse>("/finger/allocate-time", payload);
			return data;
		},
	});
};

// fetch finger print logs

export const useGetEmployeeFingerprintLogs = ({ date }: { date: string }) => {
	return useQuery({
		queryKey: ["fingerprintLogs", date],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<IFingerprintLogEntry[]>>("/employee/fingerprint/logs", {
				params: { date },
			});
			return data.data;
		},
	});
};
