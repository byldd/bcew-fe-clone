import { ATTENDANCE_APPROVAL_STATUS, ATTENDANCE_REASON, EMPLOYMENT_STATUS, WORKSITE_TYPE } from "../enums";

export interface IAttendanceDashboardStats {
	pendingReview: { value: number; subtitle?: string };
	approved: { value: number; subtitle?: string };
	rejected: { value: number; subtitle?: string };
	totalRequests: { value: number; subtitle?: string };
	lateArrival: { value: number; subtitle?: string };
	earlyQuit: { value: number; subtitle?: string };
	fullDayOff: { value: number; subtitle?: string };
}

export interface IAttendanceTopType {
	label: string;
	count: number;
}

export interface IAttendanceSummaryItem {
	label: string;
	points: number;
}

export interface IAttendanceEmployeeRelation {
	name: string;
}

export interface IAttendancePendingApproval {
	id: string;
	requestId: string;
	user: IAttendanceEmployeeRelation;
	employmentStatus: EMPLOYMENT_STATUS;
	worksiteType: WORKSITE_TYPE;
	reason: ATTENDANCE_REASON;
	note: string;
	scheduledTime: string | null;
	actualTime: string | null;
	submissionDate: string;
	requestedTimeOffRange: string;
	ptoStatus: ATTENDANCE_APPROVAL_STATUS;
}

export interface IAttendanceDashboardData {
	stats: IAttendanceDashboardStats;
	topTypes: IAttendanceTopType[];
	pointAssessmentSummary: IAttendanceSummaryItem[];
	pointEscalationPolicy: IAttendanceSummaryItem[];
	pendingApprovals: IAttendancePendingApproval[];
}
