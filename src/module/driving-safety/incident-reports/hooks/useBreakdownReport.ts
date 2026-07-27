import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api";
import { IApiResponse } from "@/types";

import { IBreakdownReportDetail, IUpdateBreakdownCostPayload } from "../types";

const BREAKDOWN_ENDPOINT = "/admin/driving-safety/incident-reports/breakdown";
const BREAKDOWN_DETAIL_KEY = "driving-safety-breakdown-detail";
const INCIDENT_REPORTS_KEY = "driving-safety-incident-reports";

export const useBreakdownReportDetail = (id: string) =>
	useQuery({
		queryKey: [BREAKDOWN_DETAIL_KEY, id],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<IBreakdownReportDetail>>(`${BREAKDOWN_ENDPOINT}/${id}`);
			return data.data;
		},
	});

export const useUpdateBreakdownReport = (id: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: ["update-breakdown-report", id],
		mutationFn: async (payload: IUpdateBreakdownCostPayload) => {
			const { data } = await apiClient.patch<IApiResponse<IBreakdownReportDetail>>(
				`${BREAKDOWN_ENDPOINT}/${id}`,
				payload
			);
			return data.data;
		},
		onSuccess: (data) => {
			queryClient.setQueryData([BREAKDOWN_DETAIL_KEY, id], data);
			queryClient.invalidateQueries({ queryKey: [INCIDENT_REPORTS_KEY] });
		},
	});
};
