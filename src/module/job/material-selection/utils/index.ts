import { ROLES } from "@/types";
import { MATERIAL_ROLE } from "@/utils/enums";
import type { JobPullListTakeoffItem } from "@/module/job-level-details/utils/types";
import { IMaterialSelectionFormSchema } from "./material-selection-form";
import { EmployeePullListItem, MaterialSelectionItem, ReasonAvailability } from "./types";

const FALLBACK_LABEL = "--";

const formatQuantity = (value: number | null | undefined) => {
	return value === null || value === undefined ? "--" : `${Math.floor(value)}`;
};

export const getStockStatusTag = (value: number | null | undefined) => {
	if (value === null || value === undefined) return null;
	return value === 1 ? "In Stock" : "Out of Stock";
};

export const mapPullListItemsToMaterials = (items: EmployeePullListItem[]): MaterialSelectionItem[] => {
	return items.map((item, index) => {
		const stockTag = getStockStatusTag(item.csttyp) ?? FALLBACK_LABEL;
		const phase = item.tsknme || FALLBACK_LABEL;
		const vendor = item.vendor || FALLBACK_LABEL;
		const idSource =
			item.prtnum != null && item.ponum != null ? `${item.prtnum}-${item.ponum}` : (item.prtnum ?? item.ponum ?? index);

		return {
			partId: String(idSource),
			name: item.prtdsc || FALLBACK_LABEL,
			code: item.prtnum ? `#${item.prtnum}` : FALLBACK_LABEL,
			phase,
			vendor,
			stockStatus: stockTag,
			orders: formatQuantity(item.linqty),
			checked: formatQuantity(item.linprc),
			received: formatQuantity(item.rcvdte),
			backorder: formatQuantity(item.cntqty),
			inPullList: true,
		};
	});
};

export const filterMaterials = (items: MaterialSelectionItem[], query: string) => {
	const value = query.trim().toLowerCase();
	if (!value) return items;

	return items.filter((item) => [item.name, item.code].some((field) => field.toLowerCase().includes(value)));
};

export const mapTakeoffItemsToMaterials = (
	takeoffItems: JobPullListTakeoffItem[],
	pullListItems: EmployeePullListItem[] = []
): MaterialSelectionItem[] => {
	const pullListPartNums = new Set(
		pullListItems.map((item) => item.prtnum).filter((prtnum): prtnum is number => prtnum != null)
	);

	const seenPartNums = new Set<number>();
	const materials: MaterialSelectionItem[] = [];

	for (const item of takeoffItems) {
		if (item.prtnum == null || pullListPartNums.has(item.prtnum) || seenPartNums.has(item.prtnum)) continue;
		seenPartNums.add(item.prtnum);

		materials.push({
			partId: `takeoff-${item.prtnum}`,
			name: item.prtdsc || item.partName || FALLBACK_LABEL,
			code: `#${item.prtnum}`,
			phase: FALLBACK_LABEL,
			vendor: item.vendor || FALLBACK_LABEL,
			stockStatus: getStockStatusTag(item.inStock) ?? FALLBACK_LABEL,
			orders: formatQuantity(item.linqty),
			checked: formatQuantity(item.linprc),
			received: formatQuantity(item.rcvdte),
			backorder: formatQuantity(item.cntqty),
			inPullList: false,
		});
	}

	return materials;
};

export const filterMaterialsWithTakeoff = ({
	items,
	takeoffItems,
	query,
	selectedItems = [],
}: {
	items: MaterialSelectionItem[];
	takeoffItems: MaterialSelectionItem[];
	query: string;
	selectedItems?: MaterialSelectionItem[];
}) => {
	const visible = query.trim() ? [...filterMaterials(items, query), ...filterMaterials(takeoffItems, query)] : items;

	const visibleIds = new Set(visible.map((item) => item.partId));
	const pinnedSelected = selectedItems.filter((item) => !visibleIds.has(item.partId));

	return pinnedSelected.length ? [...pinnedSelected, ...visible] : visible;
};

export const parseNumberParam = (value: string | null | undefined) => {
	if (!value) return undefined;
	const parsed = Number(value);
	return Number.isNaN(parsed) ? undefined : parsed;
};

export const MATERIAL_SELECTION_REASON_KEYS = {
	PULL_LIST_INCORRECT: "pull_list_incorrect",
	PULL_LIST_ISSUE: "pull_list_issue",
	PULL_LIST_SERVICE_PHASE: "pull_list_service_phase",
	PULL_LIST_ROUGH_PHASE: "pull_list_rough_phase",
	ADDENDUM: "addendum",
	JOBBING: "jobbing",
	WARRANTY: "warranty",
	DAMAGED: "damaged",
	DEFECTIVE: "defective",
	MISSING_PARTS: "missing_parts",
	LOST: "lost",
	STOLEN: "stolen",
} as const;

export const MATERIAL_SELECTION_REASON_OPTIONS = [
	{ label: "Pull list is incorrect", value: MATERIAL_SELECTION_REASON_KEYS.PULL_LIST_INCORRECT },
	{
		label: "Pull list is correct, but material was not pulled correctly by warehouse",
		value: MATERIAL_SELECTION_REASON_KEYS.PULL_LIST_ISSUE,
	},
	{
		label: "Material was on pull list but was not installed at service phase",
		value: MATERIAL_SELECTION_REASON_KEYS.PULL_LIST_SERVICE_PHASE,
	},
	{
		label: "Material was on pull list but was not installed at rough phase",
		value: MATERIAL_SELECTION_REASON_KEYS.PULL_LIST_ROUGH_PHASE,
	},
	{ label: "Addendum", value: MATERIAL_SELECTION_REASON_KEYS.ADDENDUM, disabled: true },
	{ label: "Jobbing", value: MATERIAL_SELECTION_REASON_KEYS.JOBBING },
	{ label: "Warranty", value: MATERIAL_SELECTION_REASON_KEYS.WARRANTY },
	{ label: "Damaged", value: MATERIAL_SELECTION_REASON_KEYS.DAMAGED },
	{ label: "Defective", value: MATERIAL_SELECTION_REASON_KEYS.DEFECTIVE },
	{ label: "Missing parts", value: MATERIAL_SELECTION_REASON_KEYS.MISSING_PARTS },
	{ label: "Lost", value: MATERIAL_SELECTION_REASON_KEYS.LOST },
	{ label: "Stolen", value: MATERIAL_SELECTION_REASON_KEYS.STOLEN },
] as const;

export const canSelectAddendumReason = ({
	isForeman,
	materialRole,
	userType,
}: {
	isForeman?: boolean;
	materialRole?: MATERIAL_ROLE | null;
	userType?: ROLES;
}) => {
	if (isForeman) return true;
	if (userType === ROLES.ADMIN || userType === ROLES.SUPER_ADMIN) return true;
	return (
		materialRole === MATERIAL_ROLE.WAREHOUSE_MANAGER ||
		materialRole === MATERIAL_ROLE.OFFICE_MANAGER ||
		materialRole === MATERIAL_ROLE.PROCUREMENT_SPECIALIST
	);
};

export const getMaterialSelectionReasonOptions = (availability?: ReasonAvailability, canSelectAddendum?: boolean) => {
	return MATERIAL_SELECTION_REASON_OPTIONS.filter((option) => {
		switch (option.value) {
			case MATERIAL_SELECTION_REASON_KEYS.JOBBING:
				return availability?.hasJobbing ?? false;
			case MATERIAL_SELECTION_REASON_KEYS.WARRANTY:
				return availability?.hasWarranty ?? false;
			case MATERIAL_SELECTION_REASON_KEYS.ADDENDUM:
				return canSelectAddendum ?? false;
			default:
				return true;
		}
	});
};

const MATERIAL_SELECTION_REASON_LABEL_BY_KEY = Object.fromEntries(
	MATERIAL_SELECTION_REASON_OPTIONS.map((option) => [option.value, option.label])
) as Record<(typeof MATERIAL_SELECTION_REASON_OPTIONS)[number]["value"], string>;

export const getMaterialSelectionReasonLabel = (reason?: string | null) => {
	if (!reason) return null;
	return (
		MATERIAL_SELECTION_REASON_LABEL_BY_KEY[reason as keyof typeof MATERIAL_SELECTION_REASON_LABEL_BY_KEY] ?? reason
	);
};

export const isMaterialSelectionReasonKey = (reason: string) => {
	return Object.values(MATERIAL_SELECTION_REASON_KEYS).includes(
		reason as (typeof MATERIAL_SELECTION_REASON_KEYS)[keyof typeof MATERIAL_SELECTION_REASON_KEYS]
	);
};

export const isPullListIssueReason = (reason?: string | null) => {
	return reason === MATERIAL_SELECTION_REASON_KEYS.PULL_LIST_ISSUE;
};

export const isAddendumReason = (reason?: string | null) => {
	return reason === MATERIAL_SELECTION_REASON_KEYS.ADDENDUM;
};

export const isWarrantyReason = (reason?: string | null) => {
	return reason === MATERIAL_SELECTION_REASON_KEYS.WARRANTY || reason === MATERIAL_SELECTION_REASON_KEYS.JOBBING;
};

export const isDamagedReason = (reason?: string | null) => {
	return (
		reason === MATERIAL_SELECTION_REASON_KEYS.DAMAGED ||
		reason === MATERIAL_SELECTION_REASON_KEYS.DEFECTIVE ||
		reason === MATERIAL_SELECTION_REASON_KEYS.MISSING_PARTS
	);
};

export const isNoteOnlyReason = (reason?: string | null) => {
	return (
		reason === MATERIAL_SELECTION_REASON_KEYS.PULL_LIST_INCORRECT ||
		reason === MATERIAL_SELECTION_REASON_KEYS.LOST ||
		reason === MATERIAL_SELECTION_REASON_KEYS.STOLEN
	);
};

export const isPhotoNoteReason = (reason?: string | null) => {
	return (
		reason === MATERIAL_SELECTION_REASON_KEYS.PULL_LIST_SERVICE_PHASE ||
		reason === MATERIAL_SELECTION_REASON_KEYS.PULL_LIST_ROUGH_PHASE
	);
};

export const getIMaterialSelectionItemPayload = (item: IMaterialSelectionFormSchema["items"][number]) => {
	const baseItem = {
		partId: item.partId,
		name: item.name,
		code: item.code,
		phase: item.phase,
		vendor: item.vendor,
		stockStatus: item.stockStatus,
		orders: item.orders,
		checked: item.checked,
		received: item.received,
		backorder: item.backorder,
		quantity: item.quantity,
		reason: item.reason,
		inPullList: item.inPullList,
	};

	if (isPullListIssueReason(item.reason)) {
		return {
			...baseItem,
			receivedInput: item.receivedInput,
			note: item.note,
		};
	}

	if (isAddendumReason(item.reason)) {
		return {
			...baseItem,
			referenceId: item.referenceId,
			note: item.note,
		};
	}

	if (isWarrantyReason(item.reason)) {
		return {
			...baseItem,
			workOrderNumber: item.workOrderNumber,
			note: item.note,
		};
	}

	if (isDamagedReason(item.reason)) {
		return {
			...baseItem,
			images: item.images,
			note: item.note,
		};
	}

	if (isPhotoNoteReason(item.reason)) {
		return {
			...baseItem,
			images: item.images,
			note: item.note,
		};
	}

	if (isNoteOnlyReason(item.reason)) {
		return {
			...baseItem,
			note: item.note,
		};
	}

	return baseItem;
};

export const isItemReadyForConfirm = (item: IMaterialSelectionFormSchema["items"][number]) => {
	if (!item.quantity || !item.reason) {
		return false;
	}

	if (isPullListIssueReason(item.reason)) {
		return Boolean(item.receivedInput) && Boolean(item.note?.trim());
	}

	if (isAddendumReason(item.reason)) {
		return Boolean(item.referenceId) && Boolean(item.note?.trim());
	}

	if (isWarrantyReason(item.reason)) {
		return Boolean(item.workOrderNumber) && Boolean(item.note?.trim());
	}

	if (isDamagedReason(item.reason)) {
		return Boolean(item.images?.length) && Boolean(item.note?.trim());
	}

	if (isPhotoNoteReason(item.reason)) {
		return Boolean(item.images?.length) && Boolean(item.note?.trim());
	}

	if (isNoteOnlyReason(item.reason)) {
		return Boolean(item.note?.trim());
	}

	return true;
};
