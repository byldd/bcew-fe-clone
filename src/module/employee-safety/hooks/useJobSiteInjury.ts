import { apiClient } from "@/lib/api";
import { dateToUTCString } from "@/lib/utils/date";
import { IApiResponse } from "@/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
	IAssignedJob,
	IForemanContact,
	IJobSiteInjuryReport,
	IJobSiteInjuryReportDetail,
	ISaveJobSiteInjuryPayload,
	ITodayJobForeman,
} from "../types";

export const useJobSiteInjuryReport = (id: string | null) =>
	useQuery({
		queryKey: ["safety-job-site-injury-report", id],
		enabled: !!id,
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<IJobSiteInjuryReportDetail>>(
				`/employee/safety/job-site-injury/${id}`
			);
			return data.data;
		},
	});

export const useForemanContacts = () => {
	return useQuery({
		queryKey: ["job-site-injury-foreman-contacts"],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<IForemanContact[]>>(
				"/employee/safety/job-site-injury/foreman-contacts"
			);
			return data.data;
		},
	});
};

export const useTodayJobForemen = () => {
	return useQuery({
		queryKey: ["job-site-injury-today-foremen"],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<ITodayJobForeman[]>>(
				"/employee/safety/job-site-injury/foremen"
			);
			return data.data;
		},
	});
};

// Jobs assigned to the technician on `date` — populates the "Where did the Injury
// Occur" select. Only fetches once a date has been picked on the form.
export const useAssignedJobs = (date?: Date) => {
	return useQuery({
		queryKey: ["job-site-injury-assigned-jobs", date?.toDateString()],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<IAssignedJob[]>>("/employee/safety/job-site-injury/jobs", {
				params: { date: dateToUTCString(date!) },
			});
			return data.data;
		},
		enabled: Boolean(date),
	});
};

export const useCreateJobSiteInjuryDraft = () =>
	useMutation({
		mutationKey: ["create-job-site-injury-draft"],
		mutationFn: async (payload: ISaveJobSiteInjuryPayload) => {
			const { data } = await apiClient.post<IApiResponse<IJobSiteInjuryReport>>(
				"/employee/safety/job-site-injury",
				payload
			);
			return data.data;
		},
	});

export const useUpdateJobSiteInjuryDraft = () =>
	useMutation({
		mutationKey: ["update-job-site-injury-draft"],
		mutationFn: async ({ id, payload }: { id: string; payload: ISaveJobSiteInjuryPayload }) => {
			const { data } = await apiClient.put<IApiResponse<IJobSiteInjuryReport>>(
				`/employee/safety/job-site-injury/${id}`,
				payload
			);
			return data.data;
		},
	});

export const useSubmitJobSiteInjuryReport = () =>
	useMutation({
		mutationKey: ["submit-job-site-injury-report"],
		mutationFn: async ({ id, payload }: { id: string; payload: ISaveJobSiteInjuryPayload }) => {
			const { data } = await apiClient.post<IApiResponse<IJobSiteInjuryReport>>(
				`/employee/safety/job-site-injury/${id}/submit`,
				payload
			);
			return data.data;
		},
	});
