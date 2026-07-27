import React from "react";

import { Switch } from "@/components/ui/switch";
import SpecialJobExemptToggleLabel from "./special-job-exempt copy";

const SpecialJobExempt = ({
	isExempt,
	isPermissionEditable,
	handleExemptChange,
}: {
	isExempt: boolean;
	isPermissionEditable: boolean;
	handleExemptChange: (value: boolean) => void;
}) => {
	return (
		<div className="space-y-1 font-medium text-brand-dark50">
			<SpecialJobExemptToggleLabel />

			<div className="flex items-center gap-2">
				<span className={!isExempt ? "text-black" : "text-gray-400"}>Off</span>
				<Switch disabled={!isPermissionEditable} checked={isExempt} onCheckedChange={handleExemptChange} />
				<span className={isExempt ? "text-black" : "text-gray-400"}>On</span>
			</div>
		</div>
	);
};

export default SpecialJobExempt;
