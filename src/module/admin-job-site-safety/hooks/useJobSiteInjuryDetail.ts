import { QueryClient, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { IApiResponse } from "@/types";
import { IAdminJobSiteInjuryReportDetail, IJobSiteSafetyEmailDraft } from "../types";

const BASE_URL = "/admin/job-site-safety/job-site-injury";

export const useJobSiteInjuryReportDetail = (id: string | null) =>
	useQuery({
		queryKey: ["admin-job-site-injury-report-detail", id],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<IAdminJobSiteInjuryReportDetail>>(`${BASE_URL}/${id}`);
			return data.data;
		},
		enabled: Boolean(id),
	});

const invalidateReportQueries = (queryClient: QueryClient, id: string) => {
	queryClient.invalidateQueries({ queryKey: ["admin-job-site-injury-report-detail", id] });
	queryClient.invalidateQueries({ queryKey: ["admin-job-site-safety-dashboard"] });
};

const useApprovalAction = (mutationKey: string, endpointSuffix: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: [mutationKey],
		mutationFn: async (id: string) => {
			const { data } = await apiClient.patch<IApiResponse<IAdminJobSiteInjuryReportDetail>>(
				`${BASE_URL}/${id}/${endpointSuffix}`
			);
			return data.data;
		},
		onSuccess: (_data, id) => invalidateReportQueries(queryClient, id),
	});
};

export const useMarkReadyForInsurance = () =>
	useApprovalAction("mark-job-site-injury-ready-for-insurance", "mark-ready-for-insurance");

export const useApproveInternally = () => useApprovalAction("approve-job-site-injury-internally", "approve-internally");

export const useApproveAndSendToInsurance = () =>
	useApprovalAction("approve-and-send-job-site-injury-to-insurance", "approve-and-send-to-insurance");

// Carries the Fleet Manager's edits to the email wrapper — the report body is
// always rendered server-side from the record.
export const useSendInsuranceEmail = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: ["send-job-site-injury-insurance-email"],
		mutationFn: async ({ id, emailContent }: { id: string; emailContent: IJobSiteSafetyEmailDraft }) => {
			const { data } = await apiClient.patch<IApiResponse<IAdminJobSiteInjuryReportDetail>>(
				`${BASE_URL}/${id}/send-insurance-email`,
				{ emailContent }
			);
			return data.data;
		},
		onSuccess: (_data, { id }) => invalidateReportQueries(queryClient, id),
	});
};

export const useMarkResolved = () => useApprovalAction("mark-job-site-injury-resolved", "mark-resolved");
