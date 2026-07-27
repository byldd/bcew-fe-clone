import { ArrowDown, Circle } from "lucide-react";
import React from "react";

import { IDrivingSafetyPolicyConfig } from "@/module/driving-safety/policies/types";

const PolicyPointReductionCard = ({ config }: { config: IDrivingSafetyPolicyConfig }) => (
	<section className="rounded-[8px] border bg-white shadow-sm">
		<h4 className="px-4 py-3 text-sm font-medium text-brand-dark">Point Reduction</h4>

		<ul>
			<li className="flex items-center gap-3 border-t border-brand-dark10 px-4 py-3">
				<span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#E9F7EE]">
					<ArrowDown size={14} className="text-[#12873D]" />
				</span>
				<p className="text-sm text-brand-dark">
					{config.pointReductionPerQuarter} point removed each quarter with no violations.
				</p>
			</li>

			<li className="flex items-center gap-3 border-t border-brand-dark10 px-4 py-3">
				<span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#E9F7EE]">
					<Circle size={8} className="fill-brand-green10 text-[#12873D]" />
				</span>
				<p className="text-sm text-brand-dark">Maximum {config.maxPointReductionPerYear} points reduced per year.</p>
			</li>

			<li className="border-t border-brand-dark10 px-4 py-3">
				<p className="text-xs text-brand-grey">{config.pointReductionVerbiage}</p>
			</li>
		</ul>
	</section>
);

export default PolicyPointReductionCard;
