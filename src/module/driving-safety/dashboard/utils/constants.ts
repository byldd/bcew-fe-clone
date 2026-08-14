import { INCIDENT_SEVERITY } from "../../incident-reports/utils/enums";
import { IStatCardConfig } from "../types";

const DASHBOARD_STAT_CARDS: IStatCardConfig[] = [
	{ key: "pendingReview", label: "Pending Review" },
	{ key: "totalVehicleAccidents", label: "Total Vehicle Accidents" },
	{ key: "totalVehicleBreakdowns", label: "Total Vehicle Breakdowns" },
	{ key: "totalDrivingSafetyViolations", label: "Total Driving Safety Violation" },
	{ key: "pendingSecondReview", label: "Pending 2nd review" },
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
	[INCIDENT_SEVERITY.HIGH]: "#F97316",
	[INCIDENT_SEVERITY.MEDIUM]: "#F59E0B",
	[INCIDENT_SEVERITY.LOW]: "#22C55E",
};

// Violation types are dynamic, so bars cycle through a fixed palette by index.
const VIOLATION_TYPE_BAR_COLORS = ["#2563EB", "#FCD34D", "#FCA5A5", "#FCD34D", "#22C55E", "#A855F7"];

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
