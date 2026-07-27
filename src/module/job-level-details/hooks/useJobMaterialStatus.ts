import { apiClient } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { IApiResponse } from "@/types";
import { JobMaterialStatusResponse } from "../utils/types";

export const useJobMaterialStatus = (recnum?: number | null, tsknum?: number | null) => {
	return useQuery({
		queryKey: ["job-level-material-status", recnum, tsknum],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<JobMaterialStatusResponse>>(
				"/admin/job-level-details/material-status",
				{
					params: { recnum, tsknum },
				}
			);

			return data.data;
		},
		enabled: Boolean(recnum) && Boolean(tsknum),
	});
};
