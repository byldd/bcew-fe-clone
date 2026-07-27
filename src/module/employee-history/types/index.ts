import { extendedTimeType } from "@/module/job/utils/enums";
import { TimeSource } from "@/module/schedule-management/roster-time-configuration/enums";
import { TRAVEL_PAY_REQUEST_STATUS } from "@/module/schedule-management/travel-pay/types";
import { ISpecialJob } from "@/module/schedule-management/weekly-schedule-management/types/schedule-configuration";
import { IEmployeePauseTime } from "@/module/schedule-management/weekly-schedule-management/types/schedule-interface";

export enum HISTORY_RECORD_STATUS {
	APPROVED = "APPROVED",
	REJECTED = "REJECTED",
	PENDING = "PENDING",
}

export const isApprovedToStatus = (isApproved: boolean | null): HISTORY_RECORD_STATUS => {
	if (isApproved === true) return HISTORY_RECORD_STATUS.APPROVED;
	if (isApproved === false) return HISTORY_RECORD_STATUS.REJECTED;
	return HISTORY_RECORD_STATUS.PENDING;
};

// Single extended request time entry (inside extendedRequestTimes[])
export interface IHistoryEtrRecord {
	id: string;
	requestId: string;
	extendedType: extendedTimeType;
	extendedReason: string;
	startTime: string;
	endTime: string;
	isApproved: boolean | null;
	note?: string | null;
	adminNote?: string | null;
	jobStartTime?: string | null;
	jobEndTime?: string | null;
	createdAt: string;
}

// Wrapper returned by API — contains multiple request times
export interface IHistoryEtrWrapper {
	id: string;
	date: string;
	extendedRequestTimes: IHistoryEtrRecord[];
}

export interface IHistoryTravelPayRecord {
	id: string;
	traevlPayRequestStatuses: { status: TRAVEL_PAY_REQUEST_STATUS }[];
	firstStop: string;
	lastStop: string;
	firstStopDistance: number;
	lastStopDistance: number;
	note?: string | null;
	submittedAt: string;
}

export interface IHistoryNewJobRecord {
	id: string;
	actrec?: number | string | null;
	project?: string | null;
	startTime: string;
	endTime: string;
	isApproved: boolean | null;
	adminNote?: string | null;
	note?: string | null;
}
export interface IHistoryStopTime {
	id: string;
	startTime: string | null;
	endTime: string | null;
	hours: number | null;
	stopNumber: number | null;
	overrideStartTime?: string | null;
	overrideEndTime?: string | null;
	JobDailyRecord: {
		actrec: {
			jobnme: string;
			shtnme: string;
		};
		specialJob: Pick<ISpecialJob, "name">;
	};
}

export interface IHistoryDayTimeLog {
	id: string;
	dayStartTime: string | null;
	dayEndTime: string | null;
	overrideStartTime?: string | null;
	overrideEndTime?: string | null;
	employeePauseTime: Pick<IEmployeePauseTime, "pauseStartTime" | "pauseEndTime">[];
}
export interface IHistoryScheduleHours {
	id: string;
	dayStartTime: string;
	dayEndTime: string;
	extendedApprovedStartTime: string | null;
	extendedApprovedEndTime: string | null;
	timeSource: TimeSource;
	date: string;

	isSaturdayWorking: boolean;
	isSundayWorking: boolean;
	isOnLeave: boolean;
}

export interface IEmployeeHistoryDay {
	data: {
		travelPayRequests: IHistoryTravelPayRecord[];
		newJobRequests: IHistoryNewJobRecord[];
		extendedRequests: IHistoryEtrWrapper[];
		stopTimes: IHistoryStopTime[];
		daytimeLog: IHistoryDayTimeLog | null;
		scheduleHours: IHistoryScheduleHours | null;
	};
	date: string;
	totalAmount: number;
	loggedHours?: number;
	loggedStops?: number;
	dayStartTime?: string;
	dayEndTime?: string;
	jobNames?: string[];
}

export interface IGetEmployeeHistoryFilter {
	startDate: string;
	endDate: string;
}

export interface IEmployeeHistorySummary {
	totalHours: number;
	totalAmount: number;
}
