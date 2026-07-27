import { IUser } from "../../weekly-schedule-management/types/schedule-interface";

export type IPayRollLog = {
	id: string;
	userId: string;
	createdAt: string;
};

export type IPayRollWeek = {
	id: string;
	weekStartDate: string;
	weekEndDate: string;
};

export type IPayRollChange = {
	id: string;
	changedAt: string;
	changedUserId: string;
	type: string;
	description: string;
	isAcknowledged: boolean;
	acknowledgedAt?: string;
	acknowledgedBy?: string;
	data?: string;
	payRollWeekId: string;
	isDeleted: boolean;
};

export type ICreatePayRollLog = Pick<IPayRollWeek, "weekStartDate" | "weekEndDate"> & {
	date: string;
};

export type IGetPayRollLogResponse = (IPayRollLog & {
	user?: IUser;
	payRollWeek?: IPayRollWeek;
})[];

export type IGetPayRollLogsFilter = {
	weekStartDate?: string;
	weekEndDate?: string;
	payrollWeekId?: string;
};

export type IGetPayRollWeekFilter = {
	startDate: string;
	endDate: string;
};

export type IGetPayRollWeeksResponse = (IPayRollWeek & {
	payrollLogs?: IPayRollLog[];
	payRollChanges?: (IPayRollChange & {
		changedByUser?: IUser;
		acknowledgedUser?: IUser;
		payRollWeek: IPayRollWeek;
		affectedUser: IUser;
	})[];
})[];

export type IGetPayRollChangesFilter = {
	payrollWeekId?: string;
	isAcknowledged?: boolean;
};

export type IGetPayRollChangesResponse = (IPayRollChange & {
	changedByUser?: IUser;
	acknowledgedUser?: IUser;
	payRollWeek: IPayRollWeek;
})[];

export type IAcknowledgePayRollChange = {
	isAcknowledged: boolean;
	acknowledgedAt: string;
	changeId: string;
};
