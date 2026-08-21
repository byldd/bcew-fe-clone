import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api";
import { IApiResponse } from "@/types";
import { IAccidentReportDetail, ISaveAccidentPayload } from "@/module/employee-safety/types";

import {
	IAccidentAuditEntry,
	IAccidentReviewDetail,
	IApproveAccidentReportPayload,
	IAssignSecondReviewPayload,
	IInsuranceEmailDraft,
	IRawLegacyAccidentDetail,
	IRequestTechnicianInfoPayload,
	ISecondReviewActionPayload,
	IThirdReviewActionPayload,
} from "../types";
import { ACCIDENT_STATUS_ACTION, SECOND_REVIEW_ACTION } from "../utils/enums";
import { mapLegacyAccidentDetail } from "../utils/legacy-accident";

const ACCIDENT_ENDPOINT = "/admin/driving-safety/incident-reports/accident";
const LEGACY_ACCIDENT_ENDPOINT = "/admin/driving-safety/incident-reports/legacy-accident";
const ACCIDENT_DETAIL_KEY = "driving-safety-accident-detail";
const LEGACY_ACCIDENT_DETAIL_KEY = "driving-safety-legacy-accident-detail";
const ACCIDENT_HISTORY_KEY = "driving-safety-accident-history";
const INCIDENT_REPORTS_KEY = "driving-safety-incident-reports";

export const useAccidentReportDetail = (id: string) =>
	useQuery({
		queryKey: [ACCIDENT_DETAIL_KEY, id],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<IAccidentReviewDetail>>(`${ACCIDENT_ENDPOINT}/${id}`);
			return data.data;
		},
	});

export const useLegacyAccidentDetail = (id: string) =>
	useQuery({
		queryKey: [LEGACY_ACCIDENT_DETAIL_KEY, id],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<IRawLegacyAccidentDetail>>(
				`${LEGACY_ACCIDENT_ENDPOINT}/${encodeURIComponent(id)}`
			);
			return data.data;
		},
		select: mapLegacyAccidentDetail,
	});

// Loads the report in the full technician shape the report form round-trips, so the
// admin inline-edit form seeds losslessly. Fetched only once edit mode opens.
export const useAccidentReportForEdit = (id: string, enabled: boolean) =>
	useQuery({
		queryKey: ["driving-safety-accident-edit", id],
		enabled,
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<IAccidentReportDetail>>(`${ACCIDENT_ENDPOINT}/${id}/edit`);
			return data.data;
		},
	});

export const useUpdateAccidentTechnicianInfo = (id: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: ["update-accident-technician-info", id],
		mutationFn: async (payload: ISaveAccidentPayload) => {
			const { data } = await apiClient.put<IApiResponse<IAccidentReviewDetail>>(
				`${ACCIDENT_ENDPOINT}/${id}/technician-info`,
				payload
			);
			return data.data;
		},
		onSuccess: (data) => {
			queryClient.setQueryData([ACCIDENT_DETAIL_KEY, id], data);
			queryClient.invalidateQueries({ queryKey: ["driving-safety-accident-edit", id] });
			queryClient.invalidateQueries({ queryKey: [INCIDENT_REPORTS_KEY] });
			queryClient.invalidateQueries({ queryKey: [ACCIDENT_HISTORY_KEY, id] });
		},
	});
};

export const useApproveAccidentReport = (id: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: ["approve-accident-report", id],
		mutationFn: async (payload: IApproveAccidentReportPayload) => {
			const { data } = await apiClient.patch<IApiResponse<IAccidentReviewDetail>>(
				`${ACCIDENT_ENDPOINT}/${id}/approve`,
				payload
			);
			return data.data;
		},
		onSuccess: (data) => {
			queryClient.setQueryData([ACCIDENT_DETAIL_KEY, id], data);
			queryClient.invalidateQueries({ queryKey: [INCIDENT_REPORTS_KEY] });
		},
	});
};

const onWorkflowSuccess =
	(queryClient: ReturnType<typeof useQueryClient>, id: string) => (data: IAccidentReviewDetail) => {
		queryClient.setQueryData([ACCIDENT_DETAIL_KEY, id], data);
		queryClient.invalidateQueries({ queryKey: [INCIDENT_REPORTS_KEY] });
		queryClient.invalidateQueries({
			queryKey: [ACCIDENT_HISTORY_KEY, id],
		});
	};

// Case 1 — any admin escalates a queued report to the second reviewer (Kevin).
export const useAssignSecondReview = (id: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: ["assign-second-review", id],
		mutationFn: async (payload: IAssignSecondReviewPayload) => {
			const { data } = await apiClient.patch<IApiResponse<IAccidentReviewDetail>>(
				`${ACCIDENT_ENDPOINT}/${id}/assign-second-review`,
				payload
			);
			return data.data;
		},
		onSuccess: onWorkflowSuccess(queryClient, id),
	});
};

export const useRequestTechnicianInfo = (id: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: ["request-technician-info", id],
		mutationFn: async (payload: IRequestTechnicianInfoPayload) => {
			const { data } = await apiClient.patch<IApiResponse<IAccidentReviewDetail>>(
				`${ACCIDENT_ENDPOINT}/${id}/request-info`,
				payload
			);
			return data.data;
		},
		onSuccess: onWorkflowSuccess(queryClient, id),
	});
};

// Case 2 — Kevin approves (forward to Nolan) or cancels the report.
export const useSecondReview = (id: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: ["accident-second-review", id],
		mutationFn: async (payload: ISecondReviewActionPayload) => {
			const { data } = await apiClient.patch<IApiResponse<IAccidentReviewDetail>>(
				`${ACCIDENT_ENDPOINT}/${id}/second-review`,
				payload
			);
			return data.data;
		},
		onSuccess: onWorkflowSuccess(queryClient, id),
	});
};

// Case 3/4 — Nolan sends back to Kevin, or sends the claim to the insurer.
export const useThirdReview = (id: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: ["accident-third-review", id],
		mutationFn: async (payload: IThirdReviewActionPayload) => {
			const { data } = await apiClient.patch<IApiResponse<IAccidentReviewDetail>>(
				`${ACCIDENT_ENDPOINT}/${id}/third-review`,
				payload
			);
			return data.data;
		},
		onSuccess: onWorkflowSuccess(queryClient, id),
	});
};

export const useAccidentStatusAction = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: ["accident-status-action"],
		mutationFn: async ({ id, action }: { id: string; action: ACCIDENT_STATUS_ACTION }) => {
			switch (action) {
				case ACCIDENT_STATUS_ACTION.MARK_FOR_PRESIDENT_REVIEW:
					return apiClient.patch(`${ACCIDENT_ENDPOINT}/${id}/assign-second-review`, {
						violationTypeId: null,
						overrideReason: null,
						documents: [],
					});
				case ACCIDENT_STATUS_ACTION.APPROVE_AND_SEND_TO_INSURANCE:
					return apiClient.patch(`${ACCIDENT_ENDPOINT}/${id}/second-review`, {
						action: SECOND_REVIEW_ACTION.APPROVE,
					});
				case ACCIDENT_STATUS_ACTION.RESOLVE_INTERNALLY:
					return apiClient.patch(`${ACCIDENT_ENDPOINT}/${id}/second-review`, {
						action: SECOND_REVIEW_ACTION.APPROVE_INTERNALLY,
					});
				case ACCIDENT_STATUS_ACTION.MARK_RESOLVED:
					return apiClient.patch(`${ACCIDENT_ENDPOINT}/${id}/resolve`);
			}
		},
		onSuccess: (_data, { id }) => {
			queryClient.invalidateQueries({ queryKey: [INCIDENT_REPORTS_KEY] });
			queryClient.invalidateQueries({ queryKey: [ACCIDENT_DETAIL_KEY, id] });
			queryClient.invalidateQueries({ queryKey: [ACCIDENT_HISTORY_KEY, id] });
		},
	});
};

export const useResolveInsuranceClaim = (id: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: ["resolve-insurance-claim", id],
		mutationFn: async () => {
			const { data } = await apiClient.patch<IApiResponse<IAccidentReviewDetail>>(`${ACCIDENT_ENDPOINT}/${id}/resolve`);
			return data.data;
		},
		onSuccess: onWorkflowSuccess(queryClient, id),
	});
};

export const useInsuranceEmailDraft = (id: string) =>
	useQuery({
		queryKey: ["driving-safety-insurance-email", id],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<IInsuranceEmailDraft>>(
				`${ACCIDENT_ENDPOINT}/${id}/insurance-email`
			);
			return data.data;
		},
	});

export const useAccidentHistory = (id: string) =>
	useQuery({
		queryKey: [ACCIDENT_HISTORY_KEY, id],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<IAccidentAuditEntry[]>>(`${ACCIDENT_ENDPOINT}/${id}/history`);
			return data.data;
		},
	});
