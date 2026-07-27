import { apiClient } from "@/lib/api";
import { IApiResponse } from "@/types";
import { useQuery } from "node_modules/@tanstack/react-query/build/modern/useQuery";
import { IEmployeeStorageUnits } from "../utils/types";

export const useGetAdminStorageUnits = (filters: { startDate: string; endDate: string }) => {
	return useQuery({
		queryKey: ["admin-storage-unit-report", filters],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<IEmployeeStorageUnits[]>>("/admin/storage-unit", {
				params: filters,
			});
			return data.data;
		},
	});
};
