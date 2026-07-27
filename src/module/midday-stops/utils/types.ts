import { QC_JOB_TYPE } from "@/module/schedule-management/weekly-schedule-management/types/schedule-interface";

export interface INewStopData {
	stopNumber?: number;
	date: string;
	bcewSchlinExtendedId?: number;
	bcewSchlinIdnum?: string;
	bcewSrvinvIdnum?: string;
	qcType?: QC_JOB_TYPE;
	specialJobId?: string;
}

export interface IMiddayStopPayload {
	actrec?: number;
	project?: string;
	note: string;
	startTime: string;
	endTime: string;
	stopNumber?: number | undefined;
	bcewSchlinExtendedId?: number | undefined;
	bcewSchlinIdnum?: string | undefined;
	bcewSrvinvIdnum?: string | undefined;
	qcType?: QC_JOB_TYPE | undefined;
	specialJobId?: string | undefined;
	date: Date | string;
	requestType: string;
}
