"use client";

import React, { useState } from "react";

import { IDrivingSafetyViolationType } from "@/module/driving-safety/policies/types";

import PolicyViolationTypeRow from "./policy-violation-type-row";

const PolicyViolationTypesCard = ({ violationTypes }: { violationTypes: IDrivingSafetyViolationType[] }) => {
	const [expandedId, setExpandedId] = useState<string | null>(null);

	return (
		<section className="space-y-2 rounded-[8px] border bg-white p-4">
			<div className="space-y-1">
				<h4 className="text-sm font-medium text-brand-dark">Violation Types &amp; Points</h4>
				<p className="text-xs text-brand-grey">Tap a type to see points and the documents it needs.</p>
			</div>

			<ul className="space-y-2">
				{violationTypes.map((violationType) => (
					<PolicyViolationTypeRow
						key={violationType.id}
						violationType={violationType}
						isExpanded={expandedId === violationType.id}
						onToggle={() => setExpandedId(expandedId === violationType.id ? null : violationType.id)}
					/>
				))}
			</ul>
		</section>
	);
};

export default PolicyViolationTypesCard;
