import { apiClient } from "@/lib/api";
import { useMutation, useQuery } from "@tanstack/react-query";
import { IApiResponse } from "@/types";
import { IBreakdownFormOptions } from "@/module/employee-safety/types";
import { IAdminCreateBreakdownPayload } from "../types";

const BASE_URL = "/admin/driving-safety/vehicle-breakdown";

export const useAdminBreakdownFormOptions = () =>
	useQuery({
		queryKey: ["admin-vehicle-breakdown-form-options"],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<IBreakdownFormOptions>>(`${BASE_URL}/form-options`);
			return data.data;
		},
	});

export const useCreateAdminVehicleBreakdown = () =>
	useMutation({
		mutationKey: ["create-admin-vehicle-breakdown"],
		mutationFn: async (payload: IAdminCreateBreakdownPayload) => {
			const { data } = await apiClient.post<IApiResponse<{ id: string }>>(BASE_URL, payload);
			return data.data;
		},
	});
