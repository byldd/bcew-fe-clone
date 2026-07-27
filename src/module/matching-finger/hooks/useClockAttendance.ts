import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { IClockAttendanceResponse, IClockPayload } from "@/module/matching-finger/types";

export const useClockAttendance = () => {
	return useMutation({
		mutationKey: ["clockAttendance"],
		mutationFn: async (payload: IClockPayload) => {
			const { data } = await apiClient.post<IClockAttendanceResponse>("/finger/clock", payload);
			return data;
		},
	});
};
