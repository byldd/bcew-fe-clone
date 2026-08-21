import { IPage, IRolePagePermission } from "@/module/admin/types/sideb-bar-page";
import { ACCESS_LEVEL, COVERAGE_REASON, TRANSFER_ITEM_CATEGORY } from "@/module/employee/enums";
import { IMapZoneTab, IRoleMapZoneTabPermission } from "@/module/project-management/mapv2/types/zone";

import { TimeSource } from "@/module/schedule-management/roster-time-configuration/enums";
import {
	IUpdateJobAssignmentTimePayload,
	IUpdatedJobAssignmentResponse,
} from "@/module/schedule-management/time-logs-management/types";
import {
	IEmployeeDayTime,
	IEmployeePauseTime,
	IUser,
} from "@/module/schedule-management/weekly-schedule-management/types/schedule-interface";
import { IPaginatedApiResponse } from "@/types";
import { MODULE } from "@/utils/enums";
import { Dispatch, SetStateAction } from "react";

export type IEmployee = {
	id: string;
	memberName: string;
	assignedVehicle: string | undefined;
	department: string;
	joiningDate: string;
	training: string;
	employeeNumber: string;
	ptoRequests: {
		trans_dte: string;
		approved: number | null;
	}[];
	expectedOutput: string;
	portalUser: string;
	role: string;
	isPermissionOverridden: boolean;
};

export type IEmployeesResponse = {
	items: IEmployee[];
	total: number;
	page: number;
	pageSize: number;
};

export type IEmployeeDetailsResponse = {
	id: string;
	employee: {
		id: string;
		bcewEmployeeNumber: number;
		userId: string;
		user: {
			id: string;
			roleId: string;
			role: {
				id: string;
				name: string;
			};
			teamId: string;
			team: {
				id: string;
				name: string;
			};
			timeSource: TimeSource;
			employeeReleaseNotePermission: string;
			phases: string;
		};
	};
	employeeId: string;
	fullName: string;
	emailID: string;
	phone: string;
	jobRole?: string;
	department: string;
	crew: {
		id: string;
		name: string;
		crewLeader: {
			id: string;
			employeeName: string;
			bcewEmployeeNumber: number;
		};
	} | null;

	joiningDate: string | null;
};

export type IPaginatedEmployeeSearchQuery = {
	page?: number;
	pageSize?: number;
	searchValue?: string;
	department?: string;
	jobRole?: string;
	startDate?: string;
	endDate?: string;
	status?: EMPYEE_STATUS_FILTER;
};

export type IPermissions = {
	id: string;
	moduleId: string;
	module: MODULE;
	accessLevel: ACCESS_LEVEL;
};

export type IUserPagePermission = Pick<IRolePagePermission, "accessLevel" | "pageId" | "id"> & {
	userId: string;
};

export type IEmployeePermissionsResponse = {
	success: boolean;
	message: string;
	items: {
		user: IUser & {
			id: string;
			bcewUserId: string;
			roleId: string;
			role: string;
			isPermissionOverridden: boolean;
			isWeekendSelfSchedulingAllowed: boolean;
			isSelfSchedulingAllowed: boolean;
			isFingerprintEnabled: boolean;
			isMaterialRequestAllowed: boolean;
			isCrateHandlerAllowed: boolean;
			materialRole: string | null;
			isQcEnabled: boolean;
			isAsanaEnabled: boolean;
			isPastDateScheduleUpdateAllowed: boolean;
		};
		permissions: IPermissions[];
		userPagePermissions: (IUserPagePermission & { page: IPage })[];
	};
};

export type PTORequestCellProps = {
	dates: string[];
};

export type IRole = {
	id: string;
	name: string;
	createdDate: string;
	updatedDate: string;
	dayStartTime: string;
	dayEndTime: string;
	canSendNotification: boolean;
	trackTimeByGPS: boolean;
	canSendTravelPayRequest: boolean;
	requiresScheduleValidation: boolean;
	createdBy?: string;
	createdByRole?: string;
	isSpecialCardTimeLoggingExempt: boolean;
	isFingerprintEnabled: boolean;
};

export type IRoleWithPermissions = {
	role: IRole;
	permissions: IPermissions[];
	rolePagePermissions: (IRolePagePermission & { page: IPage })[];
	roleMapZoneTabPermissions: (IRoleMapZoneTabPermission & { mapZoneTab: Pick<IMapZoneTab, "id" | "name"> })[];
	users?: IUser[];
};

export type IRolesWithPermissionsResponse = {
	items: IRoleWithPermissions[];
};

export type IRoleWithPermissionsResponse = {
	items: IRoleWithPermissions;
};

export type IModule = {
	id: string;
	name: string;
};

export type IModulesResponse = {
	items: IModule[];
};

export type IJobDailyRecord = {
	id: string;
	bcewSchlinIdNum: string;
	crewLeaderId: string;
	date: string;
	estimateHours: string;
	note: string | null;
	isPublished: boolean;
};

export type IDailyJobAssignments = {
	id: string;
	hours: string;
	startTime: string;
	endTime: string;
	stopNumber: number;
	overTimeReason: string;
	overTimeHours: number;
	overTimeMinutes: number;
	isOverTimeApproved: boolean | null;
	jobDailyRecordId: string;
	employeeId: string;
	JobDailyRecord: IJobDailyRecord;
	taskName: string;
	jobName: string;
	gpsStart?: string;
	gpsEnd?: string;
};

export type ITrucks = {
	id: string;
	employeeId: string;
	truckNumber: string;
	assignedTime: string;
	notes: string | null;
};

export type IUserActivity = {
	date: string;
	dailyJobAssignments: IDailyJobAssignments[];
	startTime: string | null;
	endTime: string | null;
	overrideStartTime: string | null;
	overrideEndTime: string | null;
	trucks: ITrucks[];
	distanceTraveled: number | null;
	employeePauseTime?: IEmployeePauseTime[];
	note: string;
	overrideReason: string;
	pauseReason: string;
};

export type IUserActivityResponse = {
	items: IUserActivity[];
};

export interface IUpdateJobAssignmentTimePayloadEmployee extends Pick<
	IUpdateJobAssignmentTimePayload,
	"startTime" | "endTime"
> {
	employeeId: string;
}

export type IUpdatedJobAssignmentResponseEmployee = Pick<IUpdatedJobAssignmentResponse, "id" | "startTime" | "endTime">;

export interface IGetUsersFilters extends IPaginatedEmployeeSearchQuery {
	crewId?: string;
}

export interface UpdateUserConfigPayload {
	roleId?: string;
	teamId?: string;
	timeSource?: string;
	phases?: string[];
}

export interface IWeekRoster {
	id: string;
	date: Date;
	dayStartTime: string;
	dayEndTime: string;
	timeSource: string;
	isTimeOverridden: boolean;
	teamId: string | null;
	roleId: string | null;
	isOnLeave: boolean;
	isSaturdayWorking: boolean;
	isSundayWorking: boolean;
	employeeDayTime: IEmployeeDayTime;
}

export interface IDayRoster {
	dayStartTime: Date;
	dayEndTime: Date;
}

export interface IDayRosterTime {
	dayStartTime: Date;
	dayEndTime: Date;
	date: string;
	userId?: string;
	isTimeOverridden?: boolean;
	extendedApprovedStartTime?: string;
	extendedApprovedEndTime?: string;
}

export interface IEmployeeRosterForWeekResponse {
	timeSource: TimeSource;
	weekRoster: IWeekRoster[] | null;
	dayRoster: IDayRoster | null;
}

export interface IEmployeeActivityList {
	employeeActivities: IUserActivity[];
	employeeId: string;
}

export enum EMPYEE_STATUS_FILTER {
	ALL = "ALL",
	ACTIVE = "ACTIVE",
	INACTIVE = "INACTIVE",
}

export type IGetUsersResponse = IPaginatedApiResponse<IUser & { employee?: IEmployee }>;

export type EmployeeRolePermissionCardProps = {
	id: string;
	trigger?: React.ReactNode;
	userWithPermissions: IEmployeePermissionsResponse;
	handlePermissionEdit: () => void;
	handleTechnicianPermission: () => void;
	handleWeekendSelfScheduling: (value: boolean) => void;
	handleSelfScheduling: (value: boolean) => void;
	handleFingerprintPermission: (value: boolean) => void;
	handleMaterialRequestPermission: (value: boolean) => void;
	handleCrateHandlerPermission: (value: boolean) => void;
	handleMaterialRole: (value: string | null) => void;
	handleQcPermission: (value: boolean) => void;
	handleAsanaPermission: (value: boolean) => void;
	handlePastDateScheduleUpdatePermission: (value: boolean) => void;
	handleExemptChange: (value: boolean) => void;
	isPermissionEditable: boolean;
	setIsPermissionEditable: Dispatch<SetStateAction<boolean>>;
	currentPermission: string;
	teamName?: string;
	userRole?: IRoleWithPermissions;
	adminAllPages: IPage[];
	isEditing: boolean;
	pagePermissionsRef: React.MutableRefObject<IUserPagesPermissionPayload["userPagePermissions"]>;
	stagingConfiguration: StagingConfiguration;
	setStagingConfiguration: Dispatch<SetStateAction<StagingConfiguration>>;
};

export type IUserPagesPermissionPayload = {
	userPagePermissions: {
		pageId: string;
		accessLevel?: ACCESS_LEVEL | null;
	}[];

	isPermissionOverridden: boolean;
	isWeekendSelfSchedulingAllowed: boolean;
	isSelfSchedulingAllowed: boolean;
	isMaterialRequestAllowed: boolean;
	isCrateHandlerAllowed: boolean;
	releaseNotePermission: string;
	isQcEnabled: boolean;
	isAsanaEnabled: boolean;
	isFingerprintEnabled: boolean;
	isPastDateScheduleUpdateAllowed: boolean;
};

export interface IAffectedUser {
	userId: string;
	userName: string;
}

export interface IRoleChangeHistoryItem {
	id: string;
	fromRole: string;
	toRole: string;
	changedBy: string;
	changedAt: string;
}

export interface IPermissionChangeHistoryItem {
	id: string;
	pageName: string;
	fromAccessLevel: ACCESS_LEVEL;
	toAccessLevel: ACCESS_LEVEL;
	changedBy: string;
	changedAt: string;
}

export interface IPermissionHistoryConfigChangeItem {
	id: string;
	field: string;
	previousValue: string | null;
	newValue: string | null;
	changedBy: string;
	changedAt: string;
}

export interface IUserPermissionHistoryListItem {
	id: string;
	createdAt: string;
	updatedBy: Pick<IUser, "id" | "name"> | null;
	permissionChanges: (IPagePermissionChange & {
		page: Pick<IPage, "id" | "name" | "key"> | null;
	})[];
	configurationChanges: IConfigurationChange[];
}

export interface IPagePermissionChange {
	id: string;
	historyId: string;
	pageId: string;
	previousAccessLevel: string;
	newAccessLevel: string;
	createdAt: string;
}

export interface IConfigurationChange {
	field: string;
	previousValue: string | null;
	newValue: string | null;
}

export interface IRolePermissionHistoryDetailsResponse {
	id: string;
	createdAt: string;

	role: Pick<IRole, "id" | "name">;

	updatedBy: Pick<IUser, "id" | "name">;

	permissionChanges: (IPagePermissionChange & {
		page: Pick<IPage, "id" | "name" | "key"> | null;
	})[];

	configurationChanges: IConfigurationChange[];

	affectedUsers: IAffectedUser[];
}

export interface IUserPermissionHistoryDetailsResponse {
	id: string;
	createdAt: string;

	user: Pick<IUser, "id" | "name">;

	updatedBy: Pick<IUser, "id" | "name">;

	permissionChanges: IUserPermissionHistoryChange[];

	configurationChanges: IConfigurationChange[];
}

export interface IUserPermissionHistoryChange {
	pageId: string;
	previousAccessLevel: ACCESS_LEVEL;
	newAccessLevel: ACCESS_LEVEL;

	page: Pick<IPage, "name" | "key"> | null;
}

export type StagingConfiguration = {
	isWeekendSelfSchedulingAllowed: boolean;
	isSelfSchedulingAllowed: boolean;
	isMaterialRequestAllowed: boolean;
	isCrateHandlerAllowed: boolean;
	releaseNotePermission: ACCESS_LEVEL;
	isQcEnabled: boolean;
	isAsanaEnabled: boolean;
	isFingerprintEnabled: boolean;
	isSpecialCardTimeLoggingExempt: boolean;
	isPastDateScheduleUpdateAllowed: boolean;
};
export interface IImpersonationUser {
	id: string;
	name: string;
	role: {
		id: string;
		name: string;
	} | null;
}

export interface IImpersonationUsersResponse {
	items: IImpersonationUser[];
}

export interface ITemporaryCoverageRequest {
	coveringEmployeeId: string;
	reason: COVERAGE_REASON;
	startDate: string;
	endDate: string;
}

export interface ITemporaryCoverageResponse {
	id: string;
	employeeId: string;
	coveringEmployeeId: string;
	coveringEmployeeName: string;
	reason: COVERAGE_REASON;
	startDate: string;
	endDate: string;
	isActive: boolean;
}

export interface ITransferItem {
	id: string;
	title: string;
	subtitle: string;
	category: TRANSFER_ITEM_CATEGORY;
}

export interface ITransferGroup {
	category: TRANSFER_ITEM_CATEGORY;
	label: string;
	items: ITransferItem[];
}

export interface ITransferItemAssignment {
	itemId: string;
	recipientEmployeeId: string;
}

export interface ITransferAssignmentPayload {
	assignments: ITransferItemAssignment[];
}

export interface IDeactivateEmployeeResponse {
	employeeId: string;
	isActive: boolean;
	deactivatedAt: string | null;
}
