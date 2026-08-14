import { apiClient } from "@/lib/api";
import { dateToUTCString } from "@/lib/utils/date";
import { IApiResponse } from "@/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { IAssignedJob, IJobSiteInjuryReport, IMedicalTreatmentLocation } from "@/module/employee-safety/types";
import { IActiveEmployeeContact, IAdminSaveJobSiteInjuryPayload, IJobSiteInjuryReviewDetail } from "../types";

const BASE_URL = "/admin/job-site-safety/job-site-injury";

export const useAdminJobSiteInjuryDetail = (id: string) =>
	useQuery({
		queryKey: ["admin-job-site-injury-detail", id],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<IJobSiteInjuryReviewDetail>>(`${BASE_URL}/${id}`);
			return data.data;
		},
		enabled: !!id,
	});

export const useActiveEmployees = () =>
	useQuery({
		queryKey: ["admin-job-site-injury-active-employees"],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<IActiveEmployeeContact[]>>(`${BASE_URL}/employees`);
			return data.data;
		},
	});

export const useAdminTreatmentLocations = () =>
	useQuery({
		queryKey: ["admin-job-site-injury-treatment-locations"],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<IMedicalTreatmentLocation[]>>(
				`${BASE_URL}/treatment-locations`
			);
			return data.data;
		},
	});

export const useAdminAssignedJobs = (employeeId?: string, date?: Date) =>
	useQuery({
		queryKey: ["admin-job-site-injury-assigned-jobs", employeeId, date?.toDateString()],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<IAssignedJob[]>>(`${BASE_URL}/jobs`, {
				params: { employeeId, date: dateToUTCString(date!) },
			});
			return data.data;
		},
		enabled: Boolean(employeeId) && Boolean(date),
	});

export const useCreateAdminJobSiteInjuryDraft = () =>
	useMutation({
		mutationKey: ["create-admin-job-site-injury-draft"],
		mutationFn: async (payload: IAdminSaveJobSiteInjuryPayload) => {
			const { data } = await apiClient.post<IApiResponse<IJobSiteInjuryReport>>(BASE_URL, payload);
			return data.data;
		},
	});

export const useUpdateAdminJobSiteInjuryDraft = () =>
	useMutation({
		mutationKey: ["update-admin-job-site-injury-draft"],
		mutationFn: async ({ id, payload }: { id: string; payload: IAdminSaveJobSiteInjuryPayload }) => {
			const { data } = await apiClient.put<IApiResponse<IJobSiteInjuryReport>>(`${BASE_URL}/${id}`, payload);
			return data.data;
		},
	});

export const useSubmitAdminJobSiteInjuryReport = () =>
	useMutation({
		mutationKey: ["submit-admin-job-site-injury-report"],
		mutationFn: async ({ id, payload }: { id: string; payload: IAdminSaveJobSiteInjuryPayload }) => {
			const { data } = await apiClient.post<IApiResponse<IJobSiteInjuryReport>>(`${BASE_URL}/${id}/submit`, payload);
			return data.data;
		},
	});
