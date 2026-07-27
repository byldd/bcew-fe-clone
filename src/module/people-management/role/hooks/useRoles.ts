import { apiClient } from "@/lib/api";
import { IPage } from "@/module/admin/types/sideb-bar-page";
import { IApiResponse } from "@/types";
import { useQuery } from "@tanstack/react-query";

export const useGetAdminPages = () => {
	return useQuery({
		queryKey: ["admin-pages"],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<IPage[]>>("/admin/page");
			return data.data;
		},
	});
};
