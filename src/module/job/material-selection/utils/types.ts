import type { Control, FieldErrors, UseFormHandleSubmit } from "react-hook-form";
import type { IMaterialSelectionFormSchema } from "./material-selection-form";
import { IUser } from "@/module/schedule-management/weekly-schedule-management/types/schedule-interface";
import type {
	MaterialRequest,
	MaterialRequestRow,
	PullListItem,
} from "@/module/material-management/material-requests/utils/types";
import type { JobPullListTakeoffItem } from "@/module/job-level-details/utils/types";

export type SelectedIdOption = { label: string; value: string };

export type ReasonAvailability = {
	hasJobbing: boolean;
	hasWarranty: boolean;
};

export type EmployeePullListItem = {
	prtnum: number | null;
	prtdsc: string | null;
	csttyp: number | null;
	tsknme: string | null;
	linqty?: number | null;
	linprc?: number | null;
	rcvdte?: number | null;
	cntqty?: number | null;
	vendor?: string | null;
	ponum?: number | null;
	alpnum?: string | null;
	untdsc?: string | null;
	extttl?: number | null;
	orddte?: string | null;
	deldte?: string | null;
	poNote?: string | null;
};

export type EmployeePullListResponse = {
	items: EmployeePullListItem[];
	takeoffItems?: JobPullListTakeoffItem[];
	addendumReferenceOptions?: SelectedIdOption[];
	workOrderOptions?: SelectedIdOption[];
	reasonAvailability?: ReasonAvailability;
};

export type MaterialSelectionItem = {
	partId: string;
	name: string;
	code: string;
	phase: string;
	vendor: string;
	stockStatus: string;
	orders: string;
	checked: string;
	received: string;
	backorder: string;
	inPullList?: boolean;
};

export type MaterialSelectionImage = {
	keyFile: string;
	url: string;
	file?: File;
};

export type MaterialSelectionFormItem = MaterialSelectionItem & {
	quantity: string;
	reason: string;
	pullListConfirmed?: string;
	additionalQuantity?: string;
	receivedInput?: string;
	needed?: string;
	note?: string;
	referenceId?: string;
	workOrderNumber?: string;
	images?: MaterialSelectionImage[];
};

export type MaterialSelectionListProps = {
	items: MaterialSelectionItem[];
	selectedById: Record<string, boolean>;
	selectedIndexById: Record<string, number>;
	formItems: MaterialSelectionFormItem[];
	control: Control<IMaterialSelectionFormSchema>;
	onToggle: (item: MaterialSelectionItem, checked: boolean) => void;
	onReasonChange: (index: number, reason: string) => void;
	addendumOptions: SelectedIdOption[];
	workOrderOptions: SelectedIdOption[];
	reasonAvailability?: ReasonAvailability;
	errors?: FieldErrors<IMaterialSelectionFormSchema>;
	isLoading: boolean;
	twoColumn?: boolean;
	canSelectAddendum?: boolean;
};

export type PreviewItem = Partial<IMaterialSelectionFormSchema["items"][number]>;

export type PreviewRequestViewProps = {
	previewItems: PreviewItem[];
	handlePreviewBack: () => void;
	onCancel?: () => void;
	handleAddAnotherItem: () => void;
	handleSubmit: UseFormHandleSubmit<IMaterialSelectionFormSchema>;
	handleSubmitRequest: (data: IMaterialSelectionFormSchema) => Promise<void>;
	handleSubmitInvalid: () => void;
	isSubmitting: boolean;
	onDeleteItem: (partId: string) => void;
	topActions?: boolean;
};

export type MaterialSelectionSubmitResponse = {
	requestId: number;
	itemsRequested: number;
	processing: string;
};

export type RequestSuccessViewProps = {
	requestResult: MaterialSelectionSubmitResponse | null;
	closeSuccessModal: () => void;
	topActions?: boolean;
};

export type MaterialSelectionSubmitPayload = {
	assignmentId?: string;
	userId?: string;
	items: MaterialSelectionFormItem[];
};

export type MissingItemRequestPayloadBase = {
	description: string;
	quantity: number;
	images?: MaterialSelectionImage[];
};

export type CreateMissingItemRequestPayload = MissingItemRequestPayloadBase & {
	assignmentId?: string | null;
};

export type CreateMissingItemRequestResponse = {
	id: string;
	requestId: number;
	foremanId: string | null;
	createdAt: string;
};

export type MissingItemRequestForemanSummary = {
	id: string;
	name: string;
} | null;

export type MissingItemRequestImage = {
	id: string;
	url: string;
	keyFile: string;
};

export type MissingItemRequestList = {
	id: string;
	requestId: number;
	description: string | null;
	quantity: number | null;
	isApproved: boolean | null;
	foremanNote: string | null;
	date?: string | null;
	createdAt: string;
	updatedAt: string;
};

export type MissingItemRequestsListResponse = MissingItemRequestList & {
	user?: IUser | null;
	foreman: IUser | null;
	images: MissingItemRequestImage[];
	jobName?: string | null;
	phase?: string | null;
};

export type AdditionalMaterialResponseItem = Pick<
	PullListItem,
	| "id"
	| "partId"
	| "code"
	| "name"
	| "quantity"
	| "isApproved"
	| "isRejected"
	| "approveNote"
	| "rejectNote"
	| "note"
	| "createdAt"
	| "updatedAt"
	| "images"
> & {
	request: Pick<MaterialRequest, "requestId" | "date"> & {
		user: Pick<IUser, "name"> | null;
	};
};

export type AdditionalMaterialItem = Pick<
	MaterialRequestRow,
	| "id"
	| "requestId"
	| "partId"
	| "code"
	| "name"
	| "quantity"
	| "isApproved"
	| "isRejected"
	| "approveNote"
	| "rejectNote"
	| "note"
	| "requestedBy"
	| "date"
	| "createdAt"
	| "updatedAt"
	| "images"
>;

export type SubContractorMaterialSelectionSubmitPayload = {
	jobDailyRecordId: string;
	items: MaterialSelectionFormItem[];
};

export type CreateSubContractorMissingItemRequestPayload = MissingItemRequestPayloadBase & {
	jobDailyRecordId: string;
};
