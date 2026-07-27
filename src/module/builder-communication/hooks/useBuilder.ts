import { apiClient } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { BuilderCommsTreeResponse, JOB_STATUS } from "../types";

export const useBuilderCommsProjects = (status?: JOB_STATUS) => {
	return useQuery({
		queryKey: ["builder-comms-projects", status],
		queryFn: async () => {
			const url = status ? `/admin/builder/projects?status=${encodeURIComponent(status)}` : `/admin/builder/projects`;

			const { data } = await apiClient.get<{ data: BuilderCommsTreeResponse }>(url);

			return data.data;
		},
	});
};
