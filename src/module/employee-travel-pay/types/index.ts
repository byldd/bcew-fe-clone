import {
	ITraevlPayRequestStatus,
	ITravelPayRequest,
	ITravelPayRequestNote,
} from "@/module/schedule-management/travel-pay/types";
import { IUser } from "@/module/schedule-management/weekly-schedule-management/types/schedule-interface";

export type IEmployeeTravelPayRequestsResponse = (ITravelPayRequest & {
	traevlPayRequestStatuses: (ITraevlPayRequestStatus & { addedByUser?: IUser })[];
	notes: ITravelPayRequestNote[];
})[];

export type IGetEmployeeTravelPayFilter = {
	startDate: string;
	endDate: string;
};

export enum TRAVEL_PAY_VALIDATION_TYPE {
	ALL_STOPS_TIME_LOGGED = "ALL_STOPS_TIME_LOGGED",
	DISTANCE = "DISTANCE",
	LATE = "LATE",
	ROLE_ELIGIBILITY = "ROLE_ELIGIBILITY",
	FOREMAN_ELIGIBILITY = "FOREMAN_ELIGIBILITY",
	OTHER = "OTHER",
}

export type IEmployeeTravelPayEligibilityResponse = {
	validation: Record<TRAVEL_PAY_VALIDATION_TYPE, { message?: string; isValid: boolean }>;
	requestData: {
		firstStopDistance: number;
		lastStopDistance: number;
		firstStop: string;
		lastStop: string;
	} | null;
};

export type IEmployeeTravelPayPayload = {
	date: string;
	note?: string;
};
