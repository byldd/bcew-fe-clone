import { useState } from "react";
import { groupContinuousDates, groupContinuousShortDates } from "@/module/employee/utils/group-continuous-dates";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { PTORequestCellProps } from "@/module/employee/types";

export const PTORequestCell: React.FC<PTORequestCellProps> = ({ dates }) => {
	const [open, setOpen] = useState(false);

	const shortDates = groupContinuousShortDates(dates);
	const isOverflow = shortDates.length > 3;
	const displayDates = shortDates.slice(0, 3).join(", ");

	const groupedFullDates = groupContinuousDates(dates);

	return (
		<div>
			<span>{displayDates || "-"}</span>
			{isOverflow && (
				<Popover open={open} onOpenChange={setOpen}>
					<div onClick={(e) => e.stopPropagation()}>
						<PopoverTrigger asChild>
							<span className="block cursor-pointer text-xs text-blue-500">View More</span>
						</PopoverTrigger>
						<PopoverContent className="w-[220px] text-xs">
							<p className="mb-2 font-semibold text-muted-foreground">All PTO Requests</p>
							<ul className="list-disc pl-4">
								{groupedFullDates.map((date, idx) => (
									<li key={idx}>{date}</li>
								))}
							</ul>
						</PopoverContent>
					</div>
				</Popover>
			)}
		</div>
	);
};
