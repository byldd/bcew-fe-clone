"use client";

import { cn } from "@/lib/utils/utils";
import { MapPin } from "lucide-react";
import { IMapEmployee } from "../types/zone";

const EMPLOYEE_COLOR = "#3B82F6";

interface EmployeeCardProps {
	employee: IMapEmployee;
	isSelected: boolean;
	onClick: () => void;
}

const EmployeeCard = ({ employee, isSelected, onClick }: EmployeeCardProps) => {
	return (
		<div
			onClick={onClick}
			className={cn(
				"flex cursor-pointer overflow-hidden rounded-lg border bg-white transition-all hover:shadow-md",
				isSelected ? "border-[#3B82F6] shadow-md" : "border-grey-400"
			)}
		>
			{/* Left colored strip */}
			<div
				className="flex w-28 flex-shrink-0 flex-col justify-end p-3"
				style={{ backgroundColor: EMPLOYEE_COLOR + "CC" }}
			>
				<span className="line-clamp-4 text-sm font-bold leading-tight text-white drop-shadow">
					{employee.user.name}
				</span>
			</div>

			{/* Right content */}
			<div className="flex flex-1 flex-col justify-between p-4">
				<div className="space-y-1">
					<div className="flex items-center gap-1.5">
						<div className="h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ backgroundColor: EMPLOYEE_COLOR }} />
						<span className="text-xs font-medium text-brand-grey">Employee</span>
					</div>
					<h3 className="line-clamp-1 text-sm font-semibold text-brand-black">{employee.user.name}</h3>
					{employee.address && <p className="line-clamp-1 text-xs text-brand-lightgrey">{employee.address}</p>}
				</div>

				<div className="mt-3 flex items-center justify-end">
					<button
						className={cn(
							"flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors",
							isSelected ? "text-white" : "bg-grey-100 text-brand-grey"
						)}
						style={isSelected ? { backgroundColor: EMPLOYEE_COLOR } : undefined}
					>
						<MapPin size={11} />
						{isSelected ? "Focused" : "Focus"}
					</button>
				</div>
			</div>
		</div>
	);
};

export default EmployeeCard;
