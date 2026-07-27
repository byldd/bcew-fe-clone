import React from "react";

import { IDrivingSafetyPointThreshold } from "@/module/driving-safety/policies/types";

const PolicyThresholdsCard = ({ pointThresholds }: { pointThresholds: IDrivingSafetyPointThreshold[] }) => (
	<section className="rounded-[8px] border bg-white shadow-sm">
		<h4 className="px-4 py-3 text-sm font-medium text-brand-dark">Points Thresholds</h4>

		<ul className="divide-y divide-brand-dark10">
			{pointThresholds.map((threshold) => (
				<li key={threshold.id} className="flex items-center justify-between gap-4 px-4 py-3">
					<p className="text-sm font-medium text-brand-dark">{threshold.consequence}</p>

					<div className="flex shrink-0 items-baseline gap-1">
						<span className="text-lg font-semibold text-brand-dark">{threshold.points ?? "TBD"}</span>
						<span className="text-[10px] font-medium uppercase tracking-wide text-brand-grey">Points</span>
					</div>
				</li>
			))}
		</ul>
	</section>
);

export default PolicyThresholdsCard;
