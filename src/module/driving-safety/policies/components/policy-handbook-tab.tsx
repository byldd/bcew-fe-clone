import { ArrowUpRight, FileText } from "lucide-react";
import React from "react";

import { POLICY_HANDBOOK } from "../utils/constants";

const PolicyHandbookTab = () => (
	<section className="rounded-xl border border-brand-dark10 bg-white p-4">
		<h4 className="mb-3 text-sm font-medium text-brand-dark">Policy Handbook</h4>

		<a
			href={POLICY_HANDBOOK.url}
			target="_blank"
			rel="noopener noreferrer"
			className="flex items-center gap-3 rounded-[10px] bg-brand-bgLightgrey p-4 transition-colors hover:bg-brand-silver"
		>
			<FileText className="text-brand-red" size={20} />
			<span className="flex-1 text-sm text-brand-dark">{POLICY_HANDBOOK.title}</span>
			<ArrowUpRight size={16} />
		</a>
	</section>
);

export default PolicyHandbookTab;
