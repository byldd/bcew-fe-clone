import { IAttendanceDashboardStats } from "../types";

export const buildAttendanceStats = (stats: IAttendanceDashboardStats) => [
	{ label: "Pending Review", ...stats.pendingReview },
	{ label: "Approved", ...stats.approved },
	{ label: "Rejected", ...stats.rejected },
	{ label: "Total Requests", ...stats.totalRequests },
	{ label: "Late Arrival", ...stats.lateArrival },
	{ label: "Early Quit", ...stats.earlyQuit },
	{ label: "Full Day Off", ...stats.fullDayOff },
];
