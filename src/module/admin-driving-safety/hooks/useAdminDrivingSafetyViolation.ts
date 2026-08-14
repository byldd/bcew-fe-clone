import { apiClient } from "@/lib/api";
import { useMutation, useQuery } from "@tanstack/react-query";
import { IApiResponse } from "@/types";
import { IActiveEmployeeContact } from "@/module/admin-job-site-safety/types";
import { ICreateDrivingSafetyViolationPayload, IDrivingSafetyViolationReport, IFleetTruckOption } from "../types";

const BASE_URL = "/admin/driving-safety/violation";

export const useDrivingSafetyViolationEmployees = () =>
	useQuery({
		queryKey: ["admin-driving-safety-violation-employees"],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<IActiveEmployeeContact[]>>(`${BASE_URL}/employees`);
			return data.data;
		},
	});

export const useDrivingSafetyViolationTrucks = () =>
	useQuery({
		queryKey: ["admin-driving-safety-violation-trucks"],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<IFleetTruckOption[]>>(`${BASE_URL}/trucks`);
			return data.data;
		},
	});

export const useCreateDrivingSafetyViolation = () =>
	useMutation({
		mutationKey: ["create-admin-driving-safety-violation"],
		mutationFn: async (payload: ICreateDrivingSafetyViolationPayload) => {
			const { data } = await apiClient.post<IApiResponse<IDrivingSafetyViolationReport>>(BASE_URL, payload);
			return data.data;
		},
	});
