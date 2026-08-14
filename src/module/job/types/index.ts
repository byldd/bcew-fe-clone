import {
	AttendanceStatus,
	IDailyJob,
	IEmployeeDayTime,
	IJobEmployeeAssignment,
	IJobEmployeeTableProps,
	IJobUpdateReasons,
	INewStartCardProps,
	INotes,
	IUser,
} from "@/module/schedule-management/weekly-schedule-management/types/schedule-interface";
import { extendedTimeType, MATERIAL_HISTORY_FILTER, MATERIAL_STATUS_TONE } from "../utils/enums";
import { IDayRosterTime, IEmployee } from "@/module/employee/types";
import { ISpecialJob } from "@/module/schedule-management/weekly-schedule-management/types/schedule-configuration";
import { IRoster } from "@/module/schedule-management/roster-time-configuration/types";
import { ITeam } from "@/module/team/types";
import { ReactNode } from "react";
import { TIME_VARIANCE_TYPE } from "@/utils/enums";

export interface CrewMember {
	id: string;
	name: string;
	hours: number;
}
export interface IJobUpdateModalContentProps {
	jobCompleted: boolean | undefined;
	setJobCompleted: (v: boolean | undefined) => void;
	forecastCompletion: boolean | undefined;
	setForecastCompletion: (v: boolean | undefined) => void;
	completionTime: number | undefined;
	setCompletionTime: (v: number) => void;
	note: string | undefined;
	setNote: (v: string | undefined) => void;
	specialJob: ISpecialJob | undefined;
	actrec: { shtnme: string; jobnme: string; recnum: string } | undefined;
	jobUpdateReasons: IJobUpdateReasons[] | undefined;
	crewMembers: {
		id: number;
		name: string;
		hours: number;
	}[];
}
export interface CrewMember {
	id: string;
	name: string;
	hours: number;
}

export interface TimeLogModalContentProps {
	startTime: string;
	setStartTime: (v: string) => void;
	endTime: string;
	setEndTime: (v: string) => void;
	onSave: () => void;
}

export interface JobUpdateData {
	jobCompleted?: boolean | undefined;
	note?: string | undefined;
	updatedAt?: string | undefined;
	forecastCompletion?: boolean | undefined;
	completionTime?: number | undefined;
	images?: number;
	jobUpdateData?: {
		completed?: string | undefined;
		forecast?: string | undefined;
		timeNeeded?: string | undefined;
		note?: string | undefined;
		imagesCount?: number;
	};
}

export interface IGetEmployeeScheduleFilter {
	startDate: Date | string;
	employeeId?: string; // for finger print user we fetch job so they can allocate time.
	// User not logged in that time.
}

export interface ITimeLogModalContentProps {
	onClose: () => void;
	user: IJobEmployeeAssignment;
	jobId: string;
	jobDate: Date | string;
}

export interface IDayTime {
	id?: string;
	startTime?: Date | string | null;
	endTime?: Date | string | null;
	note?: string;
	overrideStartTime?: Date | string | null;
	overrideEndTime?: Date | string | null;
	overrideReason?: string;
	employeeId?: string;
	isRunning?: boolean;
	pauseReason?: string;
	pauseTimes?: IPauseTime[];
	lateAdminNote?: string;
	earlyOutAdminNote?: string;
	lateStatus?: AttendanceStatus;
	earlyOutStatus?: AttendanceStatus;
}

export interface IAddNoteModalContentProps {
	userId: string | undefined;
	jobDailyRecordId: string | undefined;
	onSave: () => void;
}

export interface IJobEmployeeDayTime {
	startTime: string;
	endTime: string;
	assignmentId: string;
}

export interface IScheduleWeekend {
	isSaturday: boolean;
	isSunday: boolean;
	isCurrentWeekSaturday: boolean;
	isCurrentWeekSunday: boolean;
	weekendReminder?: IWeekendReminder;
}

export interface IWeekendReminder {
	id: string;
	employeeId: string;
	date: string;
	readSaturdayDate: string | null;
	readSundayDate: string | null;
}

export interface IVehicleGPS {
	licnum: string;
	truckNumber: string;
	gpsStartTime: string;
	gpsEndTime: string;
}

export interface IPauseTime {
	id?: string;
	pauseStartTime: string;
	pauseEndTime?: string | null;
	reason?: string;
}

export interface UserRosterTodayResponse {
	id: string;
	userId: string;
	teamId?: string | null;
	roleId?: string | null;

	dayStartTime: string;
	dayEndTime: string;
	extendedApprovedStartTime: string;
	extendedApprovedEndTime: string;

	timeSource: string;
	isTimeOverridden: boolean;

	date: string;

	team?: {
		id: string;
		name: string;
	} | null;

	role?: {
		id: string;
		name: string;
	} | null;
}

export interface IExtendedTime {
	id: string;
	requestId: string;
	startTime: string;
	endTime: string;
	extendedReason: string;
	extendedType: extendedTimeType;
	isApproved?: boolean;
	note?: string;
	jobStartTime?: string;
	jobEndTime?: string;
	jobDailyRecordId?: string;
	stopName?: string;
	assignmentId?: string;
	adminNote?: string;
}

export interface IExtendedRequest {
	id: string;
	date: string;
	extendedRequestTimes: IExtendedTime[];
}

export interface IEmployeeExtendedTime {
	id: string;
	date: string;
	employee?: {
		user: {
			name: string;
			rosterTimes: IRoster[];
		};
		employeeDayTimes?: {
			dayStartTime: string;
			dayEndTime: string;
		}[];
	};
	extendedRequestTimes: IExtendedTime[];
}

export interface IEmployeeType {
	id: string;
	bcewUserId: string;
	name: string;
	employee: {
		id: string;
		bcewEmployeeNumber: number;
		userId: string;
		employeeDayTimes: IEmployeeDayTime[];
		employeeExtendedRequests: IExtendedRequest[];
		user: {
			rosterTimes: {
				dayStartTime: string;
				dayEndTime: string;
				date: string;
				extendedApprovedStartTime?: string;
				extendedApprovedEndTime?: string;
			}[];
		};
	};
}

export interface IExtendedTimePayload {
	startTime?: string;
	endTime?: string;
	isApproved: boolean;
	id: string;
	date: string;
	userId?: string;
	extendedType?: string;
}

export interface IRescheduleJobPayload {
	dailyJobId: string;
	newDate: string;
}

export interface IJobUpdateFormProps {
	job: Pick<
		IDailyJob,
		| "id"
		| "notes"
		| "isJobFinishToday"
		| "isJobFinishTomorrow"
		| "forecastTime"
		| "note"
		| "date"
		| "jobUpdateReasons"
		| "specialJob"
		| "schedule"
		| "images"
		| "scheduledEndDate"
		| "jobEmployeeAssignments"
		| "forecastCrews"
		| "forecastDate"
		| "notReadyUpdate"
	>;
	onClose: () => void;
	onSubmitSuccess?: () => void | Promise<void>;
}

export interface IEmployeeLockStatus {
	isTimeLogPending: boolean;
	date: string;
	lockStatuses: string[];
	showAllocateButton?: boolean;
	showFingerPrintRequestModal?: boolean;
}

export interface IEmployeeGPSWorking {
	id: string;
	date: string;
	lastLog: string;
	isGPSWorking: boolean;
	isMarkedOfflineByEmployee: boolean;
	truckNumber: string;
	licenseNumber: string;
	markedOnlineAtByEmployee: string;
}
export interface IEmployeeExtendedData extends IExtendedTime {
	request: IEmployeeExtendedTime;
	rosterTime: IDayRosterTime;
}

export type IScheduleEmployee = IEmployee & {
	user: IUser & {
		team: ITeam;
	};
};

export interface IJobDetailFooterActionsProps {
	isTaskLeader: boolean;
	isJobFinishToday: boolean | undefined;
	isSpecialJob: boolean | undefined;
	isLoading: boolean;
	isRefetching: boolean;
	hasJobId: boolean;
	hasEmployeeStartTime: boolean;
	showRescheduleAction: boolean;
	isFingerprintEnabled?: boolean;
	onJobUpdateClick: () => void;
	onTimeLogClick: () => void;
	onRescheduleClick: () => void;
	labels: {
		completed: string;
		jobUpdatesTitle: string;
		notCompleted: string;
		updateLogTime: string;
		logTime: string;
		reschedule: string;
	};
}

export interface IJobSummarySectionProps extends IJobEmployeeTableProps {
	jobName?: string | null;
	jobPhase?: string | null;
	jobAddress?: string | null;
	jobData: IDailyJob;
	employeeAssignment: IJobEmployeeAssignment | undefined;
	projectGpsData?: IDailyJob["projectGpsData"];
}

export interface IJobNotesSectionProps {
	notes: INotes[] | undefined;
	userId: string | undefined;
	jobDailyRecordId: string | undefined;
	isAddNoteAllowed?: boolean;
	onNoteAdded: () => void;
}

export interface IJobUpdatesSectionProps {
	jobData: IDailyJob | undefined;
	notReadyUpdate: INewStartCardProps["notReadyUpdate"];
	isTaskLeader: boolean;
	onNewStartEdit: () => void;
	onJobUpdateEdit: () => void;
}

export interface ICollapsibleSectionProps {
	title: ReactNode;
	action?: ReactNode;
	defaultOpen?: boolean;
	className?: string;
	contentClassName?: string;
	children: ReactNode;
}

export interface IMaterialHistoryEntry {
	filterKey: MATERIAL_HISTORY_FILTER;
	title: string;
	status: string;
	tone: MATERIAL_STATUS_TONE;
	dateText: string;
	detailLabel: string | null;
	detailValue: string | null;
	photosLabel: string;
	photos: string[];
}

export interface IEmployeePendingLateness {
	hasPendingReason: boolean;
	redirectDate?: string;
	returnDate?: string;
	type?: TIME_VARIANCE_TYPE;
	employeeDayTimeId?: string;
	pending?: {
		lateArrival: boolean;
		earlyLogout: boolean;
	};
}

export interface IEmployeeDayVarianceStatus {
	isLateArrival: boolean;
	isEarlyLogout: boolean;
	pendingLate: boolean;
	pendingEarly: boolean;
}
