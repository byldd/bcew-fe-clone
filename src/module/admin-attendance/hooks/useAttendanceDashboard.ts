import { useQuery } from "@tanstack/react-query";
import { buildMockAttendanceDashboard } from "../utils/mock-dashboard-data";

export const useAttendanceDashboard = (startDate: Date | null, endDate: Date | null) =>
	useQuery({
		queryKey: ["admin-attendance-dashboard", startDate?.toDateString(), endDate?.toDateString()],
		queryFn: async () => buildMockAttendanceDashboard(),
	});
