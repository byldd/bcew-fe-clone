import { apiClient } from "@/lib/api";
import { useMutation, useQuery } from "@tanstack/react-query";
import { IApiResponse } from "@/types";
import { dateToUTCString } from "@/lib/utils/date";
import {
	IAccidentReportDetail,
	IAssignedVehicle,
	IMedicalTreatmentLocation,
	IMyRecord,
	ISafetyFormOptions,
	ISaveAccidentPayload,
	IVehicleAccidentReport,
} from "../types";

export const useAccidentReport = (id: string | null) =>
	useQuery({
		queryKey: ["safety-accident-report", id],
		enabled: !!id,
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<IAccidentReportDetail>>(
				`/employee/safety/vehicle-accident/${id}`
			);
			return data.data;
		},
	});

export const useMyRecords = (startDate: Date | null, endDate: Date | null) =>
	useQuery({
		queryKey: [
			"safety-my-records",
			startDate ? dateToUTCString(startDate) : null,
			endDate ? dateToUTCString(endDate) : null,
		],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<IMyRecord[]>>("/employee/safety/my-records", {
				params: {
					startDate: startDate ? dateToUTCString(startDate) : undefined,
					endDate: endDate ? dateToUTCString(endDate) : undefined,
				},
			});
			return data.data;
		},
	});

export const useAssignedVehicle = () =>
	useQuery({
		queryKey: ["safety-assigned-vehicle"],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<IAssignedVehicle>>(
				"/employee/safety/vehicle-accident/assigned-vehicle"
			);
			return data.data;
		},
	});

export const useSafetyFormOptions = () =>
	useQuery({
		queryKey: ["safety-form-options"],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<ISafetyFormOptions>>("/employee/safety/form-options");
			return data.data;
		},
	});

export const useMedicalTreatmentLocations = () =>
	useQuery({
		queryKey: ["safety-medical-treatment-locations"],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<IMedicalTreatmentLocation[]>>(
				"/employee/safety/medical-treatment-locations"
			);
			return data.data;
		},
	});

export const useCreateAccidentDraft = () =>
	useMutation({
		mutationKey: ["create-accident-draft"],
		mutationFn: async (payload: ISaveAccidentPayload) => {
			const { data } = await apiClient.post<IApiResponse<IVehicleAccidentReport>>(
				"/employee/safety/vehicle-accident",
				payload
			);
			return data.data;
		},
	});

export const useUpdateAccidentDraft = () =>
	useMutation({
		mutationKey: ["update-accident-draft"],
		mutationFn: async ({ id, payload }: { id: string; payload: ISaveAccidentPayload }) => {
			const { data } = await apiClient.put<IApiResponse<IVehicleAccidentReport>>(
				`/employee/safety/vehicle-accident/${id}`,
				payload
			);
			return data.data;
		},
	});

export const useSubmitAccidentReport = () =>
	useMutation({
		mutationKey: ["submit-accident-report"],
		mutationFn: async ({ id, payload }: { id: string; payload: ISaveAccidentPayload }) => {
			const { data } = await apiClient.post<IApiResponse<IVehicleAccidentReport>>(
				`/employee/safety/vehicle-accident/${id}/submit`,
				payload
			);
			return data.data;
		},
	});
