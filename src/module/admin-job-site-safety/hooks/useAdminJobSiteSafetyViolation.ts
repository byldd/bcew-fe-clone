import { apiClient } from "@/lib/api";
import { dateToUTCString } from "@/lib/utils/date";
import { IApiResponse } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { IAssignedJob } from "@/module/employee-safety/types";
import { IActiveEmployeeContact, ICreateViolationPayload, IJobSiteSafetyViolation } from "../types";

const BASE_URL = "/admin/job-site-safety/violation";

export const useViolationEmployees = () =>
	useQuery({
		queryKey: ["admin-violation-active-employees"],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<IActiveEmployeeContact[]>>(`${BASE_URL}/employees`);
			return data.data;
		},
	});

export const useViolationAssignedJobs = (employeeId?: string, date?: Date) =>
	useQuery({
		queryKey: ["admin-violation-assigned-jobs", employeeId, date?.toDateString()],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<IAssignedJob[]>>(`${BASE_URL}/jobs`, {
				params: { employeeId, date: dateToUTCString(date!) },
			});
			return data.data;
		},
		enabled: Boolean(employeeId) && Boolean(date),
	});

export const useCreateViolation = () =>
	useMutation({
		mutationKey: ["create-admin-job-site-safety-violation"],
		mutationFn: async (payload: ICreateViolationPayload) => {
			const { data } = await apiClient.post<IApiResponse<IJobSiteSafetyViolation>>(BASE_URL, payload);
			return data.data;
		},
	});

export const useUpdateViolation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: ["update-admin-job-site-safety-violation"],
		mutationFn: async ({ id, payload }: { id: string; payload: ICreateViolationPayload }) => {
			const { data } = await apiClient.put<IApiResponse<IJobSiteSafetyViolation>>(`${BASE_URL}/${id}`, payload);
			return data.data;
		},
		onSuccess: (_, { id }) => {
			queryClient.invalidateQueries({ queryKey: ["admin-job-site-safety-violation-detail", id] });
			queryClient.invalidateQueries({ queryKey: ["admin-job-site-safety-dashboard"] });
		},
	});
};
