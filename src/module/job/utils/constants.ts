import { MATERIAL_HISTORY_FILTER } from "./enums";

const defaultRosterTime = {
	dayStartTime: "",
	dayEndTime: "",
	extendedApprovedStartTime: "",
	extendedApprovedEndTime: "",
	date: new Date().toISOString(),
	timeSource: "",
};

const extendedReasonOptions = [
	{ label: "Vehicle breakdown", value: "vehicle_breakdown" },
	{ label: "Vehicle maintenance", value: "vehicle_maintenance" },
	{ label: "Work on scheduled job", value: "work_on_scheduled_job" },
];

const extendedReasonMap: Record<string, string> = {
	vehicle_breakdown: "Vehicle breakdown",
	vehicle_maintenance: "Vehicle maintenance",
	work_on_scheduled_job: "Work on scheduled job",
};

const MATERIAL_HISTORY_FILTER_OPTIONS: { value: MATERIAL_HISTORY_FILTER; label: string }[] = [
	{ value: MATERIAL_HISTORY_FILTER.MATERIAL_PULLED, label: "Material Pulled" },
	{ value: MATERIAL_HISTORY_FILTER.MATERIAL_VALIDATED, label: "Material Validated" },
	{ value: MATERIAL_HISTORY_FILTER.PACKAGE_LOADED, label: "Package Loaded" },
	{ value: MATERIAL_HISTORY_FILTER.PACKAGE_DELIVERY, label: "Package Delivery" },
	{ value: MATERIAL_HISTORY_FILTER.ADDITIONAL_MATERIAL, label: "Additional Material" },
];

export { defaultRosterTime, extendedReasonOptions, extendedReasonMap, MATERIAL_HISTORY_FILTER_OPTIONS };
