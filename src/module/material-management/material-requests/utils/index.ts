import { MATERIAL_REQUEST_ASSIGN_TO, MATERIAL_REQUEST_TYPE, REQUEST_TYPE_FILTER_VALUE } from "./enums";
import { DraftState, MaterialRequestFiltersState, MaterialRequestNoteField, MaterialRequestRow } from "./types";
import { HIDDEN_COLUMN_IDS, TEAM_HIDDEN_COLUMNS } from "./constants";

const formatRequestId = (value: string) => value;

const formatStatus = (status: boolean | null) => {
	if (status === true) return "Accepted";
	if (status === false) return "Rejected";
	return "Pending";
};

const resolveApprovalPayload = (
	draftById: Record<string, Partial<DraftState>>,
	rowById: Map<string, MaterialRequestRow>,
	rowId: string,
	isApproved: boolean
) => {
	const row = rowById.get(rowId);
	const draft = draftById[rowId] ?? {};

	return {
		pullListItemId: rowId,
		assignTo: draft.assignTo ?? row?.assignTo ?? null,
		isDeliveryOnBCEWTruck: draft.isDeliveryOnBCEWTruck ?? row?.isDeliveryOnBCEWTruck ?? null,
		isApproved,
	};
};

const parseMultiFilter = (raw: string) => (raw ? raw.split("|").filter(Boolean) : []);

export const applyMaterialRequestFilters = (
	rows: MaterialRequestRow[],
	filters: MaterialRequestFiltersState
): MaterialRequestRow[] => {
	const requestNumberLower = filters.requestNumberFilter.trim().toLowerCase();
	const keywordLower = filters.keywordFilter.trim().toLowerCase();

	const jobNameFilters = parseMultiFilter(filters.jobFilter).map((v) => v.toLowerCase());
	const jobNumberFilters = parseMultiFilter(filters.jobNumberFilter).map((v) => v.toLowerCase());
	const builderFilters = parseMultiFilter(filters.builderFilter).map((v) => v.toLowerCase());
	const projectFilters = parseMultiFilter(filters.projectFilter).map((v) => v.toLowerCase());
	const phaseFilters = parseMultiFilter(filters.phaseFilter).map((v) => v.toLowerCase());
	const partCodeFilters = parseMultiFilter(filters.partCodeFilter).map((v) => v.toLowerCase());
	const partNameFilters = parseMultiFilter(filters.partNameFilter).map((v) => v.toLowerCase());
	const modelFilters = parseMultiFilter(filters.modelFilter);
	const departmentFilters = parseMultiFilter(filters.departmentFilter).map((v) => v.toLowerCase());
	const reasonFilters = parseMultiFilter(filters.reasonFilter);
	const requestedByFilters = parseMultiFilter(filters.requestedByFilter).map((v) => v.toLowerCase());

	return rows.filter((row) => {
		const requestId = row.requestId?.toString().toLowerCase() ?? "";
		const requestedBy = row.requestedBy?.toLowerCase() ?? "";
		const partName = row.name?.toLowerCase() ?? "";
		const partCode = row.code?.toLowerCase() ?? "";
		const jobName = row.jobName?.toLowerCase() ?? "";
		const jobId = row.jobId?.toString().toLowerCase() ?? "";
		const model = row.model?.toString() ?? "";
		const reason = row.reason?.toString() ?? "";
		const requestedByDepartment = row.requestedByDepartment?.toLowerCase() ?? "";
		const phaseName = (row.phase ?? row.phaseName ?? "").toLowerCase();
		const builderName = row.builderName?.toLowerCase() ?? "";
		const projectName = row.projectName?.toLowerCase() ?? "";

		const requestNumberMatch = !requestNumberLower || requestId.includes(requestNumberLower);

		const keywordMatch =
			!keywordLower ||
			jobName.includes(keywordLower) ||
			jobId.includes(keywordLower) ||
			model.toLowerCase().includes(keywordLower) ||
			reason.toLowerCase().includes(keywordLower) ||
			partName.includes(keywordLower) ||
			partCode.includes(keywordLower) ||
			requestId.includes(keywordLower);

		const jobMatch = jobNameFilters.length === 0 || jobNameFilters.includes(jobName);
		const jobNumberMatch = jobNumberFilters.length === 0 || jobNumberFilters.includes(jobId);
		const builderMatch = builderFilters.length === 0 || builderFilters.includes(builderName);
		const projectMatch = projectFilters.length === 0 || projectFilters.includes(projectName);
		const phaseMatch = phaseFilters.length === 0 || phaseFilters.includes(phaseName);
		const modelMatch = modelFilters.length === 0 || modelFilters.includes(model);
		const departmentMatch = departmentFilters.length === 0 || departmentFilters.includes(requestedByDepartment);
		const reasonMatch = reasonFilters.length === 0 || reasonFilters.includes(reason);
		const requestedByMatch = requestedByFilters.length === 0 || requestedByFilters.includes(requestedBy);
		const partCodeMatch = partCodeFilters.length === 0 || partCodeFilters.includes(partCode);
		const partNameMatch = partNameFilters.length === 0 || partNameFilters.includes(partName);

		return (
			requestNumberMatch &&
			jobMatch &&
			jobNumberMatch &&
			builderMatch &&
			projectMatch &&
			modelMatch &&
			phaseMatch &&
			partCodeMatch &&
			partNameMatch &&
			reasonMatch &&
			requestedByMatch &&
			departmentMatch &&
			keywordMatch
		);
	});
};

const titleByAssignment: Record<string, string> = {
	[MATERIAL_REQUEST_ASSIGN_TO.FOREMAN]: "Assign to Foreman",
	[MATERIAL_REQUEST_ASSIGN_TO.WAREHOUSE_MANAGER]: "Assign to Warehouse Manager",
	[MATERIAL_REQUEST_ASSIGN_TO.OFFICE_MANAGER]: "Assign to Office",
	[MATERIAL_REQUEST_ASSIGN_TO.PROCUREMENT_SPECIALIST]: "Assign to Procurement Specialist",
};

const noteFieldByAssignment: Record<string, MaterialRequestNoteField> = {
	[MATERIAL_REQUEST_ASSIGN_TO.FOREMAN]: "foremanNote",
	[MATERIAL_REQUEST_ASSIGN_TO.WAREHOUSE_MANAGER]: "warehouseManagerNote",
	[MATERIAL_REQUEST_ASSIGN_TO.OFFICE_MANAGER]: "officeNote",
	[MATERIAL_REQUEST_ASSIGN_TO.PROCUREMENT_SPECIALIST]: "procurementSpecialistNote",
};

const booleanFilterFn = (
	row: { getValue: (columnId: string) => boolean | null | undefined },
	columnId: string,
	filterValue: unknown
) => {
	if (filterValue === undefined) return true;
	const value = row.getValue(columnId);
	if (filterValue === "true") return value === true;
	if (filterValue === "false") return value !== true;
	return true;
};

const getRequestTypeFilterValue = (
	row: Pick<MaterialRequestRow, "typeOfRequest" | "notInPullList">
): REQUEST_TYPE_FILTER_VALUE => {
	if (row.typeOfRequest === MATERIAL_REQUEST_TYPE.MISSING_ITEM) return REQUEST_TYPE_FILTER_VALUE.UNKNOWN_ITEM;
	if (row.notInPullList) return REQUEST_TYPE_FILTER_VALUE.NOT_IN_PULL_LIST;
	return REQUEST_TYPE_FILTER_VALUE.PULL_LIST_REQUEST;
};

const requestTypeFilterFn = (
	row: { getValue: (columnId: string) => string },
	columnId: string,
	filterValue: unknown
) => {
	if (filterValue === undefined) return true;
	return row.getValue(columnId) === filterValue;
};

/**
 * Returns the set of column IDs to hide for a given user context, or null if
 * the user should not have access to the material requests page at all. null
 * means deny access (unrecognised team). Non-foreman roles only ever see
 * material requests; missing-item requests are filtered out of their rows.
 */
const getMaterialRequestHiddenColumns = (
	isForeman: boolean,
	isMaterialRequestAllowed: boolean,
	teamName?: string | null
): Set<string> | null => {
	if (isForeman) return new Set();
	// Deny access for isMaterialRequestAllowed users with an unrecognised team
	if (isMaterialRequestAllowed && TEAM_HIDDEN_COLUMNS[teamName ?? ""] === undefined) return null;
	return new Set();
};

const normalizeFilterValue = (value?: string | null) => {
	if (!value) return "";

	return value.includes("|") ? value.split("|").filter(Boolean).sort().join("|") : value.trim();
};

const normalizeFilters = (filterValues: MaterialRequestFiltersState) =>
	JSON.stringify({
		builderFilter: normalizeFilterValue(filterValues.builderFilter),
		projectFilter: normalizeFilterValue(filterValues.projectFilter),
		jobNumberFilter: normalizeFilterValue(filterValues.jobNumberFilter),
		jobFilter: normalizeFilterValue(filterValues.jobFilter),
		phaseFilter: normalizeFilterValue(filterValues.phaseFilter),
		partCodeFilter: normalizeFilterValue(filterValues.partCodeFilter),
		partNameFilter: normalizeFilterValue(filterValues.partNameFilter),
		departmentFilter: normalizeFilterValue(filterValues.departmentFilter),
		modelFilter: normalizeFilterValue(filterValues.modelFilter),
		requestedByFilter: normalizeFilterValue(filterValues.requestedByFilter),
		reasonFilter: normalizeFilterValue(filterValues.reasonFilter),
		keywordFilter: filterValues.keywordFilter || "",
		requestNumberFilter: filterValues.requestNumberFilter || "",
	});

export {
	formatRequestId,
	formatStatus,
	resolveApprovalPayload,
	titleByAssignment,
	noteFieldByAssignment,
	booleanFilterFn,
	getRequestTypeFilterValue,
	requestTypeFilterFn,
	getMaterialRequestHiddenColumns,
	normalizeFilterValue,
	normalizeFilters,
};
