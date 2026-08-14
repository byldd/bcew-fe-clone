import { apiClient } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { IApiResponse } from "@/types";
import { JobLevelCrateActivityItem } from "../utils/types";

export const useJobCrateActivity = (jobnum?: number | null, tsknum?: number | null) => {
	return useQuery({
		queryKey: ["job-level-crate-activity", jobnum, tsknum],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<JobLevelCrateActivityItem[]>>(
				"/admin/job-level-details/crate-activity",
				{
					params: { jobnum, tsknum },
				}
			);

			return data.data;
		},
		enabled: Boolean(jobnum) && Boolean(tsknum),
	});
};
