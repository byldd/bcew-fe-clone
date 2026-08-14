"use client";

import { IoCarOutline } from "react-icons/io5";
import { MdOutlineBugReport } from "react-icons/md";
import { LuChevronRight } from "react-icons/lu";

import { routes } from "@/config/routes";
import { cn } from "@/lib/utils/utils";

interface VehicleIssueChoiceListProps {
	onSelect: (path: string) => void;
}

const VEHICLE_ISSUE_CHOICES = [
	{
		label: "Report Vehicle Accident",
		description: "Collision, damage, or injury involving a vehicle",
		icon: <IoCarOutline size={22} />,
		iconBg: "bg-[#F01D1D1A]",
		iconColor: "text-brand-red800",
		path: routes.employee.reportVehicleAccident,
	},
	{
		label: "Report Vehicle Breakdown",
		description: "Vehicle won't start, stalled, or mechanical failure",
		icon: <MdOutlineBugReport size={22} />,
		iconBg: "bg-orange-50",
		iconColor: "text-orange-500",
		path: routes.employee.reportVehicleBreakdown,
	},
];

const VehicleIssueChoiceList = ({ onSelect }: VehicleIssueChoiceListProps) => {
	return (
		<div className="space-y-3 pt-2">
			{VEHICLE_ISSUE_CHOICES.map((choice) => (
				<button
					key={choice.path}
					type="button"
					onClick={() => onSelect(choice.path)}
					className="flex w-full items-center gap-3 rounded-[10px] border bg-white p-4 text-left transition-colors hover:bg-brand-bgLightgrey"
				>
					<span
						className={cn(
							"flex size-10 shrink-0 items-center justify-center rounded-full",
							choice.iconBg,
							choice.iconColor
						)}
					>
						{choice.icon}
					</span>
					<span className="flex-1">
						<span className="block text-sm font-medium text-brand-dark">{choice.label}</span>
						<span className="block text-xs text-brand-dark60">{choice.description}</span>
					</span>
					<LuChevronRight size={18} className="shrink-0 text-brand-dark60" />
				</button>
			))}
		</div>
	);
};

export default VehicleIssueChoiceList;
