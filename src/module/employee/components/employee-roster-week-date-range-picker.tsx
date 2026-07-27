"use client";

import React from "react";
import { addDays, subDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getWeekRangeString } from "@/module/employee/utils/get-week-range-string";
import { getWeekRangeForDate } from "../utils";

interface EmployeeRosterWeekDateRangePickerProps {
	startDate: Date;
	endDate: Date;
	onWeekChange: (startDate: Date, endDate: Date) => void;
}

const EmployeeRosterWeekDateRangePicker = ({
	startDate,
	endDate,
	onWeekChange,
}: EmployeeRosterWeekDateRangePickerProps) => {
	const goToPreviousWeek = () => {
		const newStart = subDays(startDate, 7);
		const { startDate: newWeekStart, endDate: newWeekEnd } = getWeekRangeForDate(newStart);
		onWeekChange(newWeekStart, newWeekEnd);
	};

	const goToNextWeek = () => {
		const newStart = addDays(startDate, 7);
		const { startDate: newWeekStart, endDate: newWeekEnd } = getWeekRangeForDate(newStart);
		onWeekChange(newWeekStart, newWeekEnd);
	};

	return (
		<div className="z-20 flex h-10 items-center rounded-[10px] border border-brand-dark10 bg-white text-xl font-semibold 3xl:h-[80px]">
			<Button onClick={goToPreviousWeek} variant="ghost" size="icon" className="h-8 w-8 hover:bg-transparent">
				<ChevronLeft size={16} className="mb-0.5 h-11 w-6 font-semibold" />
			</Button>

			{/* Display Sat → Fri range */}
			<Button variant="ghost" className="px-1 text-sm font-medium hover:bg-transparent 3xl:text-xl">
				{getWeekRangeString(startDate, endDate)}
			</Button>

			<Button onClick={goToNextWeek} variant="ghost" size="icon" className="h-8 w-8 hover:bg-transparent">
				<ChevronRight size={16} className="mb-0.5 h-11 w-6 font-semibold" />
			</Button>
		</div>
	);
};

export default EmployeeRosterWeekDateRangePicker;
