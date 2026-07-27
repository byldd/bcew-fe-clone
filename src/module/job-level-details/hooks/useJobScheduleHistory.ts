import { apiClient } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { IApiResponse } from "@/types";
import { JobScheduleHistoryResponse } from "../utils/types";

export const useJobScheduleHistory = (jobId?: number) => {
	return useQuery({
		queryKey: ["job-level-schedule-history", jobId],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<JobScheduleHistoryResponse>>(
				"/admin/job-level-details/schedule-history",
				{
					params: { jobId },
				}
			);

			return data.data;
		},
		enabled: Boolean(jobId),
	});
};
