import { apiClient } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { IApiResponse } from "@/types";
import { JobPullListResponse } from "../utils/types";

export const useJobPullList = (jobnum?: number, tsknum?: number) => {
	return useQuery({
		queryKey: ["job-level-pull-list", jobnum, tsknum],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<JobPullListResponse>>("/admin/job-level-details/pull-list", {
				params: { jobnum, tsknum },
			});

			return data.data;
		},
		enabled: Boolean(jobnum) && Boolean(tsknum),
	});
};
