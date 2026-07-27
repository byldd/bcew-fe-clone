import { extendedTimeType } from "@/module/job/utils/enums";
import { IRoster } from "../../roster-time-configuration/types";
import { MIDDAY_STOP_REQUEST_TYPE } from "@/module/midday-stops/utils/enums";
import { QC_JOB_TYPE } from "../../weekly-schedule-management/types/schedule-interface";

export interface IMiddayStopRequest {
	id: string;
	startTime: string;
	endTime: string;
	project: string | null;
	requestType: MIDDAY_STOP_REQUEST_TYPE;
	isApproved: boolean | null;
	actrec: number | undefined;
	date: string;
	note?: string | null;
	employee: {
		id?: string;
		user: {
			name: string;
			rosterTimes: IRoster[];
		} | null;
	} | null;
	stopNumber: number | null;
	adminNote?: string;
	specialJobId?: string;
	bcewSchlinExtendedId?: number;
	bcewSchlinIdnum?: string;
	bcewSrvinvIdnum?: string;
	qcType?: QC_JOB_TYPE;
	rosterTime?: IRoster;
}

export interface IExtendedTimeRequestRow {
	id: string;
	employeeName?: string;
	rosterStart: Date | string | undefined;
	rosterEnd: Date | string | undefined;
	requestType: extendedTimeType;
	requestStart: string | undefined;
	requestEnd: string | undefined;
	reason: string;
	isApproved?: boolean;
	note?: string;
	stopName?: string;
	date: string;
	userId: string;
	extendedType: extendedTimeType;
	jobStartTime: string | undefined;
	jobEndTime: string | undefined;
	extendedReason: string | undefined;
	extendedRosterStartTime: string | null | undefined;
	extendedRosterEndTime: string | null | undefined;
}

export interface IFingerprintApproval {
	id: string;
	employeeId: string;
	employee: {
		id: string;
		user: {
			name: string;
		} | null;
	} | null;
	date: string;
	startTime: string;
	endTime: string;
	note?: string | null;
	lateReason?: string | null;
	earlyReason?: string | null;
	status: string;
	assignmentId: string;
}

export type IFingerprintApprovalStatus = Pick<
	IFingerprintApproval,
	"id" | "status" | "date" | "startTime" | "endTime" | "note" | "lateReason" | "earlyReason"
>;

export type IFingerprintActionRequestPayload = Pick<
	IFingerprintApproval,
	"date" | "startTime" | "endTime" | "note" | "lateReason" | "earlyReason"
>;

export interface ITimeRequestFilterProps {
	defaultEmployeeName?: string;
	defaultRequestStatus?: string;
	defaultRequestType?: string;
	onApply: (filters: { employeeName?: string; requestStatus?: string; requestType?: string }) => void;
	onClose: () => void;
}

export interface ITimeRequestFilterTriggerProps {
	requestStatus?: string;
	requestType?: string;
	onApply: (filters: { employeeName?: string; requestStatus?: string; requestType?: string }) => void;
}

export interface ITimeRequestParamsFilters {
	startDate?: Date | string;
	endDate?: Date | string;
	search?: string;
}

export interface ITimeRequestFilters {
	search: string;
	requestType?: string;
	requestStatus?: string;
	employeeName?: string;
}
