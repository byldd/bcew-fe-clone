import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { dateToUTCString } from "@/lib/utils/date";
import { IApiResponse } from "@/types";
import { IJobSiteSafetyDashboardResponse } from "../types";
import { buildJobSiteSafetyDashboardRows } from "../utils/build-job-site-safety-dashboard-rows";

const DASHBOARD_ENDPOINT = "/admin/job-site-safety/dashboard";

// No date range means the whole log, matching the driving safety incident reports page.
export const useJobSiteSafetyDashboard = (startDate: Date | null, endDate: Date | null) =>
	useQuery({
		queryKey: ["admin-job-site-safety-dashboard", startDate?.toDateString(), endDate?.toDateString()],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<IJobSiteSafetyDashboardResponse>>(DASHBOARD_ENDPOINT, {
				params: {
					startDate: startDate ? dateToUTCString(startDate) : undefined,
					endDate: endDate ? dateToUTCString(endDate) : undefined,
				},
			});
			return data.data;
		},
		select: buildJobSiteSafetyDashboardRows,
	});
