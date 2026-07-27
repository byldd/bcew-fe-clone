import { IEmployeeTravelPayEligibilityResponse } from "@/module/employee-travel-pay/types";
import { IUser } from "@/module/schedule-management/weekly-schedule-management/types/schedule-interface";

export enum TRAVEL_PAY_REQUEST_STATUS {
	APPROVED = "APPROVED",
	REJECTED = "REJECTED",
	PENDING = "PENDING",
}

export enum TRAVEL_PAY_REQUEST_FILTER_STATUS {
	ALL = "ALL",
	APPROVED = TRAVEL_PAY_REQUEST_STATUS.APPROVED,
	REJECTED = TRAVEL_PAY_REQUEST_STATUS.REJECTED,
}

export enum TRAVEL_PAY_REQUEST_SORT {
	NAME_ASC = "name_asc",
	NAME_DESC = "name_desc",
}

export interface ITravelPayRequest {
	id: string;
	date: string;
	firstStopDistance: number;
	lastStopDistance: number;
	firstStop: string;
	lastStop: string;
	createdAt: string;
	updatedAt: string;
}

export interface ITraevlPayRequestStatus {
	id: string;
	status: string;
	travelPayRequestId: string;
	addedByUserId?: string;
	note?: string;
	createdAt: string;
	updatedAt: string;
}

export interface ITravelPayRequestNote {
	id: string;
	note: string;
	createdAt: string;
}

export interface IGetTravelPayRequestsFilters {
	startDate: string;
	endDate: string;
	status?: TRAVEL_PAY_REQUEST_STATUS | null;
}

export type ITravelPayRequestsResponse = (ITravelPayRequest & { user: IUser } & {
	traevlPayRequestStatuses: (ITraevlPayRequestStatus & { addedByUser?: IUser })[];
	notes: ITravelPayRequestNote[];
})[];

export type ITravelPayRequestResponse = ITravelPayRequestsResponse[number] & {
	ineligibility?: IEmployeeTravelPayEligibilityResponse["validation"];
};
