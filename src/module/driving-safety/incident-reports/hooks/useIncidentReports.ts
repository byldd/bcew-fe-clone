import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api";
import { IApiResponse } from "@/types";

import { IIncidentReportsResponse, IUpdateIncidentSeverityPayload } from "../types";
import { buildIncidentReportRows } from "../utils/build-incident-report-rows";

const INCIDENT_REPORTS_ENDPOINT = "/admin/driving-safety/incident-reports";
const INCIDENT_REPORTS_KEY = "driving-safety-incident-reports";
const DASHBOARD_KEY = "driving-safety-dashboard";

export const useIncidentReports = ({
	startDate,
	endDate,
}: {
	startDate?: string;
	endDate?: string;
} = {}) =>
	useQuery({
		queryKey: [INCIDENT_REPORTS_KEY, startDate ?? null, endDate ?? null],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<IIncidentReportsResponse>>(INCIDENT_REPORTS_ENDPOINT, {
				params: { startDate, endDate },
			});
			return data.data;
		},
		select: buildIncidentReportRows,
	});

export const useUpdateIncidentSeverity = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: ["update-incident-severity"],
		mutationFn: async ({ id, type, severity }: IUpdateIncidentSeverityPayload) => {
			const { data } = await apiClient.patch<IApiResponse<{ id: string; severity: string | null }>>(
				`${INCIDENT_REPORTS_ENDPOINT}/${id}/severity`,
				{ type, severity }
			);
			return data.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [INCIDENT_REPORTS_KEY] });
			queryClient.invalidateQueries({ queryKey: [DASHBOARD_KEY] });
		},
	});
};
