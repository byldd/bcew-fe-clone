export interface IDrivingSafetyViolationType {
	id: string;
	name: string;
	// null = point value not yet decided ("TBD")
	points: number | null;
	documentationRequired: string;
	policyVerbiage: string;
}

export interface IDrivingSafetyPointThreshold {
	id: string;
	consequence: string;
	points: number;
}

export interface IDrivingSafetyPolicyConfig {
	id: string;
	pointReductionPerQuarter: number;
	maxPointReductionPerYear: number;
	pointReductionVerbiage: string;
	quarterlyReward: string | null;
	annualReward: string | null;
}

export interface IDrivingSafetyPolicies {
	violationTypes: IDrivingSafetyViolationType[];
	pointThresholds: IDrivingSafetyPointThreshold[];
	config: IDrivingSafetyPolicyConfig;
}

export interface IUpdateDrivingSafetyPoliciesPayload {
	violationTypes: IDrivingSafetyViolationType[];
	pointThresholds: IDrivingSafetyPointThreshold[];
	config: Omit<IDrivingSafetyPolicyConfig, "id">;
}
