import { apiClient } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { JobLevelDetailsProjectTreeResponse } from "../utils/types";
import { JOB_STATUS } from "@/module/builder-communication/types";

export const useJobLevelDetailsProjects = (status?: JOB_STATUS) => {
	return useQuery({
		queryKey: ["job-level-details-projects", status],
		queryFn: async () => {
			const { data } = await apiClient.get<{ data: JobLevelDetailsProjectTreeResponse }>(
				"/admin/job-level-details/projects",
				{
					params: status ? { status } : undefined,
				}
			);

			return data.data;
		},
	});
};
