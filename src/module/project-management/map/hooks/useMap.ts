import { apiClient } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { IGetMapZonesResponse } from "../types/zone";

export const useGetMapData = () => {
	return useQuery({
		queryKey: ["map-data"],
		queryFn: async () => {
			const { data } = await apiClient.get<IGetMapZonesResponse>("/admin/zone/map");
			return data;
		},
	});
};
