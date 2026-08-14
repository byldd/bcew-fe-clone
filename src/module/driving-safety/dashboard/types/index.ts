import { INCIDENT_SEVERITY } from "../../incident-reports/utils/enums";

export interface IDrivingSafetyDashboardSummary {
	pendingReview: number;
	totalVehicleAccidents: number;
	totalVehicleBreakdowns: number;
	totalDrivingSafetyViolations: number;
	pendingSecondReview: number;
	totalDamageCost: number;
}

export interface IViolationTypeBreakdown {
	name: string;
	count: number;
}

export interface ISeverityBreakdown {
	severity: INCIDENT_SEVERITY;
	count: number;
}

export interface IDrivingSafetyDashboard {
	summary: IDrivingSafetyDashboardSummary;
	violationTypeBreakdown: IViolationTypeBreakdown[];
	severityBreakdown: ISeverityBreakdown[];
}

export interface IDashboardDateRange {
	startDate?: string;
	endDate?: string;
}
export interface IStatCardConfig {
	key: keyof IDrivingSafetyDashboardSummary;
	label: string;
	subtitle?: string;
	isCurrency?: boolean;
}

export interface IStatCardConfig {
	key: keyof IDrivingSafetyDashboardSummary;
	label: string;
	subtitle?: string;
	isCurrency?: boolean;
}
