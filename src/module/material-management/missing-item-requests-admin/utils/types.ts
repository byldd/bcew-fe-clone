import { IUser } from "@/module/schedule-management/weekly-schedule-management/types/schedule-interface";

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
	date?: string;
	jobDailyRecordId?: string | null;
	createdAt: string;
	updatedAt: string;
	user: IUser | null;
	foreman: IUser | null;
	images: AdminMissingItemRequestImage[];
};

export type UpdateForemanNotePayload = {
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
