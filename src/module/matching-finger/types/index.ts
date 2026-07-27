import { IPauseTime } from "@/module/job/types";

export interface IClockPayload {
	template: string;
	time: string;
}

export enum CLOCK_TYPE {
	IN = "IN",
	OUT = "OUT",
}

export interface IFingerprintLogEntry {
	id: string;
	scanTime: string;
	scanType: CLOCK_TYPE;
}

export interface IAllocationData {
	employeeId: string;
	date: string;
}

export interface ClockResult {
	name: string;
	type: CLOCK_TYPE;
	timestamp: string;
	allocation: IAllocationData | null;
}
export interface IClockAttendanceResponse {
	success: boolean;
	message?: string;
	data: ClockResult;
}

export interface IAllocateStopPayload {
	assignmentId: string;
	startTime?: string;
	endTime?: string;
	didNotWorked?: boolean;
}

export interface IAllocateTimePayload {
	employeeId: string;
	date: string;
	stops: IAllocateStopPayload[];
	pauseTimes?: Pick<IPauseTime, "pauseStartTime" | "pauseEndTime">[];
	pauseReason?: string;
}

export interface IAllocateTimeResponse {
	success: boolean;
	message?: string;
	data: {
		dayStartTime: string | null;
		dayEndTime: string | null;
		resolvedStopCount: number;
		totalStopCount: number;
	};
}
