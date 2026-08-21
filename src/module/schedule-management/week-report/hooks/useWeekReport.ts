import { apiClient } from "@/lib/api";
import { IApiResponse } from "@/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { IGetWeekReportFilters, IWeekReportEntry } from "../types";

export const useWeekReport = (filters: IGetWeekReportFilters) => {
	return useQuery({
		queryKey: ["week-report", filters],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<IWeekReportEntry[]>>("/admin/payroll/week-report", {
				params: filters,
			});
			return data.data;
		},
	});
};

export const useDownloadWeekReportPdf = () => {
	return useMutation({
		mutationFn: async (payload: IGetWeekReportFilters) => {
			const response = await apiClient.post("/admin/payroll/week-report/pdf", payload, {
				responseType: "blob",
			});
			return response;
		},
	});
};
