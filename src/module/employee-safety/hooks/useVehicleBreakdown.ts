import { apiClient } from "@/lib/api";
import { useMutation, useQuery } from "@tanstack/react-query";
import { IApiResponse } from "@/types";
import { IBreakdownFormOptions, IVehicleBreakdownPayload } from "../types";

export const useCreateVehicleBreakdown = () =>
	useMutation({
		mutationKey: ["create-vehicle-breakdown"],
		mutationFn: async (payload: IVehicleBreakdownPayload) => {
			const { data } = await apiClient.post<IApiResponse<{ id: string }>>(
				"/employee/safety/vehicle-breakdown",
				payload
			);
			return data.data;
		},
	});

export const useBreakdownFormOptions = () =>
	useQuery({
		queryKey: ["vehicle-breakdown-form-options"],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<IBreakdownFormOptions>>(
				"/employee/safety/vehicle-breakdown/form-options"
			);
			return data.data;
		},
	});
