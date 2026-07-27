import { apiClient } from "@/lib/api";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
	IEmployeeNamesResponse,
	IDepartmentResponse,
	ICreateCrewPayload,
	ICrewsResponse,
	IPaginatedCrewSearchQuery,
	ICrewLeadersResponse,
} from "@/module/crew/types";

export const useEmployeesNames = () => {
	return useQuery({
		queryKey: ["employeesName"],
		queryFn: async () => {
			const { data } = await apiClient.get<{ data: IEmployeeNamesResponse }>("/admin/crew/employee-name");
			return data.data.items;
		},
	});
};

export const useDepartment = () => {
	return useQuery({
		queryKey: ["departments"],
		queryFn: async () => {
			const { data } = await apiClient.get<{ data: IDepartmentResponse }>("/admin/department");
			return data.data.items;
		},
	});
};

export const useCreateCrew = () => {
	return useMutation({
		mutationKey: ["createCrew"],
		mutationFn: async (payload: ICreateCrewPayload) => {
			const { data } = await apiClient.post("/admin/crew", payload);
			return data;
		},
	});
};

export const useCrews = (query: IPaginatedCrewSearchQuery) => {
	return useQuery({
		queryKey: ["crews", query],
		queryFn: async () => {
			const { data } = await apiClient.get<{ data: ICrewsResponse }>("/admin/crew", {
				params: query,
			});
			return data.data;
		},
	});
};

export const useDeleteCrew = () => {
	return useMutation({
		mutationKey: ["deleteCrew"],
		mutationFn: async (crewId: string) => {
			const { data } = await apiClient.delete(`/admin/crew/${crewId}`);
			return data;
		},
	});
};

export const useUpdateCrew = (crewId: string) => {
	return useMutation({
		mutationKey: ["updateCrew"],
		mutationFn: async (payload: ICreateCrewPayload) => {
			const { data } = await apiClient.put(`/admin/crew/${crewId}`, payload);
			return data;
		},
	});
};

export const useCrewLeaders = () => {
	return useQuery({
		queryKey: ["crewLeaders"],
		queryFn: async () => {
			const { data } = await apiClient.get<{ data: ICrewLeadersResponse }>("/admin/crew/leaders");
			return data.data?.item;
		},
	});
};
