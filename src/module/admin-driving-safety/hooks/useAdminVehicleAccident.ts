import { apiClient } from "@/lib/api";
import { useMutation, useQuery } from "@tanstack/react-query";
import { IApiResponse } from "@/types";
import { IActiveEmployeeContact } from "@/module/admin-job-site-safety/types";
import { IAssignedVehicle } from "@/module/employee-safety/types";
import {
	IAdminAccidentDraft,
	IAdminAccidentTruckOption,
	IAdminCreateAccidentPayload,
	IAdminCreatedAccident,
} from "../types";

const BASE_URL = "/admin/driving-safety/vehicle-accident";

export const useVehicleAccidentEmployees = () =>
	useQuery({
		queryKey: ["admin-vehicle-accident-employees"],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<IActiveEmployeeContact[]>>(`${BASE_URL}/employees`);
			return data.data;
		},
	});

export const useVehicleAccidentAssignedVehicle = (employeeId: string | null) =>
	useQuery({
		queryKey: ["admin-vehicle-accident-assigned-vehicle", employeeId],
		enabled: !!employeeId,
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<IAssignedVehicle>>(`${BASE_URL}/assigned-vehicle`, {
				params: { employeeId },
			});
			return data.data;
		},
	});

export const useVehicleAccidentTrucks = () =>
	useQuery({
		queryKey: ["admin-vehicle-accident-trucks"],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<IAdminAccidentTruckOption[]>>(`${BASE_URL}/trucks`);
			return data.data;
		},
	});

export const useVehicleAccidentDraft = (id: string | null) =>
	useQuery({
		queryKey: ["admin-vehicle-accident-draft", id],
		enabled: !!id,
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<IAdminAccidentDraft>>(`${BASE_URL}/${id}`);
			return data.data;
		},
	});

export const useCreateVehicleAccident = () =>
	useMutation({
		mutationKey: ["create-admin-vehicle-accident"],
		mutationFn: async (payload: IAdminCreateAccidentPayload) => {
			const { data } = await apiClient.post<IApiResponse<IAdminCreatedAccident>>(BASE_URL, payload);
			return data.data;
		},
	});

export const useUpdateVehicleAccident = () =>
	useMutation({
		mutationKey: ["update-admin-vehicle-accident"],
		mutationFn: async ({ id, payload }: { id: string; payload: IAdminCreateAccidentPayload }) => {
			const { data } = await apiClient.put<IApiResponse<IAdminCreatedAccident>>(`${BASE_URL}/${id}`, payload);
			return data.data;
		},
	});
