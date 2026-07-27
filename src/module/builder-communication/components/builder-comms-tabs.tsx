"use client";

import { BUILDER_COMMS_TAB, BuilderCommsTabConfig } from "../types";

type Props = {
	activeTab: BUILDER_COMMS_TAB;
	onChange: (tab: BUILDER_COMMS_TAB) => void;
	tabs: BuilderCommsTabConfig[];
};

export default function BuilderCommsTabs({ activeTab, onChange, tabs }: Props) {
	return (
		<div className="flex items-center gap-2 pb-2">
			{tabs.map((tab) => (
				<button
					key={tab.id}
					onClick={() => onChange(tab.id)}
					className={`h-10 rounded-[8px] px-4 text-sm font-medium ${
						activeTab === tab.id ? "bg-black text-white" : "border bg-white text-gray-600"
					}`}
				>
					{tab.label}
				</button>
			))}
		</div>
	);
}
