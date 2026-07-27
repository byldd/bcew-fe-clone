import { WEEK_DAY_NUMBERS } from "@/utils/enums";
import { E_WEEKEND_WORKING_MODE, ISpecialJob } from "../../weekly-schedule-management/types/schedule-configuration";
import { IUser } from "../../weekly-schedule-management/types/schedule-interface";
import { IApiResponse } from "@/types";

export const E_SCHEDULE_CONFIG_WEEKEND_DAY = {
	SATURDAY: WEEK_DAY_NUMBERS.SATURDAY,
	SUNDAY: WEEK_DAY_NUMBERS.SUNDAY,
} as const;

export type IScheduleConfigWeekendDay =
	(typeof E_SCHEDULE_CONFIG_WEEKEND_DAY)[keyof typeof E_SCHEDULE_CONFIG_WEEKEND_DAY];

export type IUpdateWeekendConfigPayload = {
	userIds: string[];
	crewIds?: string[];
	teamIds?: string[];
	mode: E_WEEKEND_WORKING_MODE;
	note?: string;
	requiredMemberCount?: number;
	date: string;
};

export enum E_USER_WEEKEND_WORK_STATUS {
	NOT_WORKING = "NOT_WORKING",
	UNDETERMINED = "UNDETERMINED",

	USER_ACCEPTED = "USER_ACCEPTED",
	USER_DECLINED = "USER_DECLINED",

	ADMIN_APPROVED = "ADMIN_APPROVED",
	ADMIN_DECLINED = "ADMIN_DECLINED",
}

export enum E_WEEKEND_WORK_ADMIN_STATUS {
	REQUEST_SENT = "REQUEST_SENT",
	APPROVED = "APPROVED",
	DECLINED = "DECLINED",
}

export enum E_WEEKEND_WORK_USER_STATUS {
	APPROVED = "APPROVED",
	OPT_OUT = "OPT_OUT",
	DECLINED = "DECLINED",
}

export type IGetWeekendConfigFilter = {
	startDate: string;
	endDate: string;
};

export enum E_WEEKEND_SCHEDULE_BY_MODE {
	ADMIN = "ADMIN",
	SELF = "SELF",
}

export type IWeekendWork = {
	mode?: E_WEEKEND_WORKING_MODE;

	id: string;
	date: string;
	createdByUserId: string;
	createdBy: IUser;
	createdAt: string;
	updatedAt: string;
	note?: string;
	scheduleByMode: E_WEEKEND_SCHEDULE_BY_MODE;
	requiredMemberCount?: number;
};

export type IUserWeekendWork = {
	id: string;
	userId: string;
	weekendWorkId: string;
	createdAt: string;
	updatedAt: string;
	status: E_USER_WEEKEND_WORK_STATUS;
	note?: string;
	userStatus?: E_WEEKEND_WORK_USER_STATUS;
	adminStatus: E_WEEKEND_WORK_ADMIN_STATUS;
	mode?: E_WEEKEND_WORKING_MODE;
};

export type IGetWeekendWorksFilter = {
	startDate: string;
	endDate: string;
};

export type IGetWeekendWorksResponse = IApiResponse<
	(IWeekendWork & { createdBy: IUser; userWeekendWorks?: (IUserWeekendWork & { user?: IUser })[] })[]
>;

export type IUpdateSpecialJobsPayload = {
	specialJobs: (Omit<ISpecialJob, "id"> & {
		id?: string;
		zones?: { geoTabId: string; name: string; address: string }[];
	})[];
};

export type IUpdateUserWeekendWorkPayload = {
	userWeekendWorkId: string;
	adminStatus: E_WEEKEND_WORK_ADMIN_STATUS;
};
