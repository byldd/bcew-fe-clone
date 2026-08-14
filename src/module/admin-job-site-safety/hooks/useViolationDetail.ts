import { QueryClient, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { IApiResponse } from "@/types";
import { IJobSiteSafetyEmailDraft, IViolationReportDetail } from "../types";

const BASE_URL = "/admin/job-site-safety/violation";

export const useViolationReportDetail = (id: string | null) =>
	useQuery({
		queryKey: ["admin-job-site-safety-violation-detail", id],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<IViolationReportDetail>>(`${BASE_URL}/${id}`);
			return data.data;
		},
		enabled: Boolean(id),
	});

const invalidateViolationQueries = (queryClient: QueryClient, id: string) => {
	queryClient.invalidateQueries({ queryKey: ["admin-job-site-safety-violation-detail", id] });
	queryClient.invalidateQueries({ queryKey: ["admin-job-site-safety-dashboard"] });
};

const useViolationApprovalAction = (mutationKey: string, endpointSuffix: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: [mutationKey],
		mutationFn: async (id: string) => {
			const { data } = await apiClient.patch<IApiResponse<IViolationReportDetail>>(
				`${BASE_URL}/${id}/${endpointSuffix}`
			);
			return data.data;
		},
		onSuccess: (_data, id) => invalidateViolationQueries(queryClient, id),
	});
};

export const useMarkViolationReadyForInsurance = () =>
	useViolationApprovalAction("mark-violation-ready-for-insurance", "mark-ready-for-insurance");

export const useApproveViolationInternally = () =>
	useViolationApprovalAction("approve-violation-internally", "approve-internally");

export const useApproveAndSendViolationToInsurance = () =>
	useViolationApprovalAction("approve-and-send-violation-to-insurance", "approve-and-send-to-insurance");

// Carries the Fleet Manager's edits to the email wrapper — the report body is
// always rendered server-side from the record.
export const useSendViolationInsuranceEmail = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: ["send-violation-insurance-email"],
		mutationFn: async ({ id, emailContent }: { id: string; emailContent: IJobSiteSafetyEmailDraft }) => {
			const { data } = await apiClient.patch<IApiResponse<IViolationReportDetail>>(
				`${BASE_URL}/${id}/send-insurance-email`,
				{ emailContent }
			);
			return data.data;
		},
		onSuccess: (_data, { id }) => invalidateViolationQueries(queryClient, id),
	});
};

export const useMarkViolationResolved = () => useViolationApprovalAction("mark-violation-resolved", "mark-resolved");
