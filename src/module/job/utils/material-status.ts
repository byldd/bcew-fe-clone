import { routes } from "@/config/routes";
import { toLocalFormattedDate } from "@/lib/utils/date";
import { DATE_FORMAT } from "@/types/date";
import { JobMaterialStatusResponse } from "@/module/job-level-details/utils/types";
import { AdditionalMaterialItem, AdditionalMaterialResponseItem } from "../material-selection/utils/types";
import { ADDITIONAL_MATERIAL_STATUS, MATERIAL_HISTORY_FILTER, MATERIAL_STATUS_TONE } from "./enums";
import { IMaterialHistoryEntry } from "../types";

const formatDate = (date: string | null) => (date ? toLocalFormattedDate(date, DATE_FORMAT.DATE_AND_TIME) : "--");

export const mapAdditionalMaterial = (item: AdditionalMaterialResponseItem): AdditionalMaterialItem => ({
	id: item.id,
	requestId: item.request.requestId,
	partId: item.partId,
	code: item.code,
	name: item.name,
	quantity: item.quantity,
	isApproved: item.isApproved,
	isRejected: item.isRejected,
	approveNote: item.approveNote,
	rejectNote: item.rejectNote,
	note: item.note,
	requestedBy: item.request.user?.name ?? null,
	date: item.request.date,
	createdAt: item.createdAt,
	updatedAt: item.updatedAt,
	images: item.images,
});

export const resolveAdditionalMaterialStatus = (
	item: Pick<AdditionalMaterialItem, "isApproved" | "isRejected">
): ADDITIONAL_MATERIAL_STATUS => {
	if (item.isApproved) return ADDITIONAL_MATERIAL_STATUS.APPROVED;
	if (item.isRejected) return ADDITIONAL_MATERIAL_STATUS.REJECTED;
	return ADDITIONAL_MATERIAL_STATUS.REQUESTED;
};

export const ADDITIONAL_MATERIAL_STATUS_BADGE: Record<ADDITIONAL_MATERIAL_STATUS, string> = {
	[ADDITIONAL_MATERIAL_STATUS.REQUESTED]: "bg-amber-100 text-amber-700",
	[ADDITIONAL_MATERIAL_STATUS.APPROVED]: "bg-emerald-100 text-emerald-700",
	[ADDITIONAL_MATERIAL_STATUS.REJECTED]: "bg-red-100 text-red-700",
};

export const buildMaterialStatusTimeline = (data: Partial<JobMaterialStatusResponse>): IMaterialHistoryEntry[] => [
	{
		filterKey: MATERIAL_HISTORY_FILTER.PULL_LIST,
		title: "Pull List",
		status: data.pullList?.created ? "Created" : "Pending",
		tone: data.pullList?.created ? MATERIAL_STATUS_TONE.DONE : MATERIAL_STATUS_TONE.PENDING,
		dateText: formatDate(data.pullList?.date ?? null),
		detailLabel: "Employee Name",
		detailValue: data.pullList?.user || "--",
		photosLabel: "Photos",
		photos: [],
	},
	{
		filterKey: MATERIAL_HISTORY_FILTER.MATERIAL_PULLED,
		title: "Material Pulled from Warehouse",
		status: data.pulled?.done ? "Pulled" : "Pending",
		tone: data.pulled?.done ? MATERIAL_STATUS_TONE.DONE : MATERIAL_STATUS_TONE.PENDING,
		dateText: formatDate(data.pulled?.date ?? null),
		detailLabel: "Warehouse Employee",
		detailValue: data.pulled?.user || "--",
		photosLabel: "Pull Cart Photos",
		photos: (data.pulled?.photos ?? []).map(routes.bcew.todoPhoto),
	},
	{
		filterKey: MATERIAL_HISTORY_FILTER.MATERIAL_VALIDATED,
		title: "Material Validation",
		status: data.validated?.done ? "Validated" : "Pending",
		tone: data.validated?.done ? MATERIAL_STATUS_TONE.DONE : MATERIAL_STATUS_TONE.PENDING,
		dateText: formatDate(data.validated?.date ?? null),
		detailLabel: "Warehouse Employee",
		detailValue: data.validated?.user || "--",
		photosLabel: "Validation Photos",
		photos: (data.validated?.photos ?? []).map(routes.bcew.todoPhoto),
	},
	{
		filterKey: MATERIAL_HISTORY_FILTER.PACKAGE_LOADED,
		title: "Package Loaded for Delivery",
		status: data.loaded?.done ? "Loaded" : "In-Progress",
		tone: data.loaded?.done ? MATERIAL_STATUS_TONE.DONE : MATERIAL_STATUS_TONE.PENDING,
		dateText: formatDate(data.loaded?.date ?? null),
		detailLabel: null,
		detailValue: null,
		photosLabel: "Photos",
		photos: [],
	},
	{
		filterKey: MATERIAL_HISTORY_FILTER.PACKAGE_DELIVERY,
		title: "Delivery Status",
		status: data.delivered?.done ? "Delivered" : "Pending",
		tone: data.delivered?.done ? MATERIAL_STATUS_TONE.DONE : MATERIAL_STATUS_TONE.PENDING,
		dateText: formatDate(data.delivered?.date ?? null),
		detailLabel: null,
		detailValue: null,
		photosLabel: "Delivery Confirmation",
		photos: data.delivered?.picpath ? [routes.bcew.warehousePhoto(data.delivered.picpath)] : [],
	},
];
