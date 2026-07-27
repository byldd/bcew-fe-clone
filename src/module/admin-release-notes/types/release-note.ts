import { IApiResponse, IPaginatedApiResponse, IPaginatedQuery } from "@/types";

export type IReleaseNote = {
	id: string;
	content: string;
	createdAt: string;
	updatedAt: string;
	date: string;
	audience?: AUDIENCE;
	attachments?: {
		keyFile: string;
		url: string;
	}[];
};

export type IGetReleaseNotesResponse = IApiResponse<IPaginatedApiResponse<IReleaseNote>>;

export type ICreateReleaseNoteRequest = {
	content: string;
	date: string;
	audience?: AUDIENCE;
	attachments?: {
		keyFile: string;
	}[];
};

export type IGetReleaseNotesFilter = IPaginatedQuery & {
	search?: string;
	startDate?: string;
	endDate?: string;
	audience?: AUDIENCE;
	date?: string;
};

export type MatchEntry = {
	noteIndex: number;
	occurrenceOffset: number;
	noteId?: string;
};

export enum AUDIENCE {
	ADMIN = "Admin",
	TECHNICIAN = "Technician",
	ALL = "All",
}

export enum TAB_TYPE {
	ALL = "all",
	ADMIN = "admin",
	TECHNICIAN = "technician",
}
