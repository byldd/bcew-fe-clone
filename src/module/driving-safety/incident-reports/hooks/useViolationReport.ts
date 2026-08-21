import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api";
import { IApiResponse } from "@/types";

import { ISafetyViolationDetail, IViolationReportDetail } from "../types";

const VIOLATION_ENDPOINT = "/admin/driving-safety/incident-reports/violation";
const VIOLATION_DETAIL_KEY = "driving-safety-violation-detail";
const SAFETY_VIOLATION_ENDPOINT = "/admin/driving-safety/incident-reports/safety-violation";
const SAFETY_VIOLATION_DETAIL_KEY = "driving-safety-safety-violation-detail";

export const useViolationReportDetail = (id: string) =>
	useQuery({
		queryKey: [VIOLATION_DETAIL_KEY, id],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<IViolationReportDetail>>(`${VIOLATION_ENDPOINT}/${id}`);
			return data.data;
		},
	});

export const useSafetyViolationDetail = (id: string) =>
	useQuery({
		queryKey: [SAFETY_VIOLATION_DETAIL_KEY, id],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<ISafetyViolationDetail>>(`${SAFETY_VIOLATION_ENDPOINT}/${id}`);
			return data.data;
		},
	});
