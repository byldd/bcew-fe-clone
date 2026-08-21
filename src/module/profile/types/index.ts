import { ISubContractor } from "@/module/admin-sub-contractor/types";
import { ACCESS_LEVEL } from "@/module/employee/enums";
import { IRoster } from "@/module/schedule-management/roster-time-configuration/types";
import {
	IEmployeeDayTime,
	IUser,
} from "@/module/schedule-management/weekly-schedule-management/types/schedule-interface";
import { ISubCrewPushSubscription } from "@/module/sub-contractor/notification/types/notification";
import { ROLES } from "@/types";
import { MATERIAL_ROLE, MODULE, TEAM_NAME } from "@/utils/enums";

export type UserType = {
	data: {
		user?: IUser & {
			id: string;
			smsConsent: boolean;
			bcewUserId: string;
			name: string;
			roleId: string | null;
			isFingerprintEnabled?: boolean;
			isPermissionOverridden: boolean;
			phone: string;
			subContractor: {
				id: string;
				userId: string;
			} | null;
			employee: {
				id: string;
				bcewEmployeeNumber: number;
				userId: string;
				employeeDayTimes: IEmployeeDayTime[];
				user?: {
					role?: UserRole;
					team?: UserTeam;
					rosterTimes?: IRoster[];
				};
			} | null;
			role: UserRole;
			emulatedRole?: {
				id: string;
				name: string;
			};
			isEmulationAllowed: boolean;
			impersonatedByUser?: {
				id: string;
				name: string;
				role: UserRole;
			} | null;
			team: UserTeam;
			bcewUser?: IBcewUser;
			isSaturdayWorking?: boolean;
			isSundayWorking?: boolean;
			isWeekendSelfSchedulingAllowed: boolean;
			isSelfSchedulingAllowed: boolean;
			isMaterialRequestAllowed?: boolean;
			isCrateHandlerAllowed?: boolean;
			incidentReportSecondReviewer?: boolean;
			incidentReportThirdReviewer?: boolean;
			isAsanaEnabled?: boolean;
			materialRole?: MATERIAL_ROLE | null;
			userType: ROLES;
			hasAnyAdminModuleAccess: boolean;
			modules?: Record<MODULE, ACCESS_LEVEL>;
			pushSubscriptions?: {
				endpoint: string;
				p256dh: string;
				auth: string;
			}[];
			releaseNotePermission: ACCESS_LEVEL;
			adminReleaseNotePermission: ACCESS_LEVEL;
			employeeReleaseNotePermission: ACCESS_LEVEL;
			acceptTerms: boolean;
			promotionalSmsConsent: boolean;
			navOrder: string[];
		};
		subContractorCrew?: {
			id: string;
			name: string;
			crewLeaderName: string;
			email: string;
			phoneNumber: string;
			subcontractorId: string;
			updatedAt: string;
			createdAt: string;
			otp: string | null;
			otpExpiry: string | null;
			acceptTerms: boolean;
			promotionalSmsConsent: boolean;
			smsConsent: boolean;
			subcontractor: Pick<ISubContractor, "id" | "userId"> & { user: IUser };
			subCrewPushSubscriptions?: ISubCrewPushSubscription[];
		};
	};
};

export type AccessLevelType = {
	data: { accessLevel: ACCESS_LEVEL };
};

export type IAuthStore = {
	user: UserType["data"]["user"] | null;
	subcontractorCrew: UserType["data"]["subContractorCrew"] | null;
	setUser: (user: UserType["data"]["user"]) => void;
	setSubcontractorCrew: (subcontractorCrew: UserType["data"]["subContractorCrew"]) => void;
	clearStore: () => void;
};

type IBcewUser = {
	EmployeeStatus: number;
	PortalUser: string;
	EmployeeNumber: bigint;
	PortalUserName: string;
	EmployeeName: string;
	e_mail: string;
	CellNumber: string;
	HireDate: Date;
	TerminationDate: Date;
	Class: string;
	dptmnt: bigint;
	dptnme: string;
	IsApproved: boolean;
	IsLockedOut: boolean;
	employee?: { dtebth: Date | null } | null;
};

export type IUpdateSmsConsentPayload = {
	smsConsent: boolean;
	promotionalSmsConsent: boolean;
	acceptTerms: boolean;
};

export type UserRole = {
	id: string;
	name: string;
	createdBy: string | null;
	updatedAt: string;
	createdAt: string;
	trackTimeByGPS: boolean;
	canSendNotification?: boolean;
	canSendTravelPayRequest?: boolean;
	isSpecialCardTimeLoggingExempt: boolean;
	isFingerprintEnabled?: boolean;
} | null;

export type UserTeam = {
	id: string;
	name: TEAM_NAME;
	dayStartTime: string;
	dayEndTime: string;
	isPauseAllowed: boolean;
	createdAt: string;
	updatedAt: string;
} | null;
