import { apiClient } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { IApiResponse } from "@/types";
import type {
	CreateMaterialRequestSavedViewPayload,
	MaterialRequestApiRow,
	MaterialRequestAuditTrail,
	MaterialRequestSavedViewsResponse,
	MaterialRequestUpdatePayload,
	UpdateMaterialRequestSavedViewPayload,
} from "../utils/types";
import { FILTER_SAVED_VIEW_PAGE_KEY } from "@/utils/enums";
import { ADDITIONAL_MATERIAL_SOURCE } from "@/module/job/utils/enums";

const AUDIT_TRAIL_URL_BY_SOURCE: Record<ADDITIONAL_MATERIAL_SOURCE, (requestId: number | string) => string> = {
	[ADDITIONAL_MATERIAL_SOURCE.ADMIN]: (requestId) => `/admin/material-requests/request/${requestId}/history`,
	[ADDITIONAL_MATERIAL_SOURCE.EMPLOYEE]: (requestId) =>
		`/employee/material-selection/additional-material/${requestId}/history`,
};

export const useMaterialRequests = ({
	startDate,
	endDate,
	isForeman,
	isMaterialRequestAllowed = false,
}: {
	startDate?: string;
	endDate?: string;
	isForeman: boolean | undefined;
	isMaterialRequestAllowed?: boolean;
}) => {
	const useForeman = isForeman || isMaterialRequestAllowed;
	const url = useForeman ? "/foreman/material-management/material-requests" : "/admin/material-requests";

	return useQuery({
		queryKey: ["admin-material-requests", isForeman, isMaterialRequestAllowed, startDate ?? null, endDate ?? null],
		enabled: isForeman !== undefined,
		queryFn: async () => {
			const params = startDate ? { startDate, ...(endDate ? { endDate } : {}) } : undefined;
			const { data } = await apiClient.get<IApiResponse<MaterialRequestApiRow[]>>(url, { params });
			return data.data;
		},
	});
};

export const useMaterialRequestsByRequestId = ({
	requestId,
	enabled = true,
}: {
	requestId?: number | string | null;
	enabled?: boolean;
}) => {
	return useQuery({
		queryKey: ["admin-material-requests", "request", requestId],
		enabled: Boolean(enabled && requestId !== null && requestId !== undefined),
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<MaterialRequestApiRow[]>>(
				`/admin/material-requests/request/${requestId}`
			);
			return data.data;
		},
	});
};

export const useUpdateMaterialRequest = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			pullListItemId,
			payload,
		}: {
			pullListItemId: string;
			payload: MaterialRequestUpdatePayload;
		}) => {
			const { data } = await apiClient.patch<IApiResponse<MaterialRequestApiRow>>(
				`/admin/material-requests/${pullListItemId}`,
				payload
			);
			return data.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin-material-requests"] });
		},
	});
};

export const useUpdateMaterialRequestNote = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			pullListItemId,
			field,
			note,
		}: {
			pullListItemId: string;
			field: string;
			note: string | null;
		}) => {
			const { data } = await apiClient.post<IApiResponse<MaterialRequestApiRow>>(
				`/admin/material-requests/${pullListItemId}/note`,
				{ field, note }
			);
			return data.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin-material-requests"] });
		},
	});
};

export const useAssignMaterialRequest = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			pullListItemId,
			assignTo,
			note,
		}: {
			pullListItemId: string;
			assignTo: string;
			note: string | null;
		}) => {
			const { data } = await apiClient.patch<IApiResponse<MaterialRequestApiRow>>(
				`/foreman/material-management/material-requests/${pullListItemId}/assign`,
				{ assignTo, note }
			);
			return data.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin-material-requests"] });
		},
	});
};

export const useUpdateTeamMaterialRequestNote = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ pullListItemId, note }: { pullListItemId: string; note: string | null }) => {
			const { data } = await apiClient.post<IApiResponse<MaterialRequestApiRow>>(
				`/foreman/material-management/material-requests/${pullListItemId}/team-note`,
				{ note }
			);
			return data.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin-material-requests"] });
		},
	});
};

export const useUpdateForemanMaterialRequestNote = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ pullListItemId, note }: { pullListItemId: string; note: string | null }) => {
			const { data } = await apiClient.post<IApiResponse<MaterialRequestApiRow>>(
				`/foreman/material-management/material-requests/${pullListItemId}/note`,
				{ note }
			);
			return data.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin-material-requests"] });
		},
	});
};

export const useUpdateForemanMaterialRequestApproval = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			pullListItemId,
			isApproved,
			foremanNote,
		}: {
			pullListItemId: string;
			isApproved: boolean;
			foremanNote?: string | null;
		}) => {
			const { data } = await apiClient.patch<IApiResponse<MaterialRequestApiRow>>(
				`/foreman/material-management/material-requests/${pullListItemId}/approval`,
				{
					isApproved,
					...(foremanNote !== undefined ? { foremanNote } : {}),
				}
			);
			return data.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin-material-requests"] });
		},
	});
};

export const useReassignForemanMaterialRequest = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ pullListItemId, note }: { pullListItemId: string; note: string }) => {
			const { data } = await apiClient.patch<IApiResponse<MaterialRequestApiRow>>(
				`/foreman/material-management/material-requests/${pullListItemId}/reassign`,
				{ note }
			);
			return data.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin-material-requests"] });
		},
	});
};

export const useMaterialRequestSavedViews = () => {
	return useQuery({
		queryKey: ["material-request-saved-views"],

		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<MaterialRequestSavedViewsResponse>>(
				"/admin/material-requests/views",
				{
					params: {
						pageKey: FILTER_SAVED_VIEW_PAGE_KEY.MATERIAL_REQUESTS,
					},
				}
			);

			return data.data;
		},
	});
};

export const useCreateMaterialRequestSavedView = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (payload: CreateMaterialRequestSavedViewPayload) => {
			const { data } = await apiClient.post("/admin/material-requests/views", payload);

			return data.data;
		},

		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["material-request-saved-views"],
			});
		},
	});
};

export const useUpdateMaterialRequestSavedView = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ viewId, payload }: { viewId: string; payload: UpdateMaterialRequestSavedViewPayload }) => {
			const { data } = await apiClient.patch(`/admin/material-requests/views/${viewId}`, payload);

			return data.data;
		},

		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["material-request-saved-views"],
			});
		},
	});
};

export const useDeleteMaterialRequestSavedView = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (viewId: string) => {
			const { data } = await apiClient.delete(`/admin/material-requests/views/${viewId}`);

			return data.data;
		},

		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["material-request-saved-views"],
			});
		},
	});
};

export const useMaterialRequestAuditTrail = ({
	requestId,
	source = ADDITIONAL_MATERIAL_SOURCE.ADMIN,
	enabled = true,
}: {
	requestId?: number | string | null;
	source?: ADDITIONAL_MATERIAL_SOURCE;
	enabled?: boolean;
}) => {
	return useQuery({
		queryKey: ["admin-material-requests", "history", source, requestId],
		enabled: Boolean(enabled && requestId !== null && requestId !== undefined),
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<MaterialRequestAuditTrail>>(
				AUDIT_TRAIL_URL_BY_SOURCE[source](requestId as number | string)
			);
			return data.data;
		},
	});
};
