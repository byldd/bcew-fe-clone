import { IAttendanceRecord } from "../../attendance-records/utils/types";

export type IGetTimeVarianceFilters = {
	startDate: string;
	endDate: string;
};

//  This is type for view table vw_UserScheduleVsActualMismatch
export type ITimeVarianceResult = {
	empNum: string;
	empName: string;
	date: Date;
	schStartTime: string;
	schEndTime: string;
	schHours: number;
	actHours: number;
	actStartTime: string | null;
	actEndTime: string | null;
	pauseTime: string | null;
	attendanceRecords: IAttendanceRecord[];
};

export type ITimeVarianceResponse = {
	userName: string;
	timeVariance: ITimeVarianceResult[];
};
