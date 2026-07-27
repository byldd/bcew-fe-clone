"use client";

import React from "react";

import BackButton from "@/components/common/back-button";
import { POLICY_NAME } from "@/module/driving-safety/policies/utils/constants";

import PolicyPointReductionCard from "../components/policy-point-reduction-card";
import PolicyThresholdsCard from "../components/policy-thresholds-card";
import PolicyViolationTypesCard from "../components/policy-violation-types-card";
import { useDrivingSafetyPolicies } from "../hooks/useDrivingSafetyPolicies";

const SafetyPoliciesTemplate = () => {
	const { data, isPending, isError } = useDrivingSafetyPolicies();

	return (
		<div className="flex h-screen w-full flex-col bg-brand-bgLightgrey">
			<div className="shrink-0 space-y-3 p-4 pb-0">
				<div className="ml-[-10px] flex items-center gap-1">
					<BackButton />
					<h3 className="text-xl font-medium">Safety Policies</h3>
				</div>
			</div>

			<div className="flex-1 space-y-3 overflow-y-auto p-4">
				{isPending && <p className="text-sm text-brand-grey">Loading policies...</p>}

				{isError && (
					<p className="text-sm text-brand-red">Could not load the driving safety policy. Please try again.</p>
				)}

				{data && (
					<>
						<p className="text-xs text-brand-dark">
							These are the point values and rules under the{" "}
							<span className="font-semibold text-brand-dark">{POLICY_NAME}</span>. Points are assigned by a reviewer
							after each violation.
						</p>

						<PolicyThresholdsCard pointThresholds={data.pointThresholds} />
						<PolicyViolationTypesCard violationTypes={data.violationTypes} />
						<PolicyPointReductionCard config={data.config} />
					</>
				)}
			</div>
		</div>
	);
};

export default SafetyPoliciesTemplate;
