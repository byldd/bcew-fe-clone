import { apiClient } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { IApiResponse } from "@/types";
import { IVehicleDocuments } from "../types";

export const useVehicleDocuments = (truckNumber: string | null) =>
	useQuery({
		queryKey: ["safety-vehicle-documents", truckNumber],
		enabled: !!truckNumber,
		retry: false,
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<IVehicleDocuments>>("/employee/safety/vehicle-documents", {
				params: { truckNumber },
			});
			return data.data;
		},
	});
