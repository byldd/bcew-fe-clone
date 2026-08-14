import {
	MEDICAL_DRUG_SCREEN,
	VEHICLE_ACCIDENT_PHOTO_CATEGORY,
	WEATHER_CONDITION,
} from "@/module/employee-safety/enums";

import {
	ACCIDENT_ADMIN_FIELD,
	ACCIDENT_TECHNICIAN_FIELD,
	INCIDENT_ACTOR_ROLE,
	INCIDENT_AUDIT_ACTION,
	INCIDENT_REPORT_STATUS,
	INCIDENT_SEVERITY,
	INCIDENT_SOURCE,
	INCIDENT_TYPE,
	INCIDENT_TYPE_TAB,
	VIOLATION_TYPE_CATEGORY,
} from "./enums";
import { IIncidentReportRow } from "../types";

// Copy for the confirmation popup shown before each irreversible workflow action.
export interface IConfirmActionCopy {
	title: string;
	description: string;
	confirmText: string;
}

export const MARK_FOR_PRESIDENT_REVIEW_CONFIRM: IConfirmActionCopy = {
	title: "Mark as Resolved?",
	description: "This will mark the claim as resolved and close it. This action cannot be undone.",
	confirmText: "Yes, Mark as Resolved",
};

export const SEND_TO_TECHNICIAN_CONFIRM: IConfirmActionCopy = {
	title: "Send this back to the Technician?",
	description: "The technician will be asked to complete the requested details before the report returns for review.",
	confirmText: "Yes, Send it.",
};

export const APPROVE_INTERNALLY_CONFIRM: IConfirmActionCopy = {
	title: "Resolve this report internally?",
	description: "Resolving internally applies the points and closes the report without sending it to insurance.",
	confirmText: "Yes, Resolve.",
};

export const MARK_AS_RESOLVED_CONFIRM: IConfirmActionCopy = {
	title: "Mark as Resolved?",
	description: "This will mark the claim as resolved and close it. This action cannot be undone.",
	confirmText: "Yes, Mark as Resolved",
};

export const APPROVE_AND_SEND_TO_INSURANCE_CONFIRM: IConfirmActionCopy = {
	title: "Approve & Send to Insurance?",
	description:
		"This approval generates the insurance email and forwards the full report for the Fleet Manager's final review.",
	confirmText: "Yes, Approve.",
};

export const SEND_BACK_TO_PRESIDENT_CONFIRM: IConfirmActionCopy = {
	title: "Send back for President's Review?",
	description:
		"The report will be returned to the President's queue for another review before it can be sent to insurance.",
	confirmText: "Yes, Send back.",
};

export const APPROVE_AND_SEND_EMAIL_CONFIRM: IConfirmActionCopy = {
	title: "Approve & Send Email?",
	description: "This will send the claim email directly to the insurance company. This action cannot be undone.",
	confirmText: "Yes, Send Email",
};

export const ACCIDENT_REPORT_PREFIX = "ACC";
export const BREAKDOWN_REPORT_PREFIX = "BRK";
export const VIOLATION_REPORT_PREFIX = "DSV";

// Deep link into Geotab for a GeoTab safety-violation's exception, opened from the
// record-number cell.
export const buildGeotabExceptionUrl = (geotabId: string): string =>
	`https://my.geotab.com/bcew/#exception,id:${geotabId},runByDevice:!t,tab:video`;

// Google Maps link for a GeoTab safety-violation's "latitude, longitude" location.
export const buildGoogleMapsUrl = (coordinates: string): string =>
	`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(coordinates)}`;

export const formatReportNumber = (prefix: string, reportId: number, createdAt: string): string =>
	`${prefix}-${new Date(createdAt).getUTCFullYear()}-${String(reportId).padStart(4, "0")}`;

export const INCIDENT_STATUS_META: Record<INCIDENT_REPORT_STATUS, { label: string; className: string }> = {
	[INCIDENT_REPORT_STATUS.DRAFT]: { label: "Draft", className: "bg-brand-bgLightgrey text-brand-dark50" },
	[INCIDENT_REPORT_STATUS.PENDING]: { label: "Pending", className: "bg-[#784F041A] text-[#784F04]" },
	[INCIDENT_REPORT_STATUS.PENDING_SECOND_REVIEW]: {
		label: "Pending Second Review",
		className: "bg-orange-50 text-orange-600",
	},
	[INCIDENT_REPORT_STATUS.PENDING_THIRD_REVIEW]: {
		label: "Pending Second Review",
		className: "bg-orange-50 text-orange-600",
	},
	[INCIDENT_REPORT_STATUS.COORDINATE]: { label: "Coordinate", className: "bg-[#1515151A] text-[#151515B2]" },
	[INCIDENT_REPORT_STATUS.WITH_INSURANCE]: {
		label: "Submitted to Insurance",
		className: "bg-[#1D4ED81A] text-[#1D4ED8]",
	},
	[INCIDENT_REPORT_STATUS.RESOLVED]: { label: "Resolved", className: "bg-[#0CC3121A] text-[#0CC312]" },
	[INCIDENT_REPORT_STATUS.REJECTED]: { label: "Rejected", className: "bg-red-50 text-brand-red" },
	[INCIDENT_REPORT_STATUS.ADDITIONAL_INFO_REQUESTED]: {
		label: "Additional Info Requested",
		className: "bg-purple-50 text-purple-600",
	},
};

// Human role label prefixed to each audit-trail entry title ("{Role} did X").
export const INCIDENT_ACTOR_ROLE_LABEL: Record<INCIDENT_ACTOR_ROLE, string> = {
	[INCIDENT_ACTOR_ROLE.TECHNICIAN]: "Technician",
	[INCIDENT_ACTOR_ROLE.ADMIN]: "Admin",
	[INCIDENT_ACTOR_ROLE.PRESIDENT]: "President",
	[INCIDENT_ACTOR_ROLE.FLEET_MANAGER]: "Fleet Manager",
};

// The action phrase that follows the actor's role in the trail title.
export const INCIDENT_AUDIT_ACTION_LABEL: Record<INCIDENT_AUDIT_ACTION, string> = {
	[INCIDENT_AUDIT_ACTION.SUBMITTED]: "submitted the report",
	[INCIDENT_AUDIT_ACTION.APPROVED_INTERNALLY]: "approved the report internally",
	[INCIDENT_AUDIT_ACTION.VIOLATION_UPDATED]: "updated Violation Type",
	[INCIDENT_AUDIT_ACTION.ADMIN_UPDATED_FIELD]: "edited inputs from admin",
	[INCIDENT_AUDIT_ACTION.ADMIN_INPUTS_EDITED]: "edited inputs from admin",
	[INCIDENT_AUDIT_ACTION.TECHNICIAN_INFO_EDITED]: "edited the information from technician",
	[INCIDENT_AUDIT_ACTION.ADMIN_REQUESTED_INFO]: "requested more info from the technician",
	[INCIDENT_AUDIT_ACTION.ASSIGNED_SECOND_REVIEW]: "sent it for President's Review",
	[INCIDENT_AUDIT_ACTION.SECOND_REVIEW_APPROVED]: "accepted and sent for Fleet Manager's review",
	[INCIDENT_AUDIT_ACTION.SECOND_REVIEW_CANCELLED]: "cancelled the report",
	[INCIDENT_AUDIT_ACTION.THIRD_REVIEW_SENT_BACK]: "sent it back for President's review",
	[INCIDENT_AUDIT_ACTION.SENT_TO_INSURANCE]: "sent it to the insurer",
	[INCIDENT_AUDIT_ACTION.CLAIM_RESOLVED]: "marked the claim as resolved",
};

// Field name shown on a grouped-edit sub-bullet ("<label> changed From X to Y").
export const ACCIDENT_ADMIN_FIELD_CHANGE_LABEL: Record<ACCIDENT_ADMIN_FIELD, string> = {
	[ACCIDENT_ADMIN_FIELD.DRUG_SCREEN]: "Drug screen / medical",
	[ACCIDENT_ADMIN_FIELD.MEDICAL_LOCATION]: "Medical treatment location",
	[ACCIDENT_ADMIN_FIELD.BCEW_TOWED]: "BCEW vehicle towed",
	[ACCIDENT_ADMIN_FIELD.OTHER_VEHICLE_TOWED]: "Other vehicle towed",
	[ACCIDENT_ADMIN_FIELD.VEHICLE_IMPOUNDED]: "Vehicle impounded",
};

// Field labels for the technician-info edit sub-bullets (TECHNICIAN_INFO_EDITED).
export const ACCIDENT_TECHNICIAN_FIELD_CHANGE_LABEL: Record<ACCIDENT_TECHNICIAN_FIELD, string> = {
	[ACCIDENT_TECHNICIAN_FIELD.ON_JOB_SITE]: "Occurred on a job site",
	[ACCIDENT_TECHNICIAN_FIELD.JOB_SITE_TYPE]: "Job site type",
	[ACCIDENT_TECHNICIAN_FIELD.ANOTHER_VEHICLE_INVOLVED]: "Another vehicle involved",
	[ACCIDENT_TECHNICIAN_FIELD.PERSON_STRUCK]: "Person struck",
	[ACCIDENT_TECHNICIAN_FIELD.OTHER_VEHICLE_COUNT]: "Number of vehicles involved",
	[ACCIDENT_TECHNICIAN_FIELD.TRUCK_NUMBER]: "Truck number",
	[ACCIDENT_TECHNICIAN_FIELD.VIN]: "VIN",
	[ACCIDENT_TECHNICIAN_FIELD.LICENSE_PLATE]: "License plate",
	[ACCIDENT_TECHNICIAN_FIELD.ACCIDENT_DATE]: "Date of accident",
	[ACCIDENT_TECHNICIAN_FIELD.ACCIDENT_TIME]: "Time of accident",
	[ACCIDENT_TECHNICIAN_FIELD.LOCATION]: "Location of accident",
	[ACCIDENT_TECHNICIAN_FIELD.NEAREST_CROSS_STREET]: "Nearest cross street",
	[ACCIDENT_TECHNICIAN_FIELD.WEATHER]: "Weather conditions",
	[ACCIDENT_TECHNICIAN_FIELD.DESCRIBE_ACCIDENT]: "How the accident happened",
	[ACCIDENT_TECHNICIAN_FIELD.DAMAGE_TO_BCEW_VEHICLE]: "Damage to BCEW vehicle",
	[ACCIDENT_TECHNICIAN_FIELD.POLICE_CONTACTED]: "Police contacted",
	[ACCIDENT_TECHNICIAN_FIELD.POLICE_DEPARTMENT]: "Police department",
	[ACCIDENT_TECHNICIAN_FIELD.POLICE_REPORT_NUMBER]: "Police report number",
};

// Grey, not-yet-reached lifecycle steps shown below the recorded entries, keyed by the
// report's current status. Terminal statuses (RESOLVED / REJECTED) show no pending tail.
export const INCIDENT_PENDING_LIFECYCLE: Partial<Record<INCIDENT_REPORT_STATUS, string[]>> = {
	[INCIDENT_REPORT_STATUS.PENDING]: [
		"President's review pending",
		"Fleet Manager's review pending",
		"Sent to insurance",
		"Resolved",
	],
	[INCIDENT_REPORT_STATUS.ADDITIONAL_INFO_REQUESTED]: [
		"President's review pending",
		"Fleet Manager's review pending",
		"Sent to insurance",
		"Resolved",
	],
	[INCIDENT_REPORT_STATUS.PENDING_SECOND_REVIEW]: [
		"President's review pending",
		"Fleet Manager's review pending",
		"Sent to insurance",
		"Resolved",
	],
	[INCIDENT_REPORT_STATUS.PENDING_THIRD_REVIEW]: ["Fleet Manager's review pending", "Sent to insurance", "Resolved"],
	[INCIDENT_REPORT_STATUS.COORDINATE]: ["Sent to insurance", "Resolved"],
	[INCIDENT_REPORT_STATUS.WITH_INSURANCE]: ["Resolved"],
};

export const INCIDENT_SEVERITY_META: Record<INCIDENT_SEVERITY, { label: string; className: string }> = {
	[INCIDENT_SEVERITY.LOW]: { label: "Low", className: "text-brand-dark50" },
	[INCIDENT_SEVERITY.MEDIUM]: { label: "Medium", className: "text-amber-600" },
	[INCIDENT_SEVERITY.HIGH]: { label: "High", className: "text-orange-600" },
	[INCIDENT_SEVERITY.CRITICAL]: { label: "Critical", className: "text-brand-red" },
};

export const VIOLATION_TYPE_CATEGORY_LABEL: Record<VIOLATION_TYPE_CATEGORY, string> = {
	[VIOLATION_TYPE_CATEGORY.ACCIDENT_VIOLATION]: "Accident Violation",
	[VIOLATION_TYPE_CATEGORY.DRIVING_SAFETY_VIOLATION]: "Driving Safety Violation",
};

export const INCIDENT_SOURCE_LABEL: Record<INCIDENT_SOURCE, string> = {
	[INCIDENT_SOURCE.ADMIN]: "Admin",
	[INCIDENT_SOURCE.GEOTAB]: "GeoTab",
	[INCIDENT_SOURCE.DRIVER]: "Driver",
};

export const INCIDENT_TYPE_LABEL: Record<INCIDENT_TYPE, string> = {
	[INCIDENT_TYPE.VEHICLE_ACCIDENT]: "Vehicle Accident",
	[INCIDENT_TYPE.VEHICLE_BREAKDOWN]: "Breakdown",
	[INCIDENT_TYPE.DRIVING_SAFETY_VIOLATION]: "Driving Safety Violation",
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

export const TAB_TRIGGER_CLASS =
	"inline-flex items-center justify-center whitespace-nowrap rounded-[8px] border border-brand-dark10 px-3 py-2 text-sm font-medium transition-all data-[state=active]:bg-brand-dark data-[state=inactive]:bg-white data-[state=active]:text-white data-[state=inactive]:text-brand-dark";

export const TAB_TYPE: Record<INCIDENT_TYPE_TAB, INCIDENT_TYPE | null> = {
	[INCIDENT_TYPE_TAB.ALL]: null,
	[INCIDENT_TYPE_TAB.ACCIDENTS]: INCIDENT_TYPE.VEHICLE_ACCIDENT,
	[INCIDENT_TYPE_TAB.VIOLATIONS]: INCIDENT_TYPE.DRIVING_SAFETY_VIOLATION,
	[INCIDENT_TYPE_TAB.BREAKDOWN]: INCIDENT_TYPE.VEHICLE_BREAKDOWN,
	// Drafts is a status filter, not a type — handled separately in matchesTab.
	[INCIDENT_TYPE_TAB.DRAFTS]: null,
};

export const CLOSED_STATUSES: (INCIDENT_REPORT_STATUS | null)[] = [
	INCIDENT_REPORT_STATUS.RESOLVED,
	INCIDENT_REPORT_STATUS.REJECTED,
];

export const matchesTab = (report: IIncidentReportRow, tab: INCIDENT_TYPE_TAB) => {
	if (tab === INCIDENT_TYPE_TAB.DRAFTS) return report.status === INCIDENT_REPORT_STATUS.DRAFT;
	const typeForTab = TAB_TYPE[tab];
	return typeForTab === null || report.type === typeForTab;
};

export const toDisplayStatus = (status: INCIDENT_REPORT_STATUS): INCIDENT_REPORT_STATUS =>
	status === INCIDENT_REPORT_STATUS.PENDING_THIRD_REVIEW ? INCIDENT_REPORT_STATUS.PENDING_SECOND_REVIEW : status;

export const matchesStatusFilter = (report: IIncidentReportRow, statusFilter: INCIDENT_REPORT_STATUS[]) => {
	if (!statusFilter.length) return true;
	if (report.status === null) return false;
	return statusFilter.includes(toDisplayStatus(report.status));
};

export const TYPE_FILTER_OPTIONS = Object.values(INCIDENT_TYPE).map((value) => ({
	value,
	label: INCIDENT_TYPE_LABEL[value],
}));

export const SEVERITY_FILTER_OPTIONS = Object.values(INCIDENT_SEVERITY).map((value) => ({
	value,
	label: INCIDENT_SEVERITY_META[value].label,
}));

export const HIDDEN_STATUS_FILTERS = new Set<INCIDENT_REPORT_STATUS>([
	INCIDENT_REPORT_STATUS.DRAFT,
	INCIDENT_REPORT_STATUS.COORDINATE,
	INCIDENT_REPORT_STATUS.PENDING_THIRD_REVIEW,
	INCIDENT_REPORT_STATUS.REJECTED,
]);

export const STATUS_FILTER_OPTIONS = Object.values(INCIDENT_REPORT_STATUS)
	.filter((value) => !HIDDEN_STATUS_FILTERS.has(value))
	.map((value) => ({
		value,
		label: INCIDENT_STATUS_META[value].label,
	}));
