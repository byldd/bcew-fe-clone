// hooks/useAttendance.ts

import { apiClient } from "@/lib/api";

import { useQuery } from "@tanstack/react-query";
import { BCEW_ATTENDANCE_TYPE } from "../utils/enums";
import { IAttendanceResponse } from "../utils/types";

export const useAttendanceData = (query: { startDate?: string; endDate?: string; types?: BCEW_ATTENDANCE_TYPE[] }) => {
	return useQuery<IAttendanceResponse>({
		queryKey: ["attendance-data", query],

		queryFn: async () => {
			const { data } = await apiClient.get<{
				data: IAttendanceResponse;
			}>("/admin/attendance", {
				params: query,
			});

			return data.data;
		},
	});
};
