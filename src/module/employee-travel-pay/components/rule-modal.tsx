import React from "react";
import { travelPayChecks } from "../constant/travel-pay";

const RuleModal = () => {
	return (
		<div className="space-y-1">
			<ul className="list-disc space-y-2 rounded-xl px-4 py-2 text-xs">
				{travelPayChecks.map((value) => {
					return (
						<li key={value}>
							<p>{value}</p>
						</li>
					);
				})}
			</ul>
		</div>
	);
};

export default RuleModal;
