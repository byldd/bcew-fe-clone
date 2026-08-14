import { z } from "zod";

import { VIOLATION_TYPE_CATEGORY } from "@/module/driving-safety/incident-reports/utils/enums";
import { IDrivingSafetyPolicies, IUpdateDrivingSafetyPoliciesPayload } from "../types";

// Numeric fields are held as strings while editing so the inputs can be cleared;
// an empty points value on a violation type means "TBD".
const requiredText = (label: string) => z.string().trim().min(1, `${label} is required`);
const requiredNumber = z.string().regex(/^\d+$/, "Enter a whole number");
const optionalNumber = z.string().regex(/^\d*$/, "Enter a whole number, or leave blank for TBD");

export const policiesSchema = z.object({
	violationTypes: z.array(
		z.object({
			id: z.string(),
			name: requiredText("Type"),
			points: optionalNumber,
			documentationRequired: requiredText("Documentation"),
			policyVerbiage: requiredText("Policy verbiage"),
			categories: z.array(z.nativeEnum(VIOLATION_TYPE_CATEGORY)),
		})
	),
	pointThresholds: z.array(
		z.object({
			id: z.string(),
			consequence: requiredText("Consequence"),
			points: requiredNumber,
		})
	),
	config: z.object({
		pointReductionPerQuarter: requiredNumber,
		maxPointReductionPerYear: requiredNumber,
		pointReductionVerbiage: requiredText("Policy verbiage"),
		quarterlyReward: z.string().trim(),
		annualReward: z.string().trim(),
	}),
});

export type IPoliciesSchema = z.infer<typeof policiesSchema>;

export const toPoliciesFormValues = (policies: IDrivingSafetyPolicies): IPoliciesSchema => ({
	violationTypes: policies.violationTypes.map((violationType) => ({
		...violationType,
		points: violationType.points === null ? "" : String(violationType.points),
	})),
	pointThresholds: policies.pointThresholds.map((threshold) => ({
		...threshold,
		points: String(threshold.points),
	})),
	config: {
		pointReductionPerQuarter: String(policies.config.pointReductionPerQuarter),
		maxPointReductionPerYear: String(policies.config.maxPointReductionPerYear),
		pointReductionVerbiage: policies.config.pointReductionVerbiage,
		quarterlyReward: policies.config.quarterlyReward ?? "",
		annualReward: policies.config.annualReward ?? "",
	},
});

export const toPoliciesPayload = (values: IPoliciesSchema): IUpdateDrivingSafetyPoliciesPayload => ({
	violationTypes: values.violationTypes.map((violationType) => ({
		...violationType,
		points: violationType.points === "" ? null : Number(violationType.points),
	})),
	pointThresholds: values.pointThresholds.map((threshold) => ({
		...threshold,
		points: Number(threshold.points),
	})),
	config: {
		pointReductionPerQuarter: Number(values.config.pointReductionPerQuarter),
		maxPointReductionPerYear: Number(values.config.maxPointReductionPerYear),
		pointReductionVerbiage: values.config.pointReductionVerbiage,
		quarterlyReward: values.config.quarterlyReward || null,
		annualReward: values.config.annualReward || null,
	},
});
