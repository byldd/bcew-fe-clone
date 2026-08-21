import { IAttendanceRecord } from "@/module/schedule-management/attendance-records/utils/types";
import { ITimeVarianceResult } from "@/module/schedule-management/time-variance/utils/types";
import { IEmployeeExtendedTime } from "@/module/job/types";
import { IMiddayStopRequest } from "@/module/schedule-management/time-requests/utils/types";
import { ITravelPayRequestsResponse } from "@/module/schedule-management/travel-pay/types";
import { ITimeLogResponse } from "@/module/schedule-management/time-logs-management/types";

export interface IWeekReportEntry {
	userName: string;
	employeeNum: string;
	firstName: string | null;
	lastName: string | null;
	middleInitial: string | null;
	timeLogs: ITimeLogResponse[];
	attendances: IAttendanceRecord[];
	timeVariances: ITimeVarianceResult[];
	extendedTimes: IEmployeeExtendedTime[];
	newJobRequests: IMiddayStopRequest[];
	travelPayRequests: ITravelPayRequestsResponse;
}

export type IGetWeekReportFilters = {
	startDate: string;
	endDate: string;
};
