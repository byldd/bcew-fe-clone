import {
	IModulesResponse,
	IPermissionChangeHistoryItem,
	IPermissionHistoryConfigChangeItem,
	IRoleChangeHistoryItem,
	IRolePermissionHistoryDetailsResponse,
	IRolesWithPermissionsResponse,
	IRoleWithPermissionsResponse,
	IUserPermissionHistoryDetailsResponse,
	IUserPermissionHistoryListItem,
} from "@/module/employee/types";
import { apiClient } from "@/lib/api";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ACCESS_LEVEL } from "@/module/employee/enums";
import { MOCK_ROLE_CHANGE_HISTORY } from "@/module/employee/constants";

export const useRoles = () => {
	return useQuery({
		queryKey: ["roles"],
		queryFn: async () => {
			const { data } = await apiClient.get<{ data: IModulesResponse }>("/admin/role");
			return data.data?.items;
		},
	});
};

export const useRolesWithPermissions = () => {
	return useQuery({
		queryKey: ["rolesWithPermissions"],
		queryFn: async () => {
			const { data } = await apiClient.get<{ data: IRolesWithPermissionsResponse }>("/admin/role/with-permissions");
			return data.data?.items;
		},
	});
};

export const useRoleWithPermissions = (roleID: string) => {
	return useQuery({
		queryKey: ["roleWithPermissions", roleID],
		queryFn: async () => {
			const { data } = await apiClient.get<{ data: IRoleWithPermissionsResponse }>(
				`/admin/role/${roleID}/with-permissions`
			);
			return data.data?.items;
		},
	});
};

export const useModules = () => {
	return useQuery({
		queryKey: ["modules"],
		queryFn: async () => {
			const { data } = await apiClient.get<{ data: IModulesResponse }>("/admin/role/modules");
			return data.data?.items;
		},
	});
};

export const useCreateRole = () => {
	return useMutation({
		mutationFn: async (payload: {
			name: string;
			defaultPermissions: {
				moduleId: string;
				accessLevel: ACCESS_LEVEL;
			}[];
			dayStartTime: string;
			dayEndTime: string;
			canSendNotification: boolean;
			trackTimeByGPS: boolean;
			isSpecialCardTimeLoggingExempt: boolean;
			isFingerprintEnabled: boolean;
		}) => {
			const { data } = await apiClient.post(`/admin/role`, payload);
			return data;
		},
	});
};

export const useUpdateRolePermissions = (id: string) => {
	return useMutation({
		mutationFn: async (payload: {
			name: string;
			permissions: {
				permissionId: string;
				accessLevel: ACCESS_LEVEL;
			}[];
			dayStartTime: string;
			dayEndTime: string;
			canSendNotification: boolean;
			trackTimeByGPS: boolean;
			canSendTravelPayRequest: boolean;
			requiresScheduleValidation: boolean;
			isSpecialCardTimeLoggingExempt: boolean;
			isFingerprintEnabled: boolean;
		}) => {
			const { data } = await apiClient.put(`/admin/role/${id}/permissions`, payload);
			return data;
		},
	});
};

export const useGetRolePermissionHistory = (historyId: string, enabled = true) => {
	return useQuery({
		queryKey: ["role-permission-history", historyId],
		enabled: enabled && !!historyId,
		queryFn: async () => {
			const { data } = await apiClient.get<{
				data: IRolePermissionHistoryDetailsResponse;
			}>(`/admin/role/role-page-permission-history-details/${historyId}`);

			return data.data;
		},
		refetchOnWindowFocus: false,
	});
};

export const useGetUserPermissionHistory = (historyId: string, enabled = true) => {
	return useQuery({
		queryKey: ["user-permission-history", historyId],
		enabled: enabled && !!historyId,
		queryFn: async () => {
			const { data } = await apiClient.get<{
				data: IUserPermissionHistoryDetailsResponse;
			}>(`/admin/user/permission-history-details/${historyId}`);

			return data.data;
		},
		refetchOnWindowFocus: false,
	});
};

export const useEmployeeRoleChangeHistory = (userId: string) => {
	return useQuery({
		queryKey: ["employeeRoleChangeHistory", userId],
		enabled: !!userId,
		queryFn: async (): Promise<IRoleChangeHistoryItem[]> => MOCK_ROLE_CHANGE_HISTORY,
	});
};

export const useEmployeePermissionChangeHistory = (userId: string) => {
	return useQuery({
		queryKey: ["employeePermissionChangeHistory", userId],
		enabled: !!userId,
		queryFn: async (): Promise<{
			permissionChanges: IPermissionChangeHistoryItem[];
			configurationChanges: IPermissionHistoryConfigChangeItem[];
		}> => {
			const { data } = await apiClient.get<{
				data: { items: IUserPermissionHistoryListItem[] };
			}>(`/admin/user/${userId}/permission-history`);

			const items = data.data.items;

			const permissionChanges = items.flatMap((history) =>
				history.permissionChanges.map((change) => ({
					id: change.id,
					pageName: change.page?.name ?? "Unknown",
					fromAccessLevel: change.previousAccessLevel as ACCESS_LEVEL,
					toAccessLevel: change.newAccessLevel as ACCESS_LEVEL,
					changedBy: history.updatedBy?.name ?? "Unknown",
					changedAt: history.createdAt,
				}))
			);

			const configurationChanges = items.flatMap((history) =>
				history.configurationChanges.map((change, index) => ({
					id: `${history.id}-${index}`,
					field: change.field,
					previousValue: change.previousValue,
					newValue: change.newValue,
					changedBy: history.updatedBy?.name ?? "Unknown",
					changedAt: history.createdAt,
				}))
			);

			return { permissionChanges, configurationChanges };
		},
	});
};
