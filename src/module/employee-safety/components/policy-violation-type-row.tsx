import { ChevronDown, ChevronUp } from "lucide-react";
import React from "react";

import { IDrivingSafetyViolationType } from "@/module/driving-safety/policies/types";

import { formatPoints, toRequiredDocs } from "../utils/driving-safety-policies";

interface PolicyViolationTypeRowProps {
	violationType: IDrivingSafetyViolationType;
	isExpanded: boolean;
	onToggle: () => void;
}

const PolicyViolationTypeRow = ({ violationType, isExpanded, onToggle }: PolicyViolationTypeRowProps) => {
	const requiredDocs = toRequiredDocs(violationType.documentationRequired);

	return (
		<li className="rounded-xl border border-brand-dark10 bg-white">
			<button type="button" onClick={onToggle} className="flex w-full items-center gap-3 p-3 text-left">
				<span className="flex-1 text-sm text-brand-dark">{violationType.name}</span>

				<span className="shrink-0 rounded-full border border-[#F0DCA8] bg-[#FFF8E7] px-3 py-0.5 text-xs font-medium text-[#9A6A00]">
					{formatPoints(violationType.points)}
				</span>

				{isExpanded ? (
					<ChevronUp size={16} className="shrink-0 text-brand-grey" />
				) : (
					<ChevronDown size={16} className="shrink-0 text-brand-grey" />
				)}
			</button>

			{isExpanded && (
				<div className="space-y-1 border-t border-brand-dark10 p-3">
					<p className="text-xs text-brand-grey">{violationType.policyVerbiage}</p>

					{requiredDocs.length > 0 && (
						<div className="flex flex-wrap items-center justify-between gap-2">
							<span className="text-xs text-brand-grey">Required docs</span>

							<div className="flex flex-wrap justify-end gap-2">
								{requiredDocs.map((doc) => (
									<span
										key={doc}
										className="rounded-[4px] bg-brand-bgLightgrey px-2 py-1 text-xs capitalize text-brand-dark"
									>
										{doc}
									</span>
								))}
							</div>
						</div>
					)}
				</div>
			)}
		</li>
	);
};

export default PolicyViolationTypeRow;
