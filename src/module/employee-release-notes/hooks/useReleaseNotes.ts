import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { IGetReleaseNotesFilter, IGetReleaseNotesResponse } from "@/module/admin-release-notes/types/release-note";

export const useGetReleaseNotes = (filters: IGetReleaseNotesFilter) => {
	return useQuery({
		queryKey: ["release-notes", filters],
		queryFn: async () => {
			const { data } = await apiClient.get<IGetReleaseNotesResponse>("/employee/release-notes", {
				params: filters,
			});
			return data.data;
		},
	});
};
