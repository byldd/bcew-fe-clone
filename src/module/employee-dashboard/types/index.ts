import { RefObject } from "react";
import { legends } from "../constants/legend-items";
import {
	Iactrec,
	IJobDailyRecord,
	IJobEmployeeAssignment,
	QC_JOB_TYPE,
} from "@/module/schedule-management/weekly-schedule-management/types/schedule-interface";
import { PrimaryButtonState } from "../utils/enums";
import { IBylddZone } from "@/module/schedule-management/weekly-schedule-management/types/schedule-configuration";
import { OptionYesNo } from "@/utils/enums";
import { IApiResponse } from "@/types";
import {
	IGpsAfterHourUsageNote,
	IGPSExceptionEvent,
} from "@/module/fleet-manageent/gps-exception-events/types/gps-exception-event";
import { IGeoTabDevice, IZoneStopEventsWithDriver } from "@/module/fleet-manageent/gps-exception-events/types/geo-tab";

export type JobStatus = (typeof legends)[keyof typeof legends];

export interface Job {
	id: string;
	jobId: string;
	jobStatusLabel: string;
	siteName: string;
	location: string;
	assignedHours: string;
	crewLeader: string;
	status: JobStatus;
	step?: number;
	confirmationRequired?: boolean;
	previousStatus?: JobStatus;
	homeReady?: string;
	homeClean?: string;
	note?: string;
	images?: File[];
}

export type IJobDailyRecordExtended = IJobDailyRecord &
	Iactrec & {
		crewLeader: {
			crewLeaderId: string | null;
			crewLeaderUserId: string | null;
			crewLeaderName: string | null;
		};
		tsknme: string | null;
		statusNumber: number | null;
		weeklySchedulesSrvinv?: string | null;
		specialJobId: string | null;
		isQcJob: boolean;
		qcType: string;
		zone?: IBylddZone;
	};

export interface IEmployeeScheduleItem extends IJobEmployeeAssignment {
	assignmentId: string;
	jobDailyRecord: IJobDailyRecordExtended;
}

export interface JobDetailModalContentProps {
	job: Job;
	homeReady: string;
	setHomeReady: (val: string) => void;
	homeClean: string;
	setHomeClean: (val: string) => void;
	note: string;
	setNote: (val: string) => void;
	images: File[];
	setImages: (imgs: File[]) => void;
	shouldShowImageUpload: boolean;
	showNotReadyConfirm: boolean;
	setShowNotReadyConfirm: (val: boolean) => void;
	onCancel: () => void;
	onUpdate: () => void;
	onFinalSubmit: () => void;
	fileInputRef: RefObject<HTMLInputElement>;
	handleImageAdd: (e?: React.ChangeEvent<HTMLInputElement>) => void;
	handleDeleteImage: (index: number) => void;
}

export interface HeaderButton {
	key: string;
	label?: string;
	icon?: React.ReactNode;
	onClick: () => void;
	variant?: "filled" | "secondary" | "outline";
	className?: string;
	show?: boolean;
	ariaLabel?: string;
}

export interface StartDayButtonConfig {
	key: string;
	label: string;
	onClick: () => void;
	show?: boolean;
	modal?: {
		modalId: string;
		title: string;
		subHeader: React.ReactNode;
		content: React.ReactNode;
	};
	variant?: "filled" | "secondary" | "outline";
	className?: string;
}

export interface IVehicleHistoryEntry extends IUpdatedJobAssignmentResponse {
	Truck_Number?: string;
	DeviceId?: string | null;
	Odometer_Reading?: bigint | null;
	licnum?: string;
	notes: string | null;
}

export interface IChangeVehicleModalProps {
	previousVehicleNumber: string | undefined;
	onSuccess: (licenseNumber: string, notes: string) => void;
	onCancel: () => void;
}

export interface IJobCardProps {
	job: IEmployeeScheduleItem;
	totalStops?: number;
	onClick?: (job: IEmployeeScheduleItem) => void;
}

export interface IUpdateVehiclePayload {
	licenseNumber: string;
	notes: string;
	assignTime: string;
}
export interface IUpdatedJobAssignmentResponse {
	id: string;
	employeeId: string;
	employeeTruck: string;
	assignedTime: string;
}

export interface IModalWrapperProps {
	title: string;
	subHeader?: React.ReactNode;
	children: React.ReactNode;
	onClose: () => void;
}

export interface ITimerContextType {
	startTime: number | null;
	isRunning: boolean | undefined;
	elapsedTime: number;
	startTimer: (dayStartTime?: string) => void;
	pauseTimer: () => void;
	resumeTimer: () => void;
	resetTimer: () => void;
}

export interface IEndDayModalProps {
	vehicleNumber: string | undefined;
	setVehicleNumber: (value: string | undefined) => void;
	setShowEndDayModal: (value: boolean) => void;
	isGPSTimeLogAllowed: boolean;
}

export interface IStartDayModalProps {
	vehicleNumber: string | undefined;
	setVehicleNumber: (value: string | undefined) => void;
	setShowStartDayModal: (value: boolean) => void;
	setShowEndDayModal: (value: boolean) => void;
	vehicleData: IVehicleHistoryEntry[] | undefined;
}

export interface IForemanCreateJobPayload {
	stopNumber?: number;
	date: string;
	bcewSchlinExtendedId?: number;
	bcewSchlinIdnum?: string;
	bcewSrvinvIdnum?: string;
	qcType?: QC_JOB_TYPE;
	specialJobId?: string;
	note?: string;
	startTime?: string;
	endTime?: string;
}

export interface ILateEarlyStatusModalProps {
	onClose: () => void;
	onSuccess?: () => void;
	employeeDayTimeId: string | undefined;
	rosterStartTime?: Date | string;
	loggedStartTime?: Date | string;
	rosterEndTime?: Date | string;
	loggedEndTime?: Date | string;
}

export interface ILateStatusModalProps {
	onClose: () => void;
	onSuccess?: () => void;
	employeeDayTimeId: string | undefined;
	rosterStartTime?: Date | string;
	loggedStartTime?: Date | string;
}

export interface IEarlyStatusModalProps {
	onClose: () => void;
	onSuccess?: () => void;
	employeeDayTimeId: string | undefined;
	rosterEndTime?: Date | string;
	loggedEndTime?: Date | string;
}

export interface ITravelPayRequestModalProps {
	onClose: () => void;
	date?: string;
}

export interface IEmployeeJobContext {
	jobs: IEmployeeScheduleItem[];
	isJobLoading: boolean;
	refetchJobs: () => void;
}

export interface IStopOptions {
	label: string;
	value: string;
	assignmentId: string;
}

export interface IGPSPreviewProps {
	vehicleNumber: string | undefined;
	setVehicleNumber: (value: string | undefined) => void;
	setShowGpsPreviewModal: (value: boolean) => void;
}

export interface IFingerprintPreviewProps {
	setShowFingerprintPreviewModal: (value: boolean) => void;
	showAllocateButton?: boolean;
}

export interface IPrimaryButtonsProps {
	state: PrimaryButtonState;
	disabled?: boolean;
	onStart?: () => void;
	onEnd?: () => void;
	onFingerprint?: () => void;
	isVehicleAssigned?: boolean;
	todayRosterTimeAvailable?: boolean;
}

export interface IAttendanceClarification {
	response: OptionYesNo;
	reason: string;
}

export interface ILateClarification extends IAttendanceClarification {
	claimedStartTime?: string;
}

export interface IEarlyClarification extends IAttendanceClarification {
	claimedEndTime?: string;
}

export interface IReasonFieldProps {
	label: string;
	value: string;
	onChange: (value: string) => void;
}

export type IGetGPSAfterHourUsageResponse = IApiResponse<{
	events: (IGPSExceptionEvent & {
		device: IGeoTabDevice;
	})[];
	gpsAfterHourUsageNote?: IGpsAfterHourUsageNote;
	holidayGpsEvent: IZoneStopEventsWithDriver;
}>;
