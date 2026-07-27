import { useModal } from "@/hooks/useModal";
import { C_SCHEDULE_PUBLISH_ERROR, SCHEDULE_ROW_TYPE } from "../constants/week-schedule";
import { INotification, IUserNotification, NOTIFICATION_TYPE } from "@/types/notification";
import { IPaginatedQuery } from "@/types";
import { ISubcontractorCrew } from "@/module/sub-contractor/types";
import { ISubContractorCrew, ISubContractorCrewEmployee } from "@/module/admin-sub-contractor/types";
import { ICrewsResponse, IDepartment } from "@/module/crew/types";
import { ACCESS_LEVEL } from "@/module/employee/enums";
import { IRole } from "@/module/employee/types";
import { IBylddZone, IScheduleConfiguration, ISpecialJob, ISpecialJobZone } from "./schedule-configuration";
import { ITeam } from "@/module/team/types";
import { IQcInspectionForeman } from "./qc-job";
import { OptionYesNo } from "@/utils/enums";
import { SCHEDULE_DOWNLOAD_MODAL_TYPE } from "../modals/enum";
import { IGetWeekendWorksResponse } from "../../schedule-configuration/types/schedule-config";
import { IGetBylddZonesResponse } from "../../schedule-configuration/types/zone";
import { IRoster } from "../../roster-time-configuration/types";
import { MODULE_GROUP } from "@/module/admin/notifications/types/type";
import { TimeSource } from "../../roster-time-configuration/enums";
import { IScheduleCalendarDate } from "./calendar";

export enum E_RE_ASSIGN_MODE {
	MOVE = "MOVE",
	COPY = "COPY",
}

export interface JobCardProps extends Pick<
	DroppableCardProps,
	"day" | "onSelectWorker" | "dragSelectedWorkers" | "setDragSelectedWorkers" | "bcewJob" | "specialJob"
> {
	dailyJobWithEmployee?: IWeekScheduleResponse["dailyJobs"][number];
	subContractorForecastDate?: Date | null;
	actualHours?: number;
	rowType: SCHEDULE_ROW_TYPE;
}

export interface JobCardFormProps {
	dailyJob?: JobCardProps["dailyJobWithEmployee"];
	date: Date;
	bcewJob: JobCardProps["bcewJob"];
	actualHours: JobCardProps["actualHours"];
	setIsEditing: (isEditing: boolean) => void;
	specialJob?: IWeekScheduleResponse["specialJobs"][number];
	rowType: SCHEDULE_ROW_TYPE;
}

export interface DroppableCardProps {
	bcewJob?: IWeekScheduleResponse["bcewJobs"][number];
	specialJob?: IWeekScheduleResponse["specialJobs"][number];
	day: { type: string; time: string | Date | undefined; date: Date };
	onSelectWorker: (
		workers: IWeekScheduleResponse["dailyJobs"][number]["jobEmployeeAssignments"][number],
		jobId: string
	) => void;
	dragSelectedWorkers: {
		workers: IWeekScheduleResponse["dailyJobs"][number]["jobEmployeeAssignments"][number][];
		jobId: string;
	};
	dailyJobWithEmployee?: IWeekScheduleResponse["dailyJobs"][number] | undefined;
	actualHours?: number;
	subContractorForecastDate?: Date | null;
	setDragSelectedWorkers: (workers: {
		workers: IWeekScheduleResponse["dailyJobs"][number]["jobEmployeeAssignments"][number][];
		jobId: string;
	}) => void;
	rowType: SCHEDULE_ROW_TYPE;
}

export interface JobEmployeeProps extends Pick<
	DroppableCardProps,
	"onSelectWorker" | "dragSelectedWorkers" | "bcewJob" | "specialJob"
> {
	employee: IWeekScheduleResponse["dailyJobs"][number]["jobEmployeeAssignments"][number];
	dailyJobWithEmployee: IWeekScheduleResponse["dailyJobs"][number];
	isPastDate: boolean;
}

export interface IDropdownProps {
	items: string[];
	onItemClick: (item: string) => void;
	onClose: () => void;
	position: { top: number; left: number };
}

export interface IRerunModalProps {
	onClose: () => void;
}

export interface IDayTimeProps {
	onClose: () => void;
}

export interface IScheduleConfigurationProps {
	onClose: () => void;
}

export interface ISendJobAlertModalProps {
	onClose: () => void;
	dailyJobId: string;
}

export interface ISendAlertModalProps {
	onClose: () => void;
}
export interface ITaskFiltersModalProps {
	onClose: () => void;
}

export interface IValidateScheduleModalProps {
	onClose: () => void;
}

export interface IPublishScheduleModalProps {
	onClose: () => void;
	onSuccess: (data: IValidationErrors[]) => void;
}

export interface ILabel {
	id: string;
	name: string;
}

export interface Iactrec {
	idnum: string;
	recnum: number;
	jobnme: string;
	shtnme: string;
}

export interface IBcewSchlinJob {
	idnum: string;
	recnum: number;
	notbfr?: string;
	notaft?: string;
	strdte?: string;
	findte?: string;
	fxddte?: string;
	tsknme: string;
	tsknum: number;
	multiFamily?: string;
}

export interface IBylddSchlin {
	id: string;
	bcewSchlinId: string;
	recnum: number;
	tsknum: number;
	tsknme: string;
	builderScheduleDate: string | null;
	bcewScheduleDate: string | null;
	installerCompleteDate: string | null;
	completeDate: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface IBcewEmployee {
	id: string;
	EmployeeName: string;
}

export interface IUploadImage {
	url: string;
	keyFile: string;
}

export interface IJobLabelAssignments {
	id: string;
	labelId: string;
	jobDailyRecordId: string;
}

export interface IJobDailyRecord {
	id: string;
	bcewSchlinIdNum: string;
	bcewSrvinvIdNum?: string;
	specialJobId?: string;
	bcewSchlinExtendedId?: number;
	date: Date;
	estimateHours: number;
	crewLeaderId: string;
	taskLeaderId: string;
	note?: string;
	jobLabelAssignments: IJobLabelAssignments[];
	isQcJob: boolean;
	qcType?: QC_JOB_TYPE;
	subcontractorId?: string;
	notReadyUpdate: INotReadyUpdate;
	images: IUploadImage[];
	isJobFinishToday: boolean;
	isJobFinishTomorrow: boolean;
	forecastTime: number;
	isPublished: boolean;
}

export interface IJobEmployeeAssignment {
	id?: string;
	hours?: number | null;
	startTime?: string | null;
	endTime?: string | null;
	employeeId?: string;
	stopNumber?: number | null;
	overTimeHours?: number | null;
	overTimeMinutes?: number | null;
	overTimeReason?: string | null;
	isOverTimeApproved?: boolean | null;
	overrideStartTime?: string | null;
	overrideEndTime?: string | null;
	employee?: IEmployee;
	didNotWorked?: boolean | null;
	name?: string;
	forecastHours?: number;
}

export interface IBdgLine {
	recnum: number;
	cstcde: number;
	hrsbdg: number;
}

export interface IDailyJobImage {
	id: string;
	keyFile: string;
	url: string;
}

export interface INotReadyUpdate {
	isClean: boolean;
	sendSms: boolean;
	isReady: boolean;
	isApproved: boolean;
	note?: string;
	updateForCrew?: string;
}

export interface ISubcontractor {
	id: string;
}

export interface IUser {
	id: string;
	name: string;
	isSaturdayWorking: boolean;
	isSundayWorking: boolean;
	teamId: string;
	phases?: string;
	isSelfSchedulingAllowed: boolean;
	isWeekendSelfSchedulingAllowed: boolean;
	isPermissionOverridden: boolean;
	isSpecialCardTimeLoggingExempt: boolean;
	isAdmin?: boolean;
	isPastDateScheduleUpdateAllowed: boolean;
}

export type ISubContractorJobUpdate = {
	id?: string;
	startTime: string | null;
	endTime: string | null;
	forecastDate: string | null;
};

export type IWeeklySchedulesSrvinv = {
	typnme?: string;
	tsknme: string;
};

export type ISrvinv = {
	idnum: string;
	recnum: number;
	jobnum: number;
	ordnum: string;
	schdte: string;
};

export type IBylddSrvinv = {
	id: string;
	bcewSrvinvId: string;
	recnum: number;
	ordnum: string;
	typnme: string;
	completeDate: string;
	bcewScheduleDate: string;
};

export type ISchlinExtended = {
	id: number;
	recnum: number;
	tsknum: number;
	qc_rdy?: string;
	qcrcmp?: string;
};

export type IJobTaskLeader = {
	date: string;
	JobNum?: number;
	JobName?: string;
	TaskNum?: number;
	qcType?: string;
	WOrder?: string;
	TaskLeaderEmpNum?: number;
	TaskLeaderName?: string;
};

export type IBylddQcJob = {
	id: string;
	bcewSchlinExtendedId: number;
	completeDate: string;
	bcewScheduleDate: string;
	type: string;
	source: string;
	schlinId: string;
};

export interface IWeekScheduleResponse {
	dailyJobs: (IJobDailyRecord & {
		jobEmployeeAssignments: IJobEmployeeAssignment[];
		images: IDailyJobImage[];
		notReadyUpdate?: INotReadyUpdate;
		subcontractor?: ISubcontractor & {
			user: IUser;
		};
		subcontractorCrew?: ISubcontractorCrew & {
			crewEmployees: ISubContractorCrewEmployee[];
		};
		subContractorJobUpdate?: ISubContractorJobUpdate;
		specialJob?: ISpecialJob;
		notes: (INotes & { user: IUser })[];
		schlin?: IBylddSchlin;
		forecastDate?: string;
		jobUpdateReasons?: IJobUpdateReasons[];
		forecastCrews?: IForecastCrew[];
		zone?: IBylddZone;
		srvinv: IBylddSrvinv;
		qcJob?: IBylddQcJob & { schlin: IBylddSchlin };
	})[];
	bcewJobs: {
		srvinv?: ISrvinv & {
			actrec: Iactrec & { dptmntRecord: undefined; weeklySchedulesSrvinv: IWeeklySchedulesSrvinv };
		} & { bdglin: IBdgLine };
		schlin?: IBcewSchlinJob & {
			actrec: Iactrec & { dptmntRecord: IDepartment; weeklySchedulesSrvinv?: undefined };
		} & {
			bdglin: IBdgLine;
		};
		schlinExtended?: ISchlinExtended & {
			actrec: Iactrec & { dptmntRecord: null; weeklySchedulesSrvinv?: null };
		};
	}[];
	specialJobs: (ISpecialJob & { specialJobZones?: (ISpecialJobZone & { zone?: IBylddZone })[] })[];
	jobTaskLeaders: IJobTaskLeader[];
}

export interface IGetWeekScheduleFilter {
	startDate?: string;
	endDate?: string;
	labelIds?: string[];
	departmentId?: string;
	withAssignments?: boolean;
	startInRange?: boolean;
	active?: boolean;
	completed?: boolean;
	stopNotInSequence?: boolean;
	searchValue?: string;
	teamId?: string;
}

export interface ICreateDailyJobPayload {
	schlinId?: string;
	srvinvId?: string;
	specialJobId?: string;
	date: string;
	crewLeaderId?: string | null;
	labelIds?: string[];
	taskLeaderId?: string | null;
	subcontractorId?: string | null;
	jobEmployeeAssignments: {
		employeeId: string;
		stopNumber?: number | null;
		hours?: number;
	}[];
	zoneGeoTabId?: string;
	subcontractorCrewId?: string | null;
}

export interface IScheduleReminderModalProps {
	onClose: () => void;
}

export interface IUpdateDailyJobPayload extends Omit<ICreateDailyJobPayload, "jobEmployeeAssignments"> {
	note?: string;
	jobEmployeeAssignments: Omit<IJobEmployeeAssignment, "id" | "startTime" | "endTime"> &
		{
			startTime?: string;
			endTime?: string;
		}[];
	notReadyUpdate?: Omit<INotReadyUpdate, "sendSms" | "isApproved"> | null;
	forecastTime?: number;
	isJobFinishToday?: boolean;
	isJobFinishTomorrow?: boolean;
	subContractorJobUpdate?: ISubContractorJobUpdate;
	imagesKeyFiles?: string[];
}

export interface IValidationErrors {
	dailyJobId?: string;
	dailyJobIds?: string[];

	bcewScheduledJobId?: string;
	jobSiteName?: string;

	message: string;
	type: keyof typeof C_SCHEDULE_PUBLISH_ERROR;
	date?: string;
}

export type IEmployeeDayTimeLookup = {
	[employeeId: string]: {
		[dateKey: string]: IEmployeeDayTime;
	};
};

export interface IScheduleContextType {
	validationErrors: IValidationErrors[];
	onValidateSchedule: ({
		closeModal,
		startDate,
		endDate,
	}: {
		closeModal?: () => void;
		startDate: Date;
		endDate: Date;
	}) => void;
	isValidatePending: boolean;
	schduleData: IWeekScheduleResponse | undefined;
	isFetchingSchedule: boolean;
	accessLevel: ACCESS_LEVEL | undefined;
	scheduleConfig: IScheduleConfiguration | undefined;
	jobOnSaturday: boolean;
	jobOnSunday: boolean;
	employees: IScheduleEmployee[];
	crews: ICrewsResponse["items"];
	subcontractors: ISubContractorWithCrews[];
	search: string;
	setSearch: (search: string) => void;
	dailyJobsState: IWeekScheduleResponse["dailyJobs"];
	setDailyJobsState: React.Dispatch<React.SetStateAction<IWeekScheduleResponse["dailyJobs"]>>;
	inspectionForeman: IQcInspectionForeman[];
	isAllowedToModifyPastDates: boolean;
	teams: Pick<ITeam, "id" | "name">[];
	employeeDayTimesLookup: IEmployeeDayTimeLookup;
	weekendWorks: IGetWeekendWorksResponse["data"];
	weekendJobDates: Date[];
	taskLeaderMapByRecnum: Map<number, IWeekScheduleResponse["jobTaskLeaders"]>;
	zones: IGetBylddZonesResponse;
	dataOfWeek: IScheduleCalendarDate[];
}

export interface IPublishSchedulePayload {
	startDate: string;
	endDate: string;
	teamId?: string;
}

export interface IValidateSchedulePayload {
	startDate: string;
	endDate: string;
	teamId?: string;
}

export interface IGetValidationErrorsFilter {
	startDate: Date;
	endDate: Date;
}

export interface ICrewLeader {
	id: string;
	employeeId: string;
	bcewEmployeeNumber: number;
	employeeName: string;
	userId: string;
	user: {
		name: string;
	};
}

export interface IActiveJobRecord {
	idnum: string;
	jobnme: string;
	recnum: string;
	shtnme: string;
	status: number;
	addrs1: string;
	addrs2: string;
	ctynme: string;
	state_: string;
	zipcde: string;
}

export interface IScheduleRecord {
	actrec: IActiveJobRecord;
	idnum: string;
	recnum: string;
	tsknme: string;
	tsknum: string;
	status: number;
	weeklySchedulesSrvinv?: string | null;
}

export interface IEmployeePauseTime {
	employeeDayId: string;
	pauseEndTime: string | Date;
	pauseStartTime: string | Date;
	reason: string;
}

export enum AttendanceStatus {
	PENDING = "PENDING",
	ACCEPTED = "ACCEPTED",
	REJECTED = "REJECTED",
}

export interface IEmployeeDayTime {
	dayEndTime?: string;
	dayStartTime?: string;
	rawStartTime?: string | null;
	rawEndTime?: string | null;
	employeeId: string;
	id: string;
	date: string;
	note: string;
	employeePauseTime: IEmployeePauseTime[];
	overrideStartTime?: string | null;
	overrideEndTime?: string;
	overrideReason: string;
	isRunning?: boolean;
	pauseReason?: string;

	lateResponse: OptionYesNo | null;
	lateEmployeeReason: string | null;
	lateAdminNote: string | null;
	isLatenessHandled: boolean | null;

	earlyOutResponse: OptionYesNo | null;
	earlyOutEmployeeReason: string | null;
	earlyOutAdminNote: string | null;
	isEarlyOutHandled: boolean | null;

	lateStatus?: AttendanceStatus | null;
	earlyOutStatus?: AttendanceStatus | null;

	lateClaimedStartTime?: string | null;
	earlyClaimedEndTime?: string | null;
}

interface IGPSLogEntry {
	ZoneName: string;
	TruckNumber: string;
	activeFrom: Date;
	activeTo: Date;
	DriverName: string | null;
}

export interface IEmployee {
	bcewEmployeeNumber: number;
	employeeName: string;
	id: string;
	employeeDayTimes?: IEmployeeDayTime[];
	user: {
		name: string;
		teamId: string;
		cellPhone?: string | null;
		role?: Pick<IRole, "trackTimeByGPS">;
		rosterTimes: {
			dayStartTime: string;
			dayEndTime: string;
			date: string;
			userId?: string;
			isTimeOverridden?: boolean;
			extendedApprovedStartTime?: string;
			extendedApprovedEndTime?: string;
			timeSource?: TimeSource;
		}[];
	};
	gpsLogData: IGPSLogEntry;
	jobEmployeeAssignments?: IJobEmployeeAssignment[];
}

export interface INotes {
	id: string;
	createdAt: Date;
	note: string;
	userId: string;
	user: {
		name: string;
	};
	jobDailyRecordId: string;
}

export interface IDailyJob {
	id: string;
	bcewSchlinIdNum?: string;
	date?: Date;
	scheduledEndDate?: string;
	note?: string;
	taskLeaderId?: string;
	crewLeaderId?: string;
	estimateHours?: string;
	forecastTime?: number;
	isJobFinishToday?: boolean;
	isJobFinishTomorrow?: boolean | null;
	isPublished?: boolean;
	crewLeader?: ICrewLeader;
	jobEmployeeAssignments?: IJobEmployeeAssignment[];
	jobLabelAssignments?: {
		id: string;
		labelId: string;
		jobDailyRecordId: string;
	}[];
	images?: IUploadImage[];
	schedule?: IScheduleRecord;
	notes?: INotes[];
	jobUpdateReasons?: IJobUpdateReasons[];
	notReadyUpdate?: INotReadyUpdate;
	specialJob?: ISpecialJob;
	isQcJob?: boolean;
	qcType?: string;
	foreman?: string | null;
	phoneNumber?: string | null;
	taskLeaders?: IJobTaskLeader[];
	forecastCrews?: IForecastCrew[];
	forecastDate?: string | null;
	zone?: IBylddZone;
}

export interface IJobUpdateReasons {
	id: string;
	createdAt: Date;
	reason: string;
	userId: string;
	user: {
		name: string;
	};
	jobDailyRecordId: string;
}

export interface IReAssignEmployeePayload {
	newDailyJobId: string;
	previousDailyJobId: string;
	employeeIds: string[];
	mode: E_RE_ASSIGN_MODE;
}

export interface CrewPopoverProps {
	dailyJob: JobEmployeeProps["dailyJobWithEmployee"];
	bcewJob: JobEmployeeProps["bcewJob"];
	employee: JobEmployeeProps["employee"];
	dragSelectedWorkers: JobEmployeeProps["dragSelectedWorkers"];
	onClose: () => void;
	specialJob?: JobEmployeeProps["specialJob"];
}

export interface IEditStopModalProps {
	employee: CrewPopoverProps["employee"];
	dailyJob: CrewPopoverProps["dailyJob"];
	onClose: () => void;
}

export interface IChangeMemberModalProps {
	employee: CrewPopoverProps["employee"];
	dailyJob: CrewPopoverProps["dailyJob"];
	onClose: () => void;
	specialJob?: Pick<ISpecialJob, "id" | "name" | "teams">;
}

export interface ISwitchJobModalProps {
	employee: CrewPopoverProps["employee"];
	dailyJob: CrewPopoverProps["dailyJob"];
	bcewJob: CrewPopoverProps["bcewJob"];
	onClose: () => void;
}

export interface IRemoveMemberModalProps {
	assignmentIds: string[];
	dailyJob: CrewPopoverProps["dailyJob"];
	onClose: () => void;
}

export interface ICreateJobDailyNotePayload {
	userId: string;
	jobDailyRecordId: string;
	note: string;
}

export type IReplaceEmployeeInDailyJobPayload = {
	assignmentId: string;
	newEmployee: {
		id: string;
		stopNumber?: number | null;
	};
};

export type ICreateQcJobPayload = Pick<
	ICreateDailyJobPayload,
	"jobEmployeeAssignments" | "date" | "subcontractorId" | "labelIds"
> & {
	qcJobType: QC_JOB_TYPE;
	bcewSchlinExtendedId: number;
};

export type IUpdateQcInspectionJobPayload = Omit<ICreateQcJobPayload, "jobEmployeeAssignments"> & {
	jobEmployeeAssignments: (Pick<ICreateQcJobPayload["jobEmployeeAssignments"][number], "employeeId" | "stopNumber"> & {
		overrideStartTime?: string;
		overrideEndTime?: string;
	})[];
} & {
	forecastTime?: number;
	isJobFinishToday?: boolean;
	isJobFinishTomorrow?: boolean;
};

export type IUpdateQcRepairJobPayload = Omit<ICreateQcJobPayload, "jobEmployeeAssignments"> & {
	jobEmployeeAssignments: (Pick<ICreateQcJobPayload["jobEmployeeAssignments"][number], "employeeId" | "stopNumber"> & {
		overrideStartTime?: string;
		overrideEndTime?: string;
	})[];
} & {
	forecastTime?: number;
	isJobFinishToday?: boolean;
	isJobFinishTomorrow?: boolean;
	subContractorJobUpdate?: ISubContractorJobUpdate;
};

export interface IJobOverviewCardProps {
	jobData: IDailyJob;
}

export interface IEmployeeTimeLogCardProps {
	user: IJobEmployeeAssignment | undefined;
}

export interface IJobEmployeeTableProps {
	jobEmployeeAssignments: IJobEmployeeAssignment[] | undefined;
	handleYouTag: (jobEmployeeId: string | undefined) => boolean;
	handleTaskLeader: (jobEmployeeId: string | undefined) => boolean;
}

export interface IJobHeaderProps {
	actrec: { shtnme: string; jobnme: string; recnum: string } | undefined;
	specialJob: ISpecialJob | undefined;
	onBack: () => void;
	user: IJobEmployeeAssignment | undefined;
	openModal: ReturnType<typeof useModal>["openModal"];
	closeModal: ReturnType<typeof useModal>["closeModal"];
	jobLabelAssignments:
		| {
				id: string;
				labelId: string;
				jobDailyRecordId: string;
		  }[]
		| undefined;
}

export interface IJobUpdatesCardProps {
	jobData: IDailyJob | undefined;
}

export interface IJobNotesCardProps {
	notes: INotes[] | undefined;
	openAddNoteModal: () => void;
	isAddNoteAllowed?: boolean;
}

export interface IMarkJobAsNotReadyPayload {
	dailyJobId: string;
	isClean: boolean;
	updateForCrew?: string;
	sendSms?: boolean;
	isReady: boolean;
	imagesKeyFiles?: string[];
}

export interface ISendAlertPayload {
	message: string;
	sendSms?: boolean;
	teamIds?: string[];
	userIds?: string[];
	crewIds?: string[];
	subContractorIds?: string[];
}

export type ISendJobAlertPayload = Pick<ISendAlertPayload, "message" | "sendSms"> & { dailyJobId: string };

export type IGetAdminNotificationItem = INotification & {
	userNotification?: IUserNotification;
};

export type IUpdateAdminNotificationPayload = {
	isRead?: boolean;
};

export type IGetAdminNotificationFilter = IPaginatedQuery & {
	isRead?: boolean | null;
	type?: NOTIFICATION_TYPE;
	types?: NOTIFICATION_TYPE[] | null;
	createdAt?: string;
	moduleGroups?: MODULE_GROUP[] | null;
	teamId?: string | null;
};

export interface IOvertimeRequestCardProps {
	user: IJobEmployeeAssignment | undefined;
	handleOvertimeRequestSubmit: (hours: number, minutes: number, reason: string | null, cancel?: boolean) => void;
	checkPastDateOperations: () => boolean;
}

export interface INewStartCardProps {
	notReadyUpdate: Pick<INotReadyUpdate, "isReady" | "isClean" | "updateForCrew" | "note"> | undefined;
	handleEditButtonClick: () => void;
	isDisabled?: boolean;
	bordered?: boolean;
}

export interface IJobEmployeeNotes {
	note: string;
	overrideReason: string;
	pauseReason?: string | undefined | null;
}

export enum QC_JOB_TYPE {
	INSPECTION = "INSPECTION",
	REPAIR = "REPAIR",
}

export interface ICreateQcJobAutoAssignPayload {
	startDate: string;
	endDate: string;
}

export type IScheduleEmployee = IEmployee & {
	user: IUser & {
		team: ITeam;
		rosterTimes?: Pick<
			IRoster,
			"extendedApprovedEndTime" | "extendedApprovedStartTime" | "date" | "dayStartTime" | "dayEndTime" | "timeSource"
		>[];
	};
};

export interface ITimes {
	startTime: string | Date;
	endTime: string | Date;
}

export interface IScheduleEmployeeDayTimeFilter {
	startDate: string;
	endDate: string;
}

export interface ISaveSchedulePdfPayload {
	startDate: string;
	endDate: string;
	pdfType: SCHEDULE_DOWNLOAD_MODAL_TYPE;
}

export type ISubContractorWithCrews = {
	id: string;
	userId: string;
	bcewEmployeeNumber: number | null;
	user: IUser;
	crews: ISubContractorCrew[];
};

export interface IForecastCrew {
	id?: string;
	employeeId: string;
	forecastHours: number;
	employee: Pick<IEmployee & { user: IUser }, "id" | "user">;
}

export type IGetScheduleEmployeesFilter = {
	rosterStartDate?: string;
	rosterEndDate?: string;
};
