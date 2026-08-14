import { IUser } from "@/module/schedule-management/weekly-schedule-management/types/schedule-interface";
import type { IPaginatedQuery } from "@/types";

export enum MISSING_ITEM_REQUEST_STATUS {
	PENDING = "PENDING",
	CONVERTED = "CONVERTED",
	REJECTED = "REJECTED",
}

export type AdminMissingItemRequestImage = {
	id: string;
	url: string;
	keyFile: string;
};

export type AdminMissingItemRequest = {
	id: string;
	requestId: number;
	description: string | null;
	quantity: number | null;
	isApproved: boolean | null;
	foremanNote: string | null;
	jobName?: string | null;
	phase?: string | null;
	status: MISSING_ITEM_REQUEST_STATUS;
	date?: string;
	jobDailyRecordId?: string | null;
	createdAt: string;
	updatedAt: string;
	user: IUser | null;
	foreman: IUser | null;
	recnum: number | null;
	images: AdminMissingItemRequestImage[];
};

export type UpdateForemanNotePayload = {
	foremanNote: string;
};

export type RejectMissingItemPayload = {
	foremanNote: string;
};

export type UpdateForemanNoteResponse = {
	id: string;
	foremanNote: string | null;
	foreman: IUser | null;
	updatedAt: string;
};

export type ForemanNoteModalProps = {
	initialValue?: string | null;
	requesterName?: string | null;
	description?: string;
	isSubmitting?: boolean;
	onCancel: () => void;
	onConfirm: (note: string) => void;
};

export type AdminMissingItemRequestsFilters = IPaginatedQuery & {
	id?: string;
	projectNumbers?: number[];
	jobNumbers?: number[];
	jobNames?: number[];
	requestedByUserIds?: string[];
	phaseNames?: string[];
	statuses?: string[];
	startDate?: string;
	endDate?: string;
};

export type MissingItemRequestEmployee = {
	id: string;
	name: string;
};

export type MissingItemRequestJobSite = {
	recnum: string;
	jobnme: string;
};
