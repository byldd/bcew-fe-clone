import { IJobEmployeeAssignment } from "@/module/schedule-management/weekly-schedule-management/types/schedule-interface";

export type BuilderCommsImage = {
	id: string;
	url: string;
	date: string;
};

export type BuilderCommsNote = {
	id: string;
	reason: string;
	createdAt: string;
	user: {
		id: string;
		name: string;
		cellPhone?: string;
	};
};

export type BuilderCommsJobNote = {
	id: string;
	note: string;
	createdAt: string;
	user: {
		id: string;
		name: string;
	};
};

export type BuilderCommsNotReadyNote = {
	id: string;
	note: string | null;
	updateForCrew: string | null;
	isReady: boolean;
	isClean: boolean;
	isApproved: boolean;
	createdAt: string;
	user?: {
		id: string;
		name: string;
		cellPhone?: string;
	};
};

export type BuilderCommsForecastCrew = {
	id: string;
	employeeId?: string;
	forecastHours?: number;
	jobDailyRecordId?: string;
	employee?: {
		id?: string;
		name?: string;
		user?: {
			name?: string;
		};
	};
};

export type BuilderCommsDailyRecord = {
	id: string;
	date: string;
	images: BuilderCommsImage[];
	jobUpdateReasons: BuilderCommsNote[];
	notes: BuilderCommsJobNote[];
	notReadyUpdate: BuilderCommsNotReadyNote | null;
	isJobFinishToday?: boolean;
	isJobFinishTomorrow?: boolean;
	forecastDate?: string | null;
	forecastCrews?: BuilderCommsForecastCrew[];
	jobEmployeeAssignments?: IJobEmployeeAssignment[];
};

export type BuilderCommsQcJob = {
	id: string;
	type: string;
	bcewSchlinExtendedId: number;
	completeDate: string | null;
	bcewScheduleDate: string | null;
	source: string | null;
	jobDailyRecords: BuilderCommsDailyRecord[];
};

export type BuilderCommsPhase = {
	id: string;
	bcewSchlinId: string;
	tsknum: number;
	tsknme: string;
	completeDate: string | null;
	jobDailyRecords: BuilderCommsDailyRecord[];
	qcJobs: BuilderCommsQcJob[];
};

export type BuilderCommsWorkOrder = {
	id: string;
	bcewSrvinvId: string;
	ordnum: string;
	typnme: string | null;
	completeDate: string | null;
	bcewScheduleDate: string | null;
	jobDailyRecords: BuilderCommsDailyRecord[];
};

export type BuilderCommsJob = {
	jobId: number;
	jobName: string;
	shortName: string;
	builderName?: string;
	phases: BuilderCommsPhase[];
	workOrders: BuilderCommsWorkOrder[];
};

export type BuilderCommsProject = {
	projectName: string;
	jobs: BuilderCommsJob[];
};

export type BuilderCommsBuilder = {
	builderName: string;
	projects: BuilderCommsProject[];
};

export type BuilderCommsTreeResponse = BuilderCommsBuilder[];

export enum BUILDER_COMMS_TAB {
	IMAGE_GALLERY = "IMAGE_GALLERY",
	LOREM_IPSUM = "LOREM_IPSUM",
}

export type BuilderCommsTabConfig = {
	id: BUILDER_COMMS_TAB;
	label: string;
};

export type SidebarNode = BuilderCommsJob;

export enum BUILDER_COMMS_PHASE_TYPE {
	ROUGH = "Rough",
	SERVICE = "Service",
	FINAL = "Final",
	SECOND_HIT = "Second Hit",
	WORK_ORDER = "Work Order",
}

export enum JOB_STATUS {
	NOT_STARTED = "Not Started",
	PRODUCTION = "Production",
	WARRANTY = "Warranty",
	EXPIRED_WARRANTY = "Expired Warranty",
}

export const JOB_STATUS_OPTIONS = Object.values(JOB_STATUS);
