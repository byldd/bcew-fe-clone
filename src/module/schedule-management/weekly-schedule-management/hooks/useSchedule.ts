import { apiClient } from "@/lib/api";
import { IApiResponse, IPaginatedApiResponse, ROLES } from "@/types";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	ICreateDailyJobPayload,
	ICreateQcJobAutoAssignPayload,
	ICreateQcJobPayload,
	IEmployeeDayTime,
	IGetAdminNotificationFilter,
	IGetAdminNotificationItem,
	IGetScheduleEmployeesFilter,
	IGetValidationErrorsFilter,
	ILabel,
	IMarkJobAsNotReadyPayload,
	IPublishSchedulePayload,
	IReAssignEmployeePayload,
	IReplaceEmployeeInDailyJobPayload,
	ISaveSchedulePdfPayload,
	IScheduleEmployee,
	IScheduleEmployeeDayTimeFilter,
	ISendAlertPayload,
	ISendJobAlertPayload,
	ISubContractorWithCrews,
	IUpdateAdminNotificationPayload,
	IUpdateDailyJobPayload,
	IUpdateQcInspectionJobPayload,
	IUpdateQcRepairJobPayload,
	IValidateSchedulePayload,
	IValidationErrors,
	IWeekScheduleResponse,
} from "../types/schedule-interface";
import { IGetWeekScheduleFilter } from "../types/schedule-interface";
import { ICrewsResponse, IPaginatedCrewSearchQuery } from "@/module/crew/types";
import { IQcInspectionForeman } from "../types/qc-job";
import { ITeam } from "@/module/team/types";
import { UserType } from "@/module/profile/types";
import { ISubContractorAdminGroupedNotificationResponse } from "@/module/sub-contractor/notification/types/notification";
import {
	IAdminNotificationGroupedResponse,
	IAdminNotificationTypeGroupedResponse,
	INotificationPreferenceResponse,
	IUpdateNotificationPreferencePayload,
	MODULE_GROUP,
} from "@/module/admin/notifications/types/type";
import { NOTIFICATION_TYPE } from "@/types/notification";

export const useWeekSchedule = (filters: IGetWeekScheduleFilter) => {
	return useQuery({
		queryKey: ["week-schedule", filters],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<IWeekScheduleResponse>>("/admin/schedule", {
				params: filters,
			});
			return data.data;
		},
		staleTime: 0,
		refetchOnWindowFocus: false,
	});
};

export const useReRunWeekSchedule = () => {
	return useMutation({
		mutationFn: async () => {
			const { data } = await apiClient.post("/admin/schedule/re-run");
			return data.data;
		},
	});
};

export const usePublishWeekSchedule = () => {
	return useMutation({
		mutationFn: async (payload: IPublishSchedulePayload) => {
			const { data } = await apiClient.post<IApiResponse<IValidationErrors[]>>("/admin/schedule/publish", payload);
			return data.data;
		},
	});
};

export const usePublishAJob = () => {
	return useMutation({
		mutationFn: async (payload: { dailyJobId: string }) => {
			const { data } = await apiClient.post(`/admin/schedule/publish/${payload.dailyJobId}`);
			return data.data;
		},
	});
};

export const useValidateWeekSchedule = () => {
	return useMutation({
		mutationFn: async (payload: IValidateSchedulePayload) => {
			const { data } = await apiClient.post("/admin/schedule/validate", payload);
			return data.data;
		},
	});
};

export const useCreateDailyJob = (user?: UserType["data"]["user"] | null) => {
	return useMutation({
		mutationFn: async (payload: ICreateDailyJobPayload) => {
			const apiRoute =
				user && user?.userType === ROLES.SUB_CONTRACTOR
					? "/sub-contractor/schedule/daily-job"
					: "/admin/schedule/daily-job";

			const { data } = await apiClient.post<IApiResponse<IWeekScheduleResponse["dailyJobs"][number]>>(
				apiRoute,
				payload
			);
			return data.data;
		},
	});
};

export const useUpdateDailyJob = () => {
	return useMutation({
		mutationFn: async ({ id, payload }: { id: string; payload: IUpdateDailyJobPayload }) => {
			const { data } = await apiClient.put<IApiResponse<IWeekScheduleResponse["dailyJobs"][number]>>(
				`/admin/schedule/daily-job/${id}`,
				payload
			);
			return data.data;
		},
	});
};

export const useDeleteDailyJob = () => {
	return useMutation({
		mutationFn: async ({ id, ...payload }: { id: string; message?: string; sendSms?: boolean }) => {
			const { data } = await apiClient.delete(`/admin/schedule/daily-job/${id}`, {
				data: {
					...payload,
				},
			});
			return data.data;
		},
	});
};

export const useGetLabels = (user: UserType["data"]["user"] | null) => {
	return useQuery({
		queryKey: ["labels"],
		queryFn: async () => {
			const apiRoute = user?.userType === ROLES.SUB_CONTRACTOR ? "/sub-contractor/labels" : "/admin/schedule/labels";
			const { data } = await apiClient.get<IApiResponse<ILabel[]>>(apiRoute);
			return data.data;
		},
	});
};

export const useGetValidationErrors = (filters: IGetValidationErrorsFilter, enabled: boolean = true) => {
	return useQuery({
		queryKey: ["validation-errors", filters],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<IValidationErrors[]>>("/admin/schedule/validate", {
				params: filters,
			});
			return data.data;
		},
		enabled,
	});
};

export const useReAssignEmployees = () => {
	return useMutation({
		mutationFn: async (payload: IReAssignEmployeePayload) => {
			const { data } = await apiClient.post(`/admin/schedule/daily-job/re-assign`, payload);
			return data.data;
		},
	});
};

export const useUpdateDailyJobEmployee = () => {
	return useMutation({
		mutationFn: async ({ id, payload }: { id: string; payload: { stopNumber: number | null } }) => {
			const { data } = await apiClient.patch<IApiResponse<IWeekScheduleResponse["dailyJobs"][number]>>(
				`/admin/schedule/daily-job-employee/${id}`,
				payload
			);
			return data.data;
		},
	});
};

export const useRemoveDailyJobEmployee = () => {
	return useMutation({
		mutationFn: async (payload: {
			assignmentIds: string[];
			dailyJobId: string;
			message?: string;
			sendSms?: boolean;
		}) => {
			const { data } = await apiClient.delete<IApiResponse<IWeekScheduleResponse["dailyJobs"][number]>>(
				`/admin/schedule/daily-job-employee`,
				{
					data: payload,
				}
			);
			return data.data;
		},
	});
};

export const useReplaceDailyJobEmployee = () => {
	return useMutation({
		mutationFn: async (payload: IReplaceEmployeeInDailyJobPayload) => {
			const { data } = await apiClient.post<IApiResponse<IWeekScheduleResponse["dailyJobs"][number]>>(
				`/admin/schedule/daily-job-employee/replace`,
				payload
			);
			return data.data;
		},
	});
};

export const useCreateQcJob = () => {
	return useMutation({
		mutationFn: async (payload: ICreateQcJobPayload) => {
			const { data } = await apiClient.post("/admin/qc-job", payload);
			return data.data;
		},
	});
};

export const useUpdateQcRepairJob = () => {
	return useMutation({
		mutationFn: async ({ id, payload }: { id: string; payload: IUpdateQcRepairJobPayload }) => {
			const { data } = await apiClient.put<IApiResponse<IWeekScheduleResponse["dailyJobs"][number]>>(
				`/admin/qc-job/repair/${id}`,
				payload
			);
			return data.data;
		},
		mutationKey: ["update-qc-repair-job"],
	});
};

export const useUpdateQcInspectionJob = () => {
	return useMutation({
		mutationFn: async ({ id, payload }: { id: string; payload: IUpdateQcInspectionJobPayload }) => {
			const { data } = await apiClient.put<IApiResponse<IWeekScheduleResponse["dailyJobs"][number]>>(
				`/admin/qc-job/inspection/${id}`,
				payload
			);
			return data.data;
		},
		mutationKey: ["update-qc-inspection-job"],
	});
};

export const useQcInspectionForman = () => {
	return useQuery({
		queryKey: ["qc-inspection-forman"],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<IQcInspectionForeman[]>>("/admin/qc-job/foreman");
			return data.data;
		},
	});
};

export const useMarkJobAsNotReady = () => {
	return useMutation({
		mutationFn: async (payload: IMarkJobAsNotReadyPayload) => {
			const { data } = await apiClient.post("/admin/schedule/daily-job/not-ready", payload);
			return data.data;
		},
		mutationKey: ["mark-job-as-not-ready"],
	});
};

export const useSendAlertsToAllUsers = () => {
	return useMutation({
		mutationFn: async (payload: ISendAlertPayload) => {
			const { data } = await apiClient.post("/admin/notification/user", payload);
			return data.data;
		},
		mutationKey: ["send-alerts-to-users"],
	});
};

export const useSendJobAlerts = () => {
	return useMutation({
		mutationFn: async ({ dailyJobId, ...payload }: ISendJobAlertPayload) => {
			const { data } = await apiClient.post(`/admin/notification/daily-job/${dailyJobId}`, payload);
			return data.data;
		},
		mutationKey: ["send-job-alerts"],
	});
};

export const useGetAdminNotifications = (filters: IGetAdminNotificationFilter, enabled = true) => {
	return useQuery({
		queryKey: ["admin-notifications", filters],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<IPaginatedApiResponse<IGetAdminNotificationItem>>>(
				"/admin/notification",
				{
					params: filters,
				}
			);
			return data.data;
		},
		enabled,
	});
};

export const useGetAdminNotificationsCount = (enabled?: boolean) => {
	return useQuery({
		queryKey: ["admin-notifications-count"],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<{ count: number }>>("/admin/notification/count");
			return data.data;
		},
		enabled: enabled ?? true,
	});
};

export const useGetAdminNotificationCount = (filters: IGetAdminNotificationFilter, enabled = true) => {
	return useQuery({
		queryKey: ["admin-notifications-grouped", filters],
		queryFn: async () => {
			const { data } = await apiClient.get<IAdminNotificationTypeGroupedResponse>("/admin/notification/grouped", {
				params: filters,
			});
			return data.data;
		},
		enabled,
	});
};

export const useGetNotificationPreference = (user?: UserType["data"]["user"] | null) => {
	return useQuery<INotificationPreferenceResponse>({
		queryKey: ["notification-preference", user?.id],
		enabled: !!user,
		queryFn: async () => {
			const endPoint =
				user && user?.userType === ROLES.SUB_CONTRACTOR
					? "/sub-contractor/notification/preferences"
					: "/admin/notification/preferences";
			const { data } = await apiClient.get(endPoint);
			return data.data;
		},
	});
};

export const useUpdateNotificationPreference = (user?: UserType["data"]["user"] | null) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (payload: IUpdateNotificationPreferencePayload) => {
			if (!user) {
				throw new Error("User type is required to update notification filter preferences.");
			}

			const endPoint =
				user && user?.userType === ROLES.SUB_CONTRACTOR
					? "/sub-contractor/notification/preferences"
					: "/admin/notification/preferences";

			await apiClient.put(endPoint, payload);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["notification-preference"],
			});
		},
	});
};

export const useUpdateNotificationOrder = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (order: NOTIFICATION_TYPE[]) => {
			await apiClient.post("/admin/notification/group-order", {
				order,
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["admin-notifications-grouped"],
			});
		},
	});
};

export const useGetAdminNotificationModuleGrouped = (filters: IGetAdminNotificationFilter, enabled = true) => {
	return useQuery({
		queryKey: ["admin-notifications-module-grouped", filters],
		queryFn: async () => {
			const { data } = await apiClient.get<IAdminNotificationGroupedResponse>("/admin/notification/grouped-by-module", {
				params: filters,
			});
			return data.data;
		},
		enabled,
	});
};

export const useUpdateModuleOrder = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (payload: { order: MODULE_GROUP[]; groupBy: "module" }) => {
			await apiClient.post("/admin/notification/module-group-order", payload);
		},

		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["admin-notifications-module-grouped"],
			});
		},
	});
};

export const useGetSubContractorNotificationGrouped = (filters: IGetAdminNotificationFilter, enabled = true) => {
	return useQuery({
		queryKey: ["sub-contractor-notifications-grouped", filters],
		queryFn: async () => {
			const { data } = await apiClient.get<ISubContractorAdminGroupedNotificationResponse>(
				"/sub-contractor/notification/grouped",
				{
					params: filters,
				}
			);
			return data.data;
		},
		enabled,
	});
};

export const useGetAdminNotificationsInfinite = (filters: Omit<IGetAdminNotificationFilter, "page">) => {
	return useInfiniteQuery({
		queryKey: ["admin-notifications-infinite", filters],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<IPaginatedApiResponse<IGetAdminNotificationItem>>>(
				"/admin/notification",
				{
					params: {
						...filters,
					},
				}
			);
			return data.data;
		},
		initialPageParam: 1,
		getNextPageParam: (lastPage, allPages) => {
			const totalPages = Math.ceil((lastPage.total || 0) / (filters.pageSize || 10));
			const nextPage = allPages.length + 1;
			return nextPage <= totalPages ? nextPage : undefined;
		},
	});
};

export const useUpdateAdminNotification = () => {
	return useMutation({
		mutationFn: async ({ id, payload }: { id: string; payload: IUpdateAdminNotificationPayload }) => {
			const { data } = await apiClient.put(`/admin/notification/${id}/read`, payload);
			return data.data;
		},
	});
};

export const useMarkAllAdminNotificationsRead = () => {
	return useMutation({
		mutationFn: async (payload?: IGetAdminNotificationFilter) => {
			const { data } = await apiClient.put("/admin/notification/read-all", payload);

			return data.data;
		},
	});
};

export const useGetDailyJob = (dailyJobId: string, enabled: boolean = true) => {
	return useQuery({
		queryKey: ["daily-job", dailyJobId],
		enabled,
		queryFn: async () => {
			const { data } = await apiClient.get<
				IApiResponse<{
					dailyJob: IWeekScheduleResponse["dailyJobs"][number];
					bcewJob: IWeekScheduleResponse["bcewJobs"][number];
				}>
			>(`/admin/schedule/daily-job/${dailyJobId}`);
			return data.data;
		},
		refetchOnWindowFocus: false,
	});
};

export const useScheduleCrews = (query: IPaginatedCrewSearchQuery) => {
	return useQuery({
		queryKey: ["schedule-crews", query],
		queryFn: async () => {
			const { data } = await apiClient.get<{ data: ICrewsResponse }>("/admin/schedule/crew", {
				params: query,
			});
			return data.data;
		},
		refetchOnWindowFocus: false,
	});
};

export const useScheduleSubcontractors = () => {
	return useQuery({
		queryKey: ["schedule-subcontractors"],
		queryFn: async () => {
			const { data } = await apiClient.get<{ data: ISubContractorWithCrews[] }>("/admin/schedule/subcontractor");
			return data.data;
		},
		refetchOnWindowFocus: false,
	});
};

export const useCreateQcJobAutoAssign = () => {
	return useMutation({
		mutationFn: async (payload: ICreateQcJobAutoAssignPayload) => {
			const { data } = await apiClient.post("/admin/qc-job/auto-assign", payload);
			return data.data;
		},
	});
};

export const useScheduleEmployees = (filters: IGetScheduleEmployeesFilter) => {
	return useQuery({
		queryKey: ["schedule-employees", filters],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<IScheduleEmployee[]>>("/admin/schedule/employee", {
				params: filters,
			});
			return data.data;
		},
	});
};

export const useScheduleTeams = () => {
	return useQuery({
		queryKey: ["schedule-teams"],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<Pick<ITeam, "id" | "name">[]>>("/admin/schedule/team");
			return data.data;
		},
		refetchOnWindowFocus: false,
	});
};

export const useScheduleEmployeeDayTimes = (filters: IScheduleEmployeeDayTimeFilter) => {
	return useQuery({
		queryKey: ["schedule-employee-day-times", filters],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<IEmployeeDayTime[]>>("/admin/schedule/employee-day-logs", {
				params: filters,
			});
			return data.data;
		},
		refetchOnWindowFocus: false,
	});
};

export const useDownloadSchedule = () => {
	return useMutation({
		mutationFn: async (payload: ISaveSchedulePdfPayload) => {
			const response = await apiClient.post("/admin/schedule/pdf", payload, {
				responseType: "arraybuffer",
			});

			return response;
		},
	});
};
