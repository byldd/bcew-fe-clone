import {
	ISubContractorCrew,
	ISubContractorCrewEmployee as ISubContractorCrewEmployeeAdmin,
} from "@/module/admin-sub-contractor/types";
import { legends } from "@/module/employee-dashboard/constants/legend-items";
import { IAddNoteModalContentProps } from "@/module/job/types";
import { IAuthStore } from "@/module/profile/types";
import {
	IDailyJob,
	IDailyJobImage,
} from "@/module/schedule-management/weekly-schedule-management/types/schedule-interface";

export type JobStatus = (typeof legends)[keyof typeof legends];

export interface ISubcontractor {
	id: string;
	userId: string;
	user: {
		name: string;
	};
}

export interface ISubContractorCrewsResponse {
	crews: ISubContractorCrew[];
}

export type ICreateSubContractorCrewPayload = Pick<
	ISubContractorCrew,
	"name" | "isAccessPaused" | "crewLeaderName" | "email" | "phoneNumber"
> & {
	crewEmployees: string[];
};

export type IUpdateSubContractorCrewPayload = Omit<ICreateSubContractorCrewPayload, "subcontractorId">;

export interface ISubcontractorForJobs extends Omit<ISubcontractor, "userId" | "user"> {
	user: {
		id: string;
		name: string;
	};
}

export type ISubcontractorCrew = Omit<ISubContractorCrew, "crewEmployees">;

export interface ITaskJobInfo {
	taskName: string;
	jobName: string;
	siteName: string;
	recordNumber: string;
}

export type ISubContractorCrewEmployees = Omit<ISubContractorCrewEmployeeAdmin, "subContractorCrewId">;
export interface ISchlin {
	id: string;
	bcewSchlinId: string;
	recnum: number;
	tsknum: number;
	tsknme: string;
	initialInstallDate: string | null;
	completeDate: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface ISrvinv {
	id: string;
	bcewSrvinvId: string;
	recnum: number;
	ordnum: string;
	typnme: string;
	completeDate: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface IActrec {
	id: string;
	recnum: number;
	jobnme: string;
	shtnme: string;
	completeDate: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface IQcJob {
	type: string;
	schlin: ISchlin;
}

type IBaseSubContractorDailyJob = Pick<
	IDailyJob,
	"id" | "bcewSchlinIdNum" | "jobLabelAssignments" | "isPublished" | "estimateHours" | "date" | "notReadyUpdate"
>;

export type ISubContractorDailyJobSchedule = IBaseSubContractorDailyJob & {
	totalHours: number;
	images: IDailyJobImage[];
	subcontractor: ISubcontractorForJobs;
	subcontractorCrew?: ISubcontractorCrew | null;
	schlin: ISchlin | null;
	srvinv: ISrvinv | null;
	actrec: IActrec;
	qcJob: IQcJob | null;
};

export type ISubContractorDailyJobScheduleResponse = ISubContractorDailyJobSchedule[];

export type ISubContractorDailyJobLogTime = {
	id: string;
	startTime: string;
	endTime: string;
	forecastDate: string;
};

export type ISubContractorDailyJobDetailsResponse = IBaseSubContractorDailyJob &
	Pick<
		IDailyJob,
		"notes" | "isJobFinishToday" | "isJobFinishTomorrow" | "forecastTime" | "note" | "date" | "jobUpdateReasons"
	> &
	Pick<ISubContractorDailyJobSchedule, "subcontractor" | "schlin" | "srvinv" | "actrec" | "qcJob" | "images"> & {
		totalHours: number;
		foreman: string | null;
		phoneNumber: string | null;
		subcontractorCrew?: ISubcontractorCrew & {
			crewEmployees: ISubContractorCrewEmployees[];
		};
		subContractorJobUpdate: ISubContractorDailyJobLogTime;
	};

export type ISubContractorCrewName = Pick<ISubContractorCrew, "id" | "name">;

export type ISubContractorCrewNameResponse = ISubContractorCrewName[];

export type ISubContractorDailyJobTimeUpdatePayload = {
	jobDailyRecordId: string;
	startTime: string;
	endTime: string;
};

export type ISubContractorDailyJobAddNoteModalContentProps = Pick<
	IAddNoteModalContentProps,
	"userId" | "jobDailyRecordId" | "onSave"
> & {
	subContractorType: IAuthStore;
};

export type ISubContractorAdminGetCrewJobsFilter = {
	startDate: string;
	endDate?: string;
	subcontractorCrewId: string;
};
