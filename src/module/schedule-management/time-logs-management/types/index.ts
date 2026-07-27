import { IEmployeeExtendedTime, IExtendedRequest, IExtendedTime } from "@/module/job/types";
import { ITeam } from "@/module/team/types";
import { ISpecialJob } from "../../weekly-schedule-management/types/schedule-configuration";
import { IEmployeeDayTime, QC_JOB_TYPE } from "../../weekly-schedule-management/types/schedule-interface";
import { IMiddayStopRequest } from "../../time-requests/utils/types";
import { IRoster } from "../../roster-time-configuration/types";

export interface IOverrideSuccessModalProps {
	name: string | undefined;
	timeRange: string;
	onClose: () => void;
}

export interface IEditLogTimeProps {
	onClose: () => void;
	onSave?: () => void;
	stop: IStopDetail;
	employeeName?: string;
	trackTimeByGPS?: boolean;
	rosterTime?: IRoster;
}
export interface IEditLogDetailsProps {
	onClose: () => void;
	onSave: () => void;
	dailyJobEmployee: ITimeLogResponse;
}

export type IStopDetail = {
	stopNumber?: number;
	shtnme?: string;
	status?: number;
	gpsStart?: string;
	gpsEnd?: string;
	startTime?: string | null;
	endTime?: string | null;
	overtime?: string;
	notes?: string;
	tsknme?: string;
	isOverTimeApproved?: boolean | null;
	jobEmployeeId?: string;
	date?: string;
	employeeName?: string;
	jobnme?: string;
	overrideStartTime?: string | null;
	overrideEndTime?: string | null;
	overrideReason?: string | undefined | null;
	overTimeReason?: string;
	overTimeHours?: number;
	overTimeMinutes?: number;
	dailyJobNotes?: { note: string }[];
	id: string;
	specialJob?: ISpecialJob;
	tsknum?: string;
	isQcJob?: boolean;
	ordnum?: string;
	qcType?: string;
	didNotWorked?: string;
};

export type ITruck = {
	assignedTime: Date;
	employeeNumber: string;
	id: string;
	truckNumber: string;
	Odometer_reading: number | null;
};

export interface IScheduleModalProps {
	onClose: () => void;
	data:
		| {
				name: string;
				truck: string;
				stops: number;
				startTime: string;
				endTime: string;
				distance: string;
				stopDetails?: IStopDetail[];
		  }
		| undefined;
}

export interface IDatePickModalProps {
	selectedDate: Date | null;
	onChange: (date: Date | null) => void;
}

export interface IGetTimeLogsFilter {
	startDate?: Date | string; // date string
	search?: string;
}
export interface ITimeLogResponse {
	employeeId: string;
	bcewEmployeeNumber: number;
	date: Date;
	note: string;
	employeeName: string;
	jobs: IStopDetail[];
	trucks: ITruck[];
	employeeDayTimes: IEmployeeDayTime;
	employeeExtendedRequests: IExtendedRequest;
	rosterTimes: IRoster;
	employeeMiddayRequests: IMiddayStopRequest[];
	team?: Pick<ITeam, "id" | "name"> | null;
	trackTimeByGPS?: boolean;
}

export interface IGPS {
	Name: string;
	address: string;
	CentroidLatitude: number;
	CentroidLongitude: number;
}

export interface IGPSResponse {
	items: IGPS[];
	total: number;
	page: number;
	skip: number;
}

export interface IVehicle {
	Driver_empnum?: string;
	Truck_Number?: string;
	Odometer_Reading?: string;
	licnum?: string;
	Truck_Status?: string;
	Driver?: string;
	DeviceId?: string;
	lastAssignedTime?: string;
	user: {
		PortalUser?: string;
		e_mail?: string;
		CellNumber?: string;
		EmployeeNumber?: string;
		EmployeeName?: string;
	};
}

export interface IVehicleResponse {
	items: IVehicle[];
	total: number;
	page: number;
	skip: number;
}
export interface ITimeLogsParams {
	startDate?: Date;
	activeTeam?: string;
}

export interface IUpdateJobAssignmentTimePayload {
	id: string;
	startTime?: string;
	endTime?: string;
	overrideStartTime?: string;
	overrideEndTime?: string;
	overrideReason?: string;
	syncRoster: boolean;
}

export interface IUpdatedJobAssignmentResponse {
	id: string;
	startTime: string;
	endTime: string;
}

export interface IViewJobNotes {
	overrideReason: string | undefined | null;
	overTimeReason: string | undefined;
	dailyJobNotes: { note: string }[] | undefined;
}

export interface EmployeeStopDetailsProps {
	jobs: IStopDetail[];
	isTimeLogsEditAccess?: boolean;
	employeeName?: string;
	openModal: (params: {
		modalView: React.ReactNode;
		modalTitle?: React.ReactNode;
		subHeader?: React.ReactNode;
	}) => void;
	closeModal: () => void;
	refetch?: () => void;
	employeeDayTimes?: ITimeLogResponse["employeeDayTimes"];
	trackTimeByGPS?: boolean;
	rosterTime?: IRoster;
}

export interface AcceptETRModalProps {
	onClose: () => void;
	employeeExtendedTime: IExtendedTime;
	rosterTimes: {
		dayStartTime: Date;
		dayEndTime: Date;
		extendedApprovedEndTime?: string;
		extendedApprovedStartTime?: string;
		date: string;
		userId?: string;
	};
}

export interface ETRPopoverViewProps {
	data: IEmployeeExtendedTime[] | undefined;
}

export interface IMDTRCreateJobPayload {
	stopNumber?: number;
	date: string;
	bcewSchlinExtendedId?: number;
	bcewSchlinIdnum?: string;
	bcewSrvinvIdnum?: string;
	qcType?: QC_JOB_TYPE;
	specialJobId?: string;
	employeeId: string | undefined;
	requestType: string | undefined;
	startTime: string;
	endTime: string;
	requestId: string;
	adminNote?: string;
}
