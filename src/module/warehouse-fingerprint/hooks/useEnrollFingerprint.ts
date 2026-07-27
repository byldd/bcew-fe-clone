import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import {
	IEnrollFingerprintPayload,
	IEnrolledStatus,
	IWarehouseEmployeeResponse,
	IWarehouseEmployeeSearchQuery,
} from "../types";

export const useWarehouseEmployees = (query: IWarehouseEmployeeSearchQuery) => {
	return useQuery({
		queryKey: ["warehouse-employees", query],
		queryFn: async () => {
			const { data } = await apiClient.get<{
				data: IWarehouseEmployeeResponse;
			}>("/admin/warehouse-fingerprint", {
				params: query,
			});

			return {
				items: data.data,
			};
		},
	});
};

export const useEnrollFingerprint = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: ["enrollFingerprint"],
		mutationFn: async (payload: IEnrollFingerprintPayload) => {
			const { data } = await apiClient.post("/admin/warehouse-fingerprint/enroll", payload);

			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["enrolledStatus"],
			});
		},
	});
};

export const useEnrolledStatus = () => {
	return useQuery({
		queryKey: ["enrolledStatus"],
		queryFn: async () => {
			const { data } = await apiClient.get("/admin/warehouse-fingerprint/enrollments");

			return data.data as IEnrolledStatus[];
		},
	});
};

export const useDeleteFingerprint = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: ["deleteFingerprint"],
		mutationFn: async (payload: { userId: string }) => {
			const { data } = await apiClient.delete(`/admin/warehouse-fingerprint/${payload.userId}`);

			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["enrolledStatus"],
			});
		},
	});
};

export const useDeleteSingleFingerprint = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: ["deleteSingleFingerprint"],

		mutationFn: async (payload: { fingerprintId: string }) => {
			const { data } = await apiClient.delete(`/admin/warehouse-fingerprint/single/${payload.fingerprintId}`);

			return data;
		},

		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["enrolledStatus"],
			});
		},
	});
};
