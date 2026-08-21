import { ChevronDown, ChevronUp } from "lucide-react";
import { TableCell, TableRow } from "@/components/ui/table";
import { IWeekReportEntry } from "../types";
import { getActualHours, getScheduledHours, getTravelMiles } from "../utils";

const WeekReportPrimaryRow = ({
	entry,
	isExpanded,
	onToggle,
}: {
	entry: IWeekReportEntry;
	isExpanded: boolean;
	onToggle: () => void;
}) => {
	return (
		<TableRow
			className={`h-14 cursor-pointer transition-colors ${isExpanded ? "bg-white" : "hover:bg-gray-50"}`}
			onClick={onToggle}
		>
			<TableCell className="text-left text-sm text-brand-dark50">{entry.employeeNum}</TableCell>
			<TableCell className="text-left text-sm font-semibold text-brand-dark">
				{entry.lastName ?? entry.userName}
			</TableCell>
			<TableCell className="text-left text-sm text-brand-dark">{entry.firstName ?? "-"}</TableCell>
			<TableCell className="text-left text-sm text-brand-dark50">{entry.middleInitial ?? "-"}</TableCell>
			<TableCell className="text-left text-sm text-brand-dark">{getScheduledHours(entry).toFixed(1)} hrs</TableCell>
			<TableCell className="text-left text-sm text-brand-dark">{getActualHours(entry).toFixed(1)} hrs</TableCell>
			<TableCell className="text-left text-sm text-brand-dark">{getTravelMiles(entry).toFixed(2)} mi</TableCell>
			<TableCell className="text-right">
				{isExpanded ? (
					<ChevronUp className="ml-auto h-4 w-4 text-brand-dark" />
				) : (
					<ChevronDown className="ml-auto h-4 w-4 text-brand-dark" />
				)}
			</TableCell>
		</TableRow>
	);
};

export default WeekReportPrimaryRow;
