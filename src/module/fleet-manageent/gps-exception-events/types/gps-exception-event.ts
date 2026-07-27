import { IEmployee } from "@/module/employee/types";
import { IUser } from "@/module/schedule-management/weekly-schedule-management/types/schedule-interface";
import { IApiResponse } from "@/types";
import { IGeoTabDevice } from "./geo-tab";

export enum GPS_EXCEPTION_EVENT_RULE {
	IDLE_TIME = "RuleIdlingId",
	AFTER_HOURS_USAGE = "RuleAfterHoursUsageId",
	REGAIN_POWER = "REGAIN_POWER",
}

export type IGPSExceptionEvent = {
	id: bigint;
	GeotabId: string;
	ActiveFrom?: Date;
	ActiveTo?: Date;
	DeviceId?: string;
	Distance?: number;
	DriverId?: string;
	DurationTicks?: bigint;
	LastModifiedDateTime: Date;
	RuleId?: GPS_EXCEPTION_EVENT_RULE;
	State: number;
	Version?: bigint;
	RecordLastChangedUtc: Date;
};

export type IGetGpsExceptionEvents = {
	startDate: string;
	endDate: string;
	ruleId: string;
};

export type IGpsAfterHourUsageNote = {
	id: string;
	userId: string;
	note: string;
	createdAt: string;
	updatedAt: string;
	date: string;
};

export type IGetGpsExceptionEventsResponse = IApiResponse<
	(IGPSExceptionEvent & {
		employee?: IEmployee & {
			user?: IUser;
		};
		gpsAfterHourUsageNote: IGpsAfterHourUsageNote;
		device: IGeoTabDevice;
	})[]
>;

export type IGpsExceptionEventByUser = {
	userName: string;
	events: IGetGpsExceptionEventsResponse["data"];
};
