import {
	MEDICAL_DRUG_SCREEN,
	VEHICLE_ACCIDENT_PHOTO_CATEGORY,
	WEATHER_CONDITION,
} from "@/module/employee-safety/enums";

import { INCIDENT_REPORT_STATUS, INCIDENT_SEVERITY, INCIDENT_SOURCE, INCIDENT_TYPE } from "./enums";

export const ACCIDENT_REPORT_PREFIX = "ACC";
export const BREAKDOWN_REPORT_PREFIX = "BRK";

export const formatReportNumber = (prefix: string, reportId: number, createdAt: string): string =>
	`${prefix}-${new Date(createdAt).getUTCFullYear()}-${String(reportId).padStart(4, "0")}`;

export const INCIDENT_STATUS_META: Record<INCIDENT_REPORT_STATUS, { label: string; className: string }> = {
	[INCIDENT_REPORT_STATUS.DRAFT]: { label: "Draft", className: "bg-brand-bgLightgrey text-brand-dark50" },
	[INCIDENT_REPORT_STATUS.PENDING]: { label: "Pending", className: "bg-amber-50 text-amber-600" },
	[INCIDENT_REPORT_STATUS.PENDING_SECOND_REVIEW]: {
		label: "Pending Second Review",
		className: "bg-orange-50 text-orange-600",
	},
	[INCIDENT_REPORT_STATUS.COORDINATE]: { label: "Coordinate", className: "bg-slate-100 text-slate-600" },
	[INCIDENT_REPORT_STATUS.WITH_INSURANCE]: { label: "With Insurance", className: "bg-blue-50 text-blue-600" },
	[INCIDENT_REPORT_STATUS.RESOLVED]: { label: "Resolved", className: "bg-green-50 text-green-600" },
	[INCIDENT_REPORT_STATUS.REJECTED]: { label: "Rejected", className: "bg-red-50 text-brand-red" },
};

export const INCIDENT_SEVERITY_META: Record<INCIDENT_SEVERITY, { label: string; className: string }> = {
	[INCIDENT_SEVERITY.LOW]: { label: "Low", className: "text-brand-dark50" },
	[INCIDENT_SEVERITY.MEDIUM]: { label: "Medium", className: "text-amber-600" },
	[INCIDENT_SEVERITY.HIGH]: { label: "High", className: "text-orange-600" },
	[INCIDENT_SEVERITY.CRITICAL]: { label: "Critical", className: "text-brand-red" },
};

export const INCIDENT_SOURCE_LABEL: Record<INCIDENT_SOURCE, string> = {
	[INCIDENT_SOURCE.ADMIN]: "Admin",
	[INCIDENT_SOURCE.GEOTAB]: "GeoTab",
	[INCIDENT_SOURCE.DRIVER]: "Driver",
};

export const INCIDENT_TYPE_LABEL: Record<INCIDENT_TYPE, string> = {
	[INCIDENT_TYPE.VEHICLE_ACCIDENT]: "Vehicle Accident",
	[INCIDENT_TYPE.VEHICLE_BREAKDOWN]: "Breakdown",
};

export const WEATHER_CONDITION_LABEL: Record<WEATHER_CONDITION, string> = {
	[WEATHER_CONDITION.SUNNY]: "Sunny",
	[WEATHER_CONDITION.RAINY]: "Rainy",
	[WEATHER_CONDITION.SNOW_ICE]: "Snow / Ice",
};

export const MEDICAL_DRUG_SCREEN_LABEL: Record<MEDICAL_DRUG_SCREEN, string> = {
	[MEDICAL_DRUG_SCREEN.NO_ACTION]: "No action",
	[MEDICAL_DRUG_SCREEN.DRUG_SCREEN_ONLY]: "Drug screen only",
	[MEDICAL_DRUG_SCREEN.DRUG_SCREEN_MEDICAL]: "Drug screen + medical",
};

export const ACCIDENT_DOCUMENT_CATEGORY_LABEL: Record<VEHICLE_ACCIDENT_PHOTO_CATEGORY, string> = {
	[VEHICLE_ACCIDENT_PHOTO_CATEGORY.BCEW_VEHICLE]: "BCEW vehicle",
	[VEHICLE_ACCIDENT_PHOTO_CATEGORY.OTHER_VEHICLE_PROPERTY]: "Other vehicle / property",
	[VEHICLE_ACCIDENT_PHOTO_CATEGORY.INSURANCE_CORRESPONDENCE]: "Insurance correspondence",
	[VEHICLE_ACCIDENT_PHOTO_CATEGORY.SUPPORTING_DOCUMENT]: "Supporting document",
	[VEHICLE_ACCIDENT_PHOTO_CATEGORY.REPAIR_ESTIMATE]: "Repair estimate",
};

export interface IBreakdownKeyResource {
	label: string;
	description: string;
}

export const BREAKDOWN_KEY_RESOURCES: IBreakdownKeyResource[] = [
	{
		label: "Route 1 / I-95",
		description: "use All-County Towing (24/7) — (215) 555-0110. BCEW account #4471.",
	},
	{
		label: "Turnpike (PA-276)",
		description: "only PA Turnpike-authorized operators may respond. Dispatch *11.",
	},
	{
		label: "Local roads, Bucks County",
		description: "Dawson's Garage preferred — (267) 555-0187.",
	},
	{
		label: "Impound",
		description: "confirm lot before release; get itemized charges for cost tracking.",
	},
	{
		label: "After hours",
		description: "notify Nolan Yeager before authorizing any tow over $500.",
	},
];
