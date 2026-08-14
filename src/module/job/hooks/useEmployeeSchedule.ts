import { apiClient } from "@/lib/api";
import {
	IEmployeeScheduleItem,
	IUpdatedJobAssignmentResponse,
	IUpdateVehiclePayload,
	IVehicleHistoryEntry,
} from "@/module/employee-dashboard/types";
import { IApiResponse, IApiSuccessResponse } from "@/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
	IDayTime,
	IEmployeeDayVarianceStatus,
	IEmployeeLockStatus,
	IEmployeePendingLateness,
	IGetEmployeeScheduleFilter,
	IJobEmployeeDayTime,
	IPauseTime,
	IRescheduleJobPayload,
	IScheduleEmployee,
	IScheduleWeekend,
	IVehicleGPS,
} from "../types";
import {
	ICreateJobDailyNotePayload,
	IDailyJob,
	IJobEmployeeAssignment,
	IMarkJobAsNotReadyPayload,
} from "@/module/schedule-management/weekly-schedule-management/types/schedule-interface";
import { IScheduleConfiguration } from "@/module/schedule-management/weekly-schedule-management/types/schedule-configuration";
import { IRoster } from "@/module/schedule-management/roster-time-configuration/types";
import { UserType } from "@/module/profile/types";

export const useGetEmployeeData = (startDate: string) => {
	return useQuery({
		queryKey: ["employeeData", startDate],
		queryFn: async () => {
			const response = await apiClient.get<IApiResponse<{ user: NonNullable<UserType["data"]["user"]> }>>(
				`/user/employee`,
				{
					params: { startDate },
				}
			);
			return response.data.data.user;
		},
		enabled: true,
		refetchOnWindowFocus: false,
	});
};

export const useEmployeeSchedules = (filters: IGetEmployeeScheduleFilter) => {
	return useQuery({
		queryKey: ["employee-schedule", filters],
		enabled: !!filters.startDate,
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<IEmployeeScheduleItem[]>>("/employee/schedule", {
				params: filters,
			});
			return data.data;
		},
	});
};

export const useEmployeeVehicles = (startDate?: string) => {
	return useQuery({
		queryKey: ["employee-vehicle", startDate],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<IVehicleHistoryEntry[]>>("/employee/schedule/vehicle-history", {
				params: { startDate },
			});
			return data.data;
		},
	});
};

export const useUpdateEmployeeVehicle = () => {
	return useMutation({
		mutationKey: ["employee-vehicle-change"],
		mutationFn: async (payload: IUpdateVehiclePayload) => {
			const response = await apiClient.post<IApiSuccessResponse<IUpdatedJobAssignmentResponse>>(
				`/employee/schedule/vehicle-change`,
				payload
			);
			return response.data;
		},
	});
};

export const useEmployeeDailyJob = (id?: string) => {
	return useQuery({
		queryKey: ["employee-daily-job", id],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<IDailyJob>>(`/employee/schedule/daily-job/${id}`);
			return data.data;
		},
		enabled: Boolean(id),
	});
};

export const useUpdateJobEmployeeAssignment = (jobId: string | undefined) => {
	return useMutation({
		mutationKey: ["employee-daily-job-change", jobId],
		mutationFn: async (update: IJobEmployeeAssignment) => {
			const response = await apiClient.put<IApiSuccessResponse<IJobEmployeeAssignment>>(
				`/employee/schedule/daily-job/employee/${jobId}`,
				{
					update,
				}
			);
			return response.data;
		},
	});
};

export const useUpdateDailyJobRecord = (id: string | undefined) => {
	return useMutation({
		mutationKey: ["employee"],
		mutationFn: async (update: IDailyJob) => {
			const response = await apiClient.put<IApiSuccessResponse<IDailyJob>>(`/employee/schedule/daily-job/${id}`, {
				update,
			});
			return response.data;
		},
	});
};

export const useUpdateDayTime = () => {
	return useMutation({
		mutationKey: ["employee"],
		mutationFn: async (update: IDayTime) => {
			const response = await apiClient.post<IApiSuccessResponse<IDayTime>>(`/employee/daytime/end`, {
				update,
			});
			return response.data;
		},
	});
};

export const useStartDayTime = () => {
	return useMutation({
		mutationKey: ["daytime-start"],
		mutationFn: async (update: IDayTime) => {
			const response = await apiClient.post<IApiSuccessResponse<IDayTime>>(`/employee/daytime/start`, {
				update,
			});
			return response.data;
		},
	});
};

export const useCreateJobDailyNote = () => {
	return useMutation({
		mutationKey: ["jobDailyNote"],
		mutationFn: async (payload: ICreateJobDailyNotePayload) => {
			const response = await apiClient.post("/employee/schedule/daily-job/note", { payload });
			return response.data;
		},
	});
};

export const useUpdateMarkJobAsNotReady = () => {
	return useMutation({
		mutationFn: async (payload: IMarkJobAsNotReadyPayload) => {
			const { data } = await apiClient.post("/employee/schedule/daily-job/not-ready", payload);
			return data.data;
		},
	});
};

export const useUpdateJobEmployeeDayTime = () => {
	return useMutation({
		mutationKey: ["employee"],
		mutationFn: async (update: IJobEmployeeDayTime) => {
			const response = await apiClient.post(`/employee/dailyjob/job-employee-assignment`, {
				update,
			});
			return response.data;
		},
	});
};

export const useScheduleConfiguration = () => {
	return useQuery({
		queryKey: ["schedule-configuration"],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<IScheduleConfiguration>>("/employee/schedule/configuration");
			return data.data;
		},
	});
};

export const useScheduleWeekend = (startDate: Date | string, isEmployee: boolean | undefined) => {
	return useQuery({
		queryKey: ["schedule-weekend", startDate],
		enabled: !!isEmployee,
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<IScheduleWeekend>>("/employee/schedule/weekend", {
				params: { startDate },
			});
			return data.data;
		},
	});
};

export const useEmployeeVehicleWithGPS = (startDate: string) => {
	return useQuery({
		queryKey: ["vehicle-gps", startDate],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<IVehicleGPS>>("/employee/schedule/vehicle-gps", {
				params: { startDate },
			});
			return data.data;
		},
	});
};

export const useUpdatePauseTime = () => {
	return useMutation({
		mutationKey: ["employee-pause"],
		mutationFn: async (payload: IPauseTime) => {
			const response = await apiClient.post<IApiSuccessResponse<IPauseTime>>(`/employee/daytime/pause-time`, {
				payload,
			});
			return response.data;
		},
	});
};

export const usePauseTime = (startDate: string) => {
	return useQuery({
		queryKey: ["employee-pause", startDate],
		queryFn: async () => {
			const response = await apiClient.get(`/employee/daytime/pause-time`, {
				params: { startDate },
			});
			return response.data.data;
		},
	});
};

export const useUpdateEmployeePauseTimes = () => {
	return useMutation({
		mutationKey: ["employee-pause"],
		mutationFn: async (payload: IPauseTime[]) => {
			const response = await apiClient.put<IApiSuccessResponse<IPauseTime[]>>(`/employee/daytime/pause-time`, {
				payload,
			});
			return response.data;
		},
	});
};

export const useEmployeeTodayRoster = (filters: { date?: Date | string }) => {
	return useQuery({
		queryKey: ["employee-today-roster", filters],
		enabled: !!filters.date,
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<IRoster>>("/employee/schedule/my/roster/day", {
				params: filters,
			});
			return data.data;
		},
	});
};

export const useDeletePauseTime = () => {
	return useMutation({
		mutationKey: ["employee-pause"],
		mutationFn: async (pauseTimeId: string) => {
			const response = await apiClient.delete<IApiSuccessResponse<IPauseTime>>(
				`/employee/daytime/pause-time/${pauseTimeId}`
			);
			return response.data;
		},
	});
};

export const useUpdateJobEmployeeDidNotWorked = () => {
	return useMutation({
		mutationKey: ["employee"],
		mutationFn: async (assignmentId: string) => {
			const response = await apiClient.post(`/employee/dailyjob/job-employee-assignment/${assignmentId}`);
			return response.data;
		},
	});
};

export const useEmployeeHolidays = (filters: IGetEmployeeScheduleFilter) => {
	return useQuery({
		queryKey: ["employee-holidays", filters],
		queryFn: async () => {
			const { data } = await apiClient.get("/employee/dailyjob/holidays", {
				params: filters,
			});
			return data.data;
		},
	});
};

export const useRescheduleJob = () => {
	return useMutation({
		mutationFn: async (payload: IRescheduleJobPayload) => {
			const { data } = await apiClient.post("/employee/dailyjob/reschedule", payload);
			return data.data;
		},
	});
};

export const useScheduleWeekendReminder = () => {
	return useMutation({
		mutationFn: async ({
			payload,
		}: {
			payload: { startDate: Date; isSaturday: boolean | undefined; isSunday: boolean | undefined };
		}) => {
			const { data } = await apiClient.post("/employee/schedule/weekend-reminder", {
				params: { payload },
			});
			return data.data;
		},
	});
};

export const useEmployeeLockStatus = () => {
	return useQuery({
		queryKey: ["employee-schedule-lock-status"],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<IEmployeeLockStatus>>("/employee/schedule/lock-status");
			return data.data;
		},
	});
};

export const useEmployeeDayEndTime = (startDate: string) => {
	return useQuery({
		queryKey: ["employee-dayend-time", startDate],
		queryFn: async () => {
			const response = await apiClient.get(`/employee/daytime/dayend-time`, {
				params: { startDate },
			});
			return response.data.data;
		},
	});
};

export const useUpdateGPSEmployeePause = () => {
	return useMutation({
		mutationKey: ["gps-employee-pause"],
		mutationFn: async (update: IDayTime) => {
			const response = await apiClient.post<IApiSuccessResponse<IDayTime>>(`/employee/daytime/add-pauses`, {
				update,
			});
			return response.data;
		},
	});
};

export const useDailyJobAllEmployees = () => {
	return useQuery({
		queryKey: ["dailyjob-all-employees"],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<IScheduleEmployee[]>>("/employee/dailyjob/employees");
			return data.data;
		},
		refetchOnWindowFocus: false,
	});
};

export const useEmployeePendingLateness = (startDate: string) => {
	return useQuery({
		queryKey: ["employee-pending-lateness", startDate],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<IEmployeePendingLateness>>(
				"/employee/lateness/previous-working-day/pending",
				{
					params: {
						date: startDate,
					},
				}
			);

			return data.data;
		},
		enabled: !!startDate,
	});
};

export const useEmployeeDayVarianceStatus = (startDate: string) => {
	return useQuery({
		queryKey: ["employee-day-variance-status", startDate],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<IEmployeeDayVarianceStatus>>(
				"/employee/lateness/day-variance",
				{
					params: {
						date: startDate,
					},
				}
			);

			return data.data;
		},
		enabled: !!startDate,
	});
};
