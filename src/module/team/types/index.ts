import { IRole } from "@/module/employee/types";
import { IEmployee, IUser } from "@/module/schedule-management/weekly-schedule-management/types/schedule-interface";

export type ITeam = {
	id: string;
	name: string;
	dayStartTime: string;
	dayEndTime: string;
	isPauseAllowed: boolean;
	createdAt: string;
	updatedAt: string;
	totalMembers?: number;
};

export type ITeamPayload = Pick<ITeam, "name" | "dayStartTime" | "dayEndTime" | "isPauseAllowed">;

export type ICreateTeamPayload = ITeamPayload;

export type IUpdateTeamPayload = ITeamPayload;

export type ITeamUser = Pick<IUser, "id" | "name"> & {
	bcewUserId: string;
	joiningDate: string | null;

	employee: Pick<IEmployee, "id" | "bcewEmployeeNumber"> | null;

	role: Pick<IRole, "id" | "name"> | null;
};

export type ITeamDetails = ITeam & {
	users: ITeamUser[];
};

export type ITeamsResponse = ITeam[];

export type ITeamDetailsResponse = ITeamDetails;

export type ITeamUserOption = Pick<IUser, "id" | "name"> & {
	teamId: string | null;

	role: Pick<IRole, "id" | "name"> | null;

	team: Pick<ITeam, "id" | "name"> | null;

	employee: Pick<IEmployee, "id" | "bcewEmployeeNumber"> | null;
};

export type IUpdateTeamMembersPayload = {
	userIds: string[];
};
