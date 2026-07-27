import { apiClient } from "@/lib/api";
import { IApiResponse, IPaginatedQuery } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { IGPSResponse, IVehicleResponse } from "../../time-logs-management/types";

export const useGPSLogs = (query: IPaginatedQuery) => {
	return useQuery({
		queryKey: ["gps", query],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<IGPSResponse>>("/admin/timelogs/gps", {
				params: query,
			});
			return data.data || [];
		},
	});
};

export const useVehicleLogs = (query: IPaginatedQuery) => {
	return useQuery({
		queryKey: ["vehicle", query],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<IVehicleResponse>>("/admin/timelogs/vehicle", {
				params: query,
			});
			return data.data || [];
		},
	});
};
