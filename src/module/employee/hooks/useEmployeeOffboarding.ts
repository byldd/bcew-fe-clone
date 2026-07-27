import { apiClient } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { IApiResponse } from "@/types";
import {
	IDeactivateEmployeeResponse,
	ITemporaryCoverageRequest,
	ITemporaryCoverageResponse,
	ITransferAssignmentPayload,
	ITransferGroup,
} from "@/module/employee/types";

const EMPLOYEE_URL = "/admin/employee";

export const useStartTemporaryCoverage = (employeeId: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: ["start-temporary-coverage", employeeId],
		mutationFn: async (payload: ITemporaryCoverageRequest) => {
			const { data } = await apiClient.post<IApiResponse<ITemporaryCoverageResponse>>(
				`${EMPLOYEE_URL}/${employeeId}/temporary-coverage`,
				payload
			);
			return data.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["employee", employeeId] });
		},
	});
};

export const useEndTemporaryCoverage = (employeeId: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: ["end-temporary-coverage", employeeId],
		mutationFn: async () => {
			const { data } = await apiClient.post<IApiResponse<ITemporaryCoverageResponse>>(
				`${EMPLOYEE_URL}/${employeeId}/temporary-coverage/end`
			);
			return data.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["employee", employeeId] });
		},
	});
};

export const useEmployeeTransferItems = (employeeId: string) => {
	return useQuery({
		queryKey: ["employee-transfer-items", employeeId],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<ITransferGroup[]>>(
				`${EMPLOYEE_URL}/${employeeId}/transfer-items`
			);
			return data.data;
		},
		enabled: !!employeeId,
		retry: false,
	});
};

export const useTransferAssignments = (employeeId: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: ["transfer-assignments", employeeId],
		mutationFn: async (payload: ITransferAssignmentPayload) => {
			const { data } = await apiClient.post<IApiResponse<{ success: boolean }>>(
				`${EMPLOYEE_URL}/${employeeId}/transfer-items`,
				payload
			);
			return data.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["employee-transfer-items", employeeId] });
		},
	});
};

export const useDeactivateEmployee = (employeeId: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: ["deactivate-employee", employeeId],
		mutationFn: async () => {
			const { data } = await apiClient.post<IApiResponse<IDeactivateEmployeeResponse>>(
				`${EMPLOYEE_URL}/${employeeId}/deactivate`
			);
			return data.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["employee", employeeId] });
		},
	});
};

export const useReactivateEmployee = (employeeId: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: ["reactivate-employee", employeeId],
		mutationFn: async () => {
			const { data } = await apiClient.post<IApiResponse<IDeactivateEmployeeResponse>>(
				`${EMPLOYEE_URL}/${employeeId}/reactivate`
			);
			return data.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["employee", employeeId] });
		},
	});
};
