import React from "react";
import { SUB_CONTRACTOR_CREW_STATUS } from "../types";
import { Button } from "@/components/ui/button";

const CrewStatusTab = ({
	activeTab,
	onChange,
}: {
	activeTab: SUB_CONTRACTOR_CREW_STATUS;
	onChange: (tab: SUB_CONTRACTOR_CREW_STATUS) => void;
}) => {
	return (
		<div className="flex items-center gap-2">
			{Object.values(SUB_CONTRACTOR_CREW_STATUS).map((tab) => (
				<Button
					className="h-10 capitalize"
					key={tab}
					variant={activeTab === tab ? "filled" : "outline"}
					onClick={() => onChange(tab)}
				>
					{tab}
				</Button>
			))}
		</div>
	);
};

export default CrewStatusTab;
