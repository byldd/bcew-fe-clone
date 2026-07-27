"use client";
import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { IGetWeekendWorksResponse } from "../types/schedule-config";
import { toFormattedDate } from "@/lib/utils/date";
import { DATE_FORMAT } from "@/types/date";
import { formatSnakeCase } from "@/lib/utils/value-formatter";
import { buildEmployeeSummary } from "../utils/weekend-config";

interface WeekendHistoryPrimaryRowProps {
	row: IGetWeekendWorksResponse["data"][number];
	isExpanded: boolean;
	onToggle: () => void;
}

const WeekendHistoryPrimaryRow: React.FC<WeekendHistoryPrimaryRowProps> = ({ row, isExpanded, onToggle }) => {
	const employeeSummary = buildEmployeeSummary(row.userWeekendWorks);
	const dayLabel = toFormattedDate(row.date, DATE_FORMAT.WEEK_DAY);

	return (
		<TableRow
			className={`h-16 cursor-pointer transition-colors ${isExpanded ? "bg-white" : "hover:bg-gray-50"}`}
			onClick={onToggle}
		>
			{/* Date */}
			<TableCell className="border-b border-r text-left text-sm font-medium text-brand-dark">
				{toFormattedDate(row.date)}
			</TableCell>

			{/* Day */}
			<TableCell className="border-b border-r text-center text-sm font-medium text-brand-dark">{dayLabel}</TableCell>

			{/* Scheduled By */}
			<TableCell className="border-b border-r text-center text-sm font-medium text-brand-dark">
				{formatSnakeCase(row.scheduleByMode)}
			</TableCell>

			{/* Members Required */}
			<TableCell className="border-b border-r text-center text-sm font-medium text-brand-dark">
				{row.requiredMemberCount || "-"}
			</TableCell>

			{/* Employees Working */}
			<TableCell colSpan={2} className="border-b border-r text-center text-sm font-medium text-brand-dark">
				<div className="flex flex-col items-center gap-0.5 leading-tight">
					<span>{employeeSummary?.split("(")[0]?.trim()}</span>
					{employeeSummary.includes("(") && (
						<span className="text-xs font-medium text-brand-dark50">({employeeSummary.split("(")[1]}</span>
					)}
				</div>
			</TableCell>

			<TableCell
				className="border-b text-center"
				onClick={(e) => {
					e.stopPropagation();
					onToggle();
				}}
			>
				<div className="flex items-center justify-center">
					<Button variant="ghost" size="sm" type="button" aria-label={isExpanded ? "Collapse row" : "Expand row"}>
						{isExpanded ? (
							<ChevronUp className="h-5 w-5 text-brand-dark" />
						) : (
							<ChevronDown className="h-5 w-5 text-brand-dark" />
						)}
					</Button>
				</div>
			</TableCell>
		</TableRow>
	);
};

export default WeekendHistoryPrimaryRow;
