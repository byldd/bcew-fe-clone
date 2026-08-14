import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api";
import { IApiResponse } from "@/types";

import { IDashboardDateRange, IDrivingSafetyDashboard } from "../types";

const DASHBOARD_ENDPOINT = "/admin/driving-safety/dashboard";

export const useDrivingSafetyDashboard = ({ startDate, endDate }: IDashboardDateRange) =>
	useQuery({
		queryKey: ["driving-safety-dashboard", startDate, endDate],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<IDrivingSafetyDashboard>>(DASHBOARD_ENDPOINT, {
				params: { startDate, endDate },
			});
			return data.data;
		},
	});
