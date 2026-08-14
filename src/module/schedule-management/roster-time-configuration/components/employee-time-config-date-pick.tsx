"use client";
import React from "react";
import { addDays, subDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { useEmployeeTimeConfigParams } from "../hooks/useEmployeeTimeConfigParams";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getWeekRangeString } from "@/module/employee/utils/get-week-range-string";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const EmployeeTimeConfigDatePick = () => {
	const { getParams, setParams } = useEmployeeTimeConfigParams();
	const { startDate, endDate } = getParams;

	const goToPreviousWeek = () => {
		const newStart = subDays(startDate, 7); // go back 1 week (Sat→Fri)
		setParams({ startDate: newStart });
	};

	const goToNextWeek = () => {
		const newStart = addDays(startDate, 7); // move forward 1 week (Sat→Fri)
		setParams({ startDate: newStart });
	};

	return (
		<div className="z-20 flex h-10 items-center rounded-[10px] border border-brand-dark10 bg-white text-xl font-semibold 3xl:h-[80px]">
			<Button onClick={goToPreviousWeek} variant="ghost" size="icon" className="h-11 w-6 p-0 hover:bg-transparent">
				<ChevronLeft className="mb-0.5 h-11 w-6 font-semibold" />
			</Button>

			{/* Show Sat–Fri week range */}
			<DatePicker
				selected={startDate}
				onChange={(date) => {
					if (date) {
						setParams({ startDate: date });
					}
				}}
				popperPlacement="bottom-start"
				customInput={
					<Button variant="ghost" className="px-1 text-xs font-medium hover:bg-transparent 3xl:text-xl">
						{getWeekRangeString(startDate, endDate)}
					</Button>
				}
			/>

			<Button onClick={goToNextWeek} variant="ghost" size="icon" className="h-11 w-6 p-0 hover:bg-transparent">
				<ChevronRight className="mb-0.5 h-11 w-6 font-semibold" />
			</Button>
		</div>
	);
};

export default EmployeeTimeConfigDatePick;
