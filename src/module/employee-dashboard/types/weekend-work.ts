import {
	E_WEEKEND_WORK_USER_STATUS,
	IUserWeekendWork,
	IWeekendWork,
} from "@/module/schedule-management/schedule-configuration/types/schedule-config";

export type IGetUserWeekendWorkResponse = (IWeekendWork & {
	isCapacityReached?: boolean;
	userWeekendWork?: IUserWeekendWork;
})[];

export type ICreateUserWeekendWorkFilters = {
	date: string;
	startDate: string;
	endDate: string;
};

export type IUpdateUserWeekendWorkPayload = {
	id: string;
	note?: string;
	userStatus: E_WEEKEND_WORK_USER_STATUS;
};
