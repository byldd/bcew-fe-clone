import { FileText } from "lucide-react";
import React from "react";

import { POLICY_HANDBOOK } from "@/module/driving-safety/policies/utils/constants";

const PolicyHandbookCard = () => (
	<section className="rounded-xl bg-white p-4 shadow-sm">
		<h4 className="mb-3 text-sm font-medium text-brand-dark">Official Handbook</h4>

		<div className="flex items-center gap-3">
			<FileText className="text-brand-red" size={20} />
			<span className="flex-1 text-sm text-brand-dark">{POLICY_HANDBOOK.title}</span>
			<a
				href={POLICY_HANDBOOK.url}
				target="_blank"
				rel="noopener noreferrer"
				className="text-sm font-medium text-blue-600"
			>
				View
			</a>
		</div>
	</section>
);

export default PolicyHandbookCard;
