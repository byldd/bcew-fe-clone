import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ATTENDANCE_APPROVAL_STATUS } from "../enums";
import { IAttendanceDashboardData } from "../types";

type ApprovalActionPayload = {
	id: string;
	status: ATTENDANCE_APPROVAL_STATUS.APPROVED | ATTENDANCE_APPROVAL_STATUS.DECLINED;
};

export const useAttendanceApproval = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: ["admin-attendance-approval-action"],
		mutationFn: async (payload: ApprovalActionPayload) => payload,
		onSuccess: ({ id, status }) => {
			queryClient.setQueriesData<IAttendanceDashboardData | undefined>(
				{ queryKey: ["admin-attendance-dashboard"] },
				(current) => {
					if (!current) return current;
					return {
						...current,
						pendingApprovals: current.pendingApprovals.map((approval) =>
							approval.id === id ? { ...approval, status, dateOfApproval: new Date().toISOString() } : approval
						),
					};
				}
			);
		},
	});
};
