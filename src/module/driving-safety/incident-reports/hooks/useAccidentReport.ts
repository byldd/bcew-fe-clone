import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api";
import { IApiResponse } from "@/types";

import { IAccidentReviewDetail, IApproveAccidentReportPayload } from "../types";

const ACCIDENT_ENDPOINT = "/admin/driving-safety/incident-reports/accident";
const ACCIDENT_DETAIL_KEY = "driving-safety-accident-detail";
const INCIDENT_REPORTS_KEY = "driving-safety-incident-reports";

export const useAccidentReportDetail = (id: string) =>
	useQuery({
		queryKey: [ACCIDENT_DETAIL_KEY, id],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<IAccidentReviewDetail>>(`${ACCIDENT_ENDPOINT}/${id}`);
			return data.data;
		},
	});

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
