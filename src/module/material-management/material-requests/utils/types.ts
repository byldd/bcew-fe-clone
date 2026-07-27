import {
	Iactrec,
	IJobDailyRecord,
	IUser,
} from "@/module/schedule-management/weekly-schedule-management/types/schedule-interface";
import { ISchlin } from "@/module/sub-contractor/types";
import {
	MATERIAL_REQUEST_ASSIGN_TO,
	MATERIAL_REQUEST_AUDIT_EVENT_TYPE,
	MATERIAL_REQUEST_NOTE_MODE,
	MATERIAL_REQUEST_TYPE,
	MATERIAL_REQUEST_VIEW_MODE,
} from "./enums";

export type MaterialRequestRow = Omit<MaterialRequest, "id"> &
	Omit<PullListItem, "requestId" | "createdAt" | "updatedAt"> & {
		id: string;
		materialRequestId: string;
		requestDate: MaterialRequest["date"];

		jobId: number | null;
		jobName: string | null;
		phaseName: string | null;
		phaseNumber: number | null;

		requestedBy: string | null;
		requestedByDepartment: string | null;
		builderName: string | null;
		projectName: string | null;
		assigneeIds: string[];
		assigneeNamesByRole: Record<string, string>;
		prospectiveAssigneeNamesByRole: Record<string, string>;
		typeOfRequest?: MATERIAL_REQUEST_TYPE;
		missingItemOriginalId?: string;
		missingItemForemanId?: string | null;
		notInPullList?: boolean;
	};

export type MaterialRequest = {
	id: string;
	requestId: number;
	jobDailyRecordId: string;
	date: string;
	isDeliveryOnBCEWTruck: boolean | null;
	assignTo: string | null;
	assignToId: string | null;
	isApproved: boolean | null;
	isRejected: boolean | null;
	model: string;
	userId: string;
	createdAt: string;
	updatedAt: string;

	recnum?: number | null;
	jobDailyRecord?:
		| (IJobDailyRecord & {
				actrec: Iactrec;
				schlin: ISchlin;
		  })
		| null;
};

export type MaterialRequestApiRow = MaterialRequest & {
	pullListItems: PullListItem[];
	user: IUser;
	requestedByDepartment?: string | null;
	builderName?: string | null;
	projectName?: string | null;
	jobName?: string | null;
	jobType?: string | null;
	prospectiveAssigneesByRole?: Record<string, { id: string; name: string | null }>;
};

export type PullListItem = {
	assignToId: string | null;
	id: string;
	requestId: string;
	isDeliveryOnBCEWTruck: boolean | null;
	assignTo: string | null;
	isApproved: boolean | null;
	isRejected: boolean | null;
	notInPullList?: boolean;
	approveNote?: string | null;
	rejectNote?: string | null;
	phase?: string | null;
	partId: string;
	name: string;
	code: string;
	vendor: string;
	stockStatus: string;

	orders: string;
	received: string;
	backorder: string;
	quantity: string;

	reason: string;
	pullListConfirmed: boolean | string | null;
	additionalQuantity: string | null;
	receivedInput: string | null;
	needed: string | null;
	note: string | null;
	referenceId: string | null;
	workOrderNumber: string | null;

	createdAt: string;
	updatedAt: string;

	images: PullListItemImage[];
	foremanNote?: string | null;
	warehouseManagerNote?: string | null;
	officeNote?: string | null;
	procurementSpecialistNote?: string | null;
	assignees?: { userId: string; assignedRole: string; user: { name: string | null } | null }[];
};

export type PullListItemImage = {
	id: string;
	url: string;
	keyFile: string;
};

export type MaterialRequestUpdatePayload = {
	assignTo?: string | null;
	isDeliveryOnBCEWTruck?: boolean | null;
	isApproved?: boolean | null;
	isRejected?: boolean | null;
	approveNote?: string | null;
	rejectNote?: string | null;
	foremanNote?: string | null;
	warehouseManagerNote?: string | null;
	officeNote?: string | null;
	procurementSpecialistNote?: string | null;
	phase?: string | null;
};

export type DraftState = {
	assignTo?: string | null;
	isDeliveryOnBCEWTruck?: boolean | null;
	isApproved?: boolean | null;
	isRejected?: boolean | null;
	phase?: string | null;
};

export type AssignToOption = {
	label: string;
	value: string;
};

export type MaterialRequestColumnsProps = {
	getAssignToValue: (row: MaterialRequestRow) => string | null | undefined;
	getDeliveryValue: (row: MaterialRequestRow) => boolean | null | undefined;
	getApprovedValue: (row: MaterialRequestRow) => boolean | null | undefined;
	getRejectedValue: (row: MaterialRequestRow) => boolean | null | undefined;
	onAssignToChange: (
		rowId: string,
		value: string | null,
		isCurrentlyAssigned: boolean,
		currentNote?: string | null
	) => void;
	onDeliveryChange: (rowId: string, value: boolean) => void;
	onApproveChange: (rowId: string, isCurrentlyApproved: boolean, currentNote?: string | null) => void;
	onRejectChange: (rowId: string) => void;
	onRejectDetailsClick: (rowId: string, rejectNote?: string | null) => void;
	onPhaseChange: (rowId: string, value: string) => void;
	onNoteAction: (rowId: string, field: MaterialRequestNoteField, currentNote?: string | null) => void;
	editableNoteFields?: MaterialRequestNoteField[] | null;
	isTeamMember?: boolean;
	isForeman?: boolean;
	currentUserId?: string | null;
	userAssignRole?: MATERIAL_REQUEST_ASSIGN_TO | null;
	onMissingItemRespond?: (id: string) => void;
};

export type MaterialRequestFiltersState = {
	requestNumberFilter: string;
	keywordFilter: string;
	phaseFilter: string;
	jobFilter: string;
	jobNumberFilter: string;
	builderFilter: string;
	projectFilter: string;
	modelFilter: string;
	departmentFilter: string;
	partCodeFilter: string;
	partNameFilter: string;
	reasonFilter: string;
	requestedByFilter: string;
};

export type MaterialRequestFiltersProps = {
	startDate: Date | null;
	endDate: Date | null;
	onDateRangeChange: (startDate: Date | null, endDate: Date | null) => void;
	filters: MaterialRequestFiltersState;
	onFilterChange: (key: keyof MaterialRequestFiltersState, value: string) => void;

	onResetFilters: () => void;

	onApplySavedView: (viewId: string, filters: MaterialRequestFiltersState) => void;

	rows: MaterialRequestRow[];
	columnOptions: { id: string; label: string }[];
	columnVisibility: Record<string, boolean>;
	onToggleColumn: (columnId: string) => void;
	isForeman?: boolean;
	showViewModeTabs?: boolean;
	foremanViewMode?: MATERIAL_REQUEST_VIEW_MODE;
	onForemanViewModeChange?: (mode: MATERIAL_REQUEST_VIEW_MODE) => void;
};

export type MaterialRequestParams = MaterialRequestFiltersState & {
	startDate: Date | null;
	endDate: Date | null;
};

export type MaterialRequestParamsInput = Partial<{
	startDate: Date | null;
	endDate: Date | null;
	requestNumberFilter: string | null;
	keywordFilter: string | null;
	phaseFilter: string | null;
	jobFilter: string | null;
	jobNumberFilter: string | null;
	builderFilter: string | null;
	projectFilter: string | null;
	modelFilter: string | null;
	departmentFilter: string | null;
	partCodeFilter: string | null;
	partNameFilter: string | null;
	reasonFilter: string | null;
	requestedByFilter: string | null;
}>;

export type MaterialRequestApprovalModalProps = {
	confirmLabel: string;
	cancelLabel?: string;
	noteLabel?: string;
	notePlaceholder?: string;
	initialValue?: string | null;
	onConfirm: (note: string) => void;
	onCancel: () => void;
	isSubmitting?: boolean;
	requireNote?: boolean;
};

export type MaterialRequestAssignmentModalProps = {
	confirmLabel: string;
	cancelLabel?: string;
	noteLabel?: string;
	notePlaceholder?: string;
	initialValue?: string | null;
	onConfirm: (note: string) => void;
	onCancel: () => void;
	isSubmitting?: boolean;
};

export type MaterialRequestNoteField =
	| "approveNote"
	| "foremanNote"
	| "warehouseManagerNote"
	| "officeNote"
	| "procurementSpecialistNote";

export type FilterSelectPopoverProps = {
	label: string;
	value?: string | null;
	options: { value: string; label: string }[];
	onApply: (value: string) => void;
	triggerClassName?: string;
};

export type MaterialRequestNoteModalProps = {
	mode: MATERIAL_REQUEST_NOTE_MODE;
	initialValue?: string | null;
	onCancel: () => void;
	onSubmit: (note: string) => void;
	isSubmitting?: boolean;
};

export type MaterialRequestForemanReassignModalProps = {
	onConfirm: (note: string) => Promise<void>;
	onCancel: () => void;
};

export type MaterialRequestSavedView = {
	id: string;

	name: string;

	pageKey: string;

	filters: MaterialRequestFiltersState;

	isDefault: boolean;
	isLastViewed: boolean;

	userId: string;

	createdAt: string;
	updatedAt: string;
};

export type MaterialRequestSavedViewsResponse = {
	items: MaterialRequestSavedView[];
};

export type CreateMaterialRequestSavedViewPayload = {
	name: string;

	pageKey: string;

	filters: MaterialRequestFiltersState;

	isDefault?: boolean;
	isLastViewed?: boolean;
};

export type UpdateMaterialRequestSavedViewPayload = {
	name?: string;

	filters?: MaterialRequestFiltersState;

	isDefault?: boolean;
	isLastViewed?: boolean;
};

export type MaterialRequestAuditEvent = {
	type: MATERIAL_REQUEST_AUDIT_EVENT_TYPE;
	title: string;
	actorName: string | null;
	actorRole: string | null;
	reasonCode: string | null;
	note: string | null;
	timestamp: string;
};

export type MaterialRequestAuditLineItem = Pick<
	PullListItem,
	"id" | "partId" | "name" | "code" | "vendor" | "quantity"
> & {
	label: string;
	events: MaterialRequestAuditEvent[];
};

export type MaterialRequestAuditTrail = {
	requestId: number;
	requestedBy: string | null;
	requestDate: string;
	lineItems: MaterialRequestAuditLineItem[];
};
