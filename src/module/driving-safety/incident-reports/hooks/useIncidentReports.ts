import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api";
import { IApiResponse } from "@/types";

import { IIncidentReportsResponse } from "../types";
import { buildIncidentReportRows } from "../utils/build-incident-report-rows";

const INCIDENT_REPORTS_ENDPOINT = "/admin/driving-safety/incident-reports";

export const useIncidentReports = () =>
	useQuery({
		queryKey: ["driving-safety-incident-reports"],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<IIncidentReportsResponse>>(INCIDENT_REPORTS_ENDPOINT);
			return data.data;
		},
		select: buildIncidentReportRows,
	});
