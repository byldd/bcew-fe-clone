import { apiClient } from "@/lib/api";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
	IPaginatedEmployeeRosterSearchQuery,
	IRoster,
	IUpdateRosterTimePayload,
	IUserRosterForWeekResponse,
} from "@/module/schedule-management/roster-time-configuration/types";
import { TECHNICAL_ISSUE_STATUS } from "@/utils/enums";

export const useGetUserRosterForWeek = (query: IPaginatedEmployeeRosterSearchQuery) => {
	const { startDate, endDate, page, pageSize, activeTeam, userId } = query;

	return useQuery({
		queryKey: ["userRosterForWeek", query],
		queryFn: async () => {
			const { data } = await apiClient.get<{ data: IUserRosterForWeekResponse }>("/admin/roster", {
				params: {
					...query,
					weekStart: startDate,
					weekEnd: endDate,
					...(activeTeam ? { teamId: activeTeam } : {}),
					page,
					pageSize,
					userId,
				},
			});
			return data.data;
		},
		enabled: !!startDate && !!endDate,
	});
};

export const useUpdateRosterTime = (rosterId: string) => {
	return useMutation({
		mutationKey: ["updateRosterDayTime", rosterId],
		mutationFn: async (payload: IUpdateRosterTimePayload) => {
			const { data } = await apiClient.patch(`/admin/roster/${rosterId}`, payload);
			return data;
		},
	});
};

export const useCreateOrUpdateRosterSyncedTime = (userId: string) => {
	return useMutation({
		mutationKey: ["updateRosterDayTime", userId],
		mutationFn: async (payload: IRoster[]) => {
			const { data } = await apiClient.put(`/admin/roster/${userId}`, payload);
			return data;
		},
	});
};

export const useUpdateTechnicalIssueStatus = (issueId: string) => {
	return useMutation({
		mutationKey: ["update-technical-issue-status", issueId],
		mutationFn: async (status: TECHNICAL_ISSUE_STATUS) => {
			const { data } = await apiClient.post(`/admin/app-bug/${issueId}/status`, { status });
			return data.data;
		},
	});
};
