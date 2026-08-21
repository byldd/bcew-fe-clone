import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { IApiSuccessResponse, IPaginatedApiResponse } from "@/types";
import { IAdminCrateIssuesFilters, IAdminCrateIssuesItem } from "../types";

export const useAdminCrateIssues = (params: IAdminCrateIssuesFilters) => {
	return useQuery({
		queryKey: ["admin-crate-issues", params],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiSuccessResponse<IPaginatedApiResponse<IAdminCrateIssuesItem>>>(
				"/admin/crate-issues",
				{
					params: {
						...params,
						jobNums: params.jobNums?.length ? params.jobNums.join("|") : undefined,
						projectNums: params.projectNums?.length ? params.projectNums.join("|") : undefined,
						technicianIds: params.technicianIds?.length ? params.technicianIds.join("|") : undefined,
						issueTypes: params.issueTypes?.length ? params.issueTypes.join("|") : undefined,
						severities: params.severities?.length ? params.severities.join("|") : undefined,
					},
				}
			);

			return data.data;
		},
	});
};
