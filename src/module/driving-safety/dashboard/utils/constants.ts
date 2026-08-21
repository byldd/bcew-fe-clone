import { INCIDENT_SEVERITY } from "../../incident-reports/utils/enums";
import { IStatCardConfig } from "../types";

const DASHBOARD_STAT_CARDS: IStatCardConfig[] = [
	{ key: "pendingReview", label: "Pending Review" },
	{ key: "totalVehicleAccidents", label: "Total Vehicle Accidents" },
	{ key: "totalVehicleBreakdowns", label: "Total Vehicle Breakdowns" },
	{ key: "totalDrivingSafetyViolations", label: "Total Driving Safety Violation" },
	{ key: "pendingSecondReview", label: "Pending 2nd Review" },
	{ key: "totalDamageCost", label: "Total Damage Cost", isCurrency: true },
];

// Legend/segment order for the severity donut — highest severity first.
const SEVERITY_ORDER: INCIDENT_SEVERITY[] = [
	INCIDENT_SEVERITY.CRITICAL,
	INCIDENT_SEVERITY.HIGH,
	INCIDENT_SEVERITY.MEDIUM,
	INCIDENT_SEVERITY.LOW,
];

const SEVERITY_LABEL: Record<INCIDENT_SEVERITY, string> = {
	[INCIDENT_SEVERITY.CRITICAL]: "Critical",
	[INCIDENT_SEVERITY.HIGH]: "High",
	[INCIDENT_SEVERITY.MEDIUM]: "Medium",
	[INCIDENT_SEVERITY.LOW]: "Low",
};

const SEVERITY_COLOR: Record<INCIDENT_SEVERITY, string> = {
	[INCIDENT_SEVERITY.CRITICAL]: "#EF4444",
	[INCIDENT_SEVERITY.HIGH]: "#6EE7B7",
	[INCIDENT_SEVERITY.MEDIUM]: "#FCD34D",
	[INCIDENT_SEVERITY.LOW]: "#FDBA74",
};

// Violation types are dynamic, so bars cycle through a fixed palette by index.
const VIOLATION_TYPE_BAR_COLORS = ["#93C5FD", "#FCD34D", "#5EEAD4", "#6EE7B7", "#22C55E", "#FDBA74"];

const RADIUS = 48;
const STROKE_WIDTH = 16;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export {
	DASHBOARD_STAT_CARDS,
	SEVERITY_ORDER,
	SEVERITY_LABEL,
	SEVERITY_COLOR,
	VIOLATION_TYPE_BAR_COLORS,
	RADIUS,
	STROKE_WIDTH,
	CIRCUMFERENCE,
};
