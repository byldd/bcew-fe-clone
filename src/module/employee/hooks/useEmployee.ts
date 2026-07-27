import {
	IEmployeeDetailsResponse,
	IEmployeePermissionsResponse,
	IEmployeeRosterForWeekResponse,
	IEmployeesResponse,
	IGetUsersFilters,
	IGetUsersResponse,
	IPaginatedEmployeeSearchQuery,
	IUpdatedJobAssignmentResponseEmployee,
	IUserActivityResponse,
	IUserPagesPermissionPayload,
	UpdateUserConfigPayload,
} from "@/module/employee/types";
import { apiClient } from "@/lib/api";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ACCESS_LEVEL } from "@/module/employee/enums";
import { IUpdateJobAssignmentTimePayloadEmployee } from "@/module/employee/types";
import { IApiResponse } from "@/types";
import { IPaginatedEmployeeRosterSearchQuery } from "@/module/schedule-management/roster-time-configuration/types";

const EMPLOYEE_URL = "/admin/employee";

export const useEmployees = (query: IPaginatedEmployeeSearchQuery) => {
	return useQuery({
		queryKey: ["employees", query],
		queryFn: async () => {
			const { data } = await apiClient.get<{ data: IEmployeesResponse }>(EMPLOYEE_URL, {
				params: query,
			});
			return data.data;
		},
	});
};

export const useEmployee = (id: string) => {
	return useQuery({
		queryKey: ["employee", id],
		queryFn: async () => {
			const { data } = await apiClient.get<{ data: IEmployeeDetailsResponse }>(`${EMPLOYEE_URL}/${id}`);
			return data.data;
		},
	});
};

export const useEmployeePermissions = (id: string) => {
	return useQuery({
		queryKey: ["employeePermissions", id],
		queryFn: async () => {
			const { data } = await apiClient.get<{ data: IEmployeePermissionsResponse }>(`/admin/user/${id}/permissions`);
			return data.data;
		},
	});
};

export const useEmployeeUpdatePermissions = (id: string) => {
	return useMutation({
		mutationFn: async (updated: { permissionId: string; moduleId: string; accessLevel: ACCESS_LEVEL }[]) => {
			const { data } = await apiClient.put(`/admin/user/${id}/permissions`, {
				permissions: updated,
			});
			return data;
		},
	});
};

export const useUpdateUserPagesPermissions = () => {
	return useMutation({
		mutationFn: async ({ userId, updated }: { userId: string; updated: IUserPagesPermissionPayload }) => {
			const { data } = await apiClient.put(`/admin/user/${userId}/pages/permissions`, {
				updated,
			});
			return data;
		},
	});
};

export const useUpdateUserConfiguration = (id: string) => {
	return useMutation({
		mutationFn: async (payload: UpdateUserConfigPayload) => {
			const { data } = await apiClient.put(`/admin/user/${id}/configuration`, payload);
			return data;
		},
	});
};

export const useAssignUserNewRole = (id: string) => {
	return useMutation({
		mutationFn: async (roleId: string) => {
			const { data } = await apiClient.put(`/admin/user/${id}/role`, {
				roleId,
			});
			return data;
		},
	});
};

export const useUpdateTechnicianPermission = () => {
	return useMutation({
		mutationFn: async (userId: string) => {
			const { data } = await apiClient.put(`/admin/user/${userId}`);
			return data;
		},
	});
};

export const useUpdateWeekendSelfScheduling = () => {
	return useMutation({
		mutationFn: async ({ isAllowed, userId }: { isAllowed: boolean; userId: string }) => {
			const { data } = await apiClient.put(`/admin/user/${userId}/weekend-self-scheduling`, {
				isWeekendSelfSchedulingAllowed: isAllowed,
			});
			return data;
		},
	});
};

export const useUpdateSpecialJobExempt = () => {
	return useMutation({
		mutationFn: async ({ isExempt, userId }: { isExempt: boolean; userId: string }) => {
			const { data } = await apiClient.put(`/admin/user/${userId}/exempt-time-logging`, {
				isExempt,
			});
			return data;
		},
	});
};

export const useUpdateSelfScheduling = () => {
	return useMutation({
		mutationFn: async ({ isAllowed, userId }: { isAllowed: boolean; userId: string }) => {
			const { data } = await apiClient.put(`/admin/user/${userId}/self-scheduling`, {
				isSelfSchedulingAllowed: isAllowed,
			});
			return data;
		},
	});
};

export const useUpdateFingerprintPermission = () => {
	return useMutation({
		mutationFn: async ({ isEnabled, userId }: { isEnabled: boolean; userId: string }) => {
			const { data } = await apiClient.put(`/admin/user/${userId}/fingerprint-permission`, {
				isFingerprintEnabled: isEnabled,
			});
			return data;
		},
	});
};

export const useUpdateMaterialRequestPermission = () => {
	return useMutation({
		mutationFn: async ({ isAllowed, userId }: { isAllowed: boolean; userId: string }) => {
			const { data } = await apiClient.put(`/admin/user/${userId}/material-request-permission`, {
				isMaterialRequestAllowed: isAllowed,
			});
			return data;
		},
	});
};

export const useUpdateMaterialRole = () => {
	return useMutation({
		mutationFn: async ({ materialRole, userId }: { materialRole: string | null; userId: string }) => {
			const { data } = await apiClient.put(`/admin/user/${userId}/material-role`, {
				materialRole,
			});
			return data;
		},
	});
};

export const useUserActivity = (id: string, startDate?: string, endDate?: string) => {
	return useQuery({
		queryKey: ["userActivity", id, startDate, endDate],
		queryFn: async () => {
			const url = `/admin/user/${id}/activity`;

			const { data } = await apiClient.get<{ data: IUserActivityResponse }>(url, {
				params: {
					startDte: startDate,
					endDte: endDate,
				},
			});

			return data;
		},
	});
};

export const useUpdateJobAssignmentTimeEmployee = (dailyJobId?: string) => {
	return useMutation({
		mutationKey: ["employee-activity-timelog"],
		mutationFn: async ({ employeeId, startTime, endTime }: IUpdateJobAssignmentTimePayloadEmployee) => {
			if (!dailyJobId || !employeeId) {
				throw new Error("dailyJobId and employeeId are required");
			}

			const response = await apiClient.put<{
				success: boolean;
				data: IUpdatedJobAssignmentResponseEmployee;
			}>(`/admin/user/job-assignment/${dailyJobId}`, {
				employeeId,
				startTime,
				endTime,
			});

			return response.data;
		},
	});
};

export const useGetUsers = (filters?: IGetUsersFilters) => {
	return useQuery({
		queryKey: ["users"],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<IGetUsersResponse>>(`/admin/user`, {
				params: filters,
			});
			return data.data;
		},
	});
};

export const useEmployeeWeeklyRoster = (id: string, query: IPaginatedEmployeeRosterSearchQuery) => {
	const { startDate, endDate } = query;

	return useQuery({
		queryKey: ["employeeWeeklyRoster", id, query],
		enabled: !!id,
		queryFn: async () => {
			const { data } = await apiClient.get<{ data: IEmployeeRosterForWeekResponse }>(`/admin/user/${id}/roster`, {
				params: { weekStart: startDate, weekEnd: endDate },
			});
			return data.data;
		},
	});
};

export const useUpdateQcPermission = () => {
	return useMutation({
		mutationFn: async ({ isEnabled, userId }: { isEnabled: boolean; userId: string }) => {
			const { data } = await apiClient.put(`/admin/user/${userId}/qc-enabled`, {
				isQcEnabled: isEnabled,
			});
			return data;
		},
	});
};

export const useUpdateAsanaPermission = () => {
	return useMutation({
		mutationFn: async ({ isEnabled, userId }: { isEnabled: boolean; userId: string }) => {
			const { data } = await apiClient.put(`/admin/user/${userId}/asana-enabled`, {
				isAsanaEnabled: isEnabled,
			});
			return data;
		},
	});
};

export const useUpdatePastDateScheduleUpdatePermission = () => {
	return useMutation({
		mutationFn: async ({ isAllowed, userId }: { isAllowed: boolean; userId: string }) => {
			const { data } = await apiClient.put(`/admin/user/${userId}/past-date-schedule-update`, {
				isPastDateScheduleUpdateAllowed: isAllowed,
			});
			return data;
		},
	});
};
