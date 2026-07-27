import { IPaginatedQuery } from "@/types";
import { TimeSource } from "@/module/schedule-management/roster-time-configuration/enums";
import { IEmployeeDayTime } from "../../weekly-schedule-management/types/schedule-interface";
import { ITeam } from "@/module/team/types";
import { IRole } from "@/module/employee/types";

export interface IPaginatedEmployeeRosterSearchQuery extends IPaginatedQuery {
	startDate: string;
	endDate: string;
	activeTeam?: string;
	userId?: string;
	employeeId?: string;
}

export type IRoster = {
	id: string;
	userId: string;
	teamId: string | null;
	roleId: string | null;
	date: string;
	dayStartTime: string;
	dayEndTime: string;
	extendedApprovedStartTime: string | null;
	extendedApprovedEndTime: string | null;
	timeSource: string;
	isTimeOverridden: boolean;
	createdAt: string;
	updatedAt: string;
	isOnLeave: boolean;
	employeeDayTime: IEmployeeDayTime;
};

export type ITeamTiming = Pick<ITeam, "id" | "name" | "dayStartTime" | "dayEndTime">;
export type IRoleTiming = Pick<IRole, "id" | "name" | "dayStartTime" | "dayEndTime">;

export type IUserRoster = {
	id: string;
	name: string;
	role: IRoleTiming;
	isSaturdayWorking: boolean;
	isSundayWorking: boolean;
	team: ITeamTiming;
	roster: IRoster[];
	isSynced: boolean;
};

export type IUserRosterForWeekResponse = {
	items: IUserRoster[];
	total: number;
};

export interface IUpdateRosterTimePayload {
	timeSource: TimeSource;
	dayStartTime?: string;
	dayEndTime?: string;
	isAppliedForWholeWeek?: boolean;
	isTimeOverridden?: boolean;
}

export interface ITimeSourceSelectorProps {
	roster: IRoster;
	employeeName: string;
	employeeDayTime: IEmployeeDayTime;
	rosterDayTime: {
		dayStartTime: string;
		dayEndTime: string;
	};
	timeRange?: string;
	loggedTimeRange?: string;
	overrideTimeRange?: string;
	approvedExtendedTimeRange?: string;
}
