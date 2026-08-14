import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api";
import { IApiResponse } from "@/types";

import { IViolationReportDetail } from "../types";

const VIOLATION_ENDPOINT = "/admin/driving-safety/incident-reports/violation";
const VIOLATION_DETAIL_KEY = "driving-safety-violation-detail";

export const useViolationReportDetail = (id: string) =>
	useQuery({
		queryKey: [VIOLATION_DETAIL_KEY, id],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<IViolationReportDetail>>(`${VIOLATION_ENDPOINT}/${id}`);
			return data.data;
		},
	});
