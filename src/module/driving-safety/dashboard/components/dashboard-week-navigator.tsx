"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import { formatWeekRangeLabel } from "../utils/week-range";

const DashboardWeekNavigator = ({
	anchorDate,
	onChange,
	onPrev,
	onNext,
}: {
	anchorDate: Date;
	onChange: (date: Date) => void;
	onPrev: () => void;
	onNext: () => void;
}) => {
	const [isCalendarOpen, setIsCalendarOpen] = useState(false);

	return (
		<div className="flex items-center gap-2 rounded-[10px] border border-brand-dark10 bg-white px-2 py-1.5">
			<button type="button" onClick={onPrev} className="rounded p-1 hover:bg-brand-bgLightgrey">
				<ChevronLeft className="h-4 w-4 text-brand-dark" />
			</button>

			<Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
				<PopoverTrigger asChild>
					<button type="button" className="min-w-[110px] text-center text-sm font-medium text-brand-dark">
						{formatWeekRangeLabel(anchorDate)}
					</button>
				</PopoverTrigger>
				<PopoverContent className="w-auto p-0" align="center">
					<Calendar
						mode="single"
						selected={anchorDate}
						onSelect={(date) => {
							if (!date) return;
							onChange(date);
							setIsCalendarOpen(false);
						}}
					/>
				</PopoverContent>
			</Popover>

			<button type="button" onClick={onNext} className="rounded p-1 hover:bg-brand-bgLightgrey">
				<ChevronRight className="h-4 w-4 text-brand-dark" />
			</button>
		</div>
	);
};

export default DashboardWeekNavigator;
