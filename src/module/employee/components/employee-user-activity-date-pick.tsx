import React from "react";
import DatePicker from "react-datepicker";
import { addDays, subDays } from "date-fns";
import "react-datepicker/dist/react-datepicker.css";
import { Button } from "@/components/ui/button";
import { useUserActivityParams } from "@/module/employee/hooks/useUserActivityParams";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getWeekRangeString } from "@/module/employee/utils/get-week-range-string";

const UserActivityDatePick = () => {
	const { startDate, endDate, setParams } = useUserActivityParams();

	const goToPreviousWeek = () => {
		const newStart = subDays(startDate, 7);
		setParams(newStart);
	};

	const goToNextWeek = () => {
		const newStart = addDays(endDate, 1);
		setParams(newStart);
	};

	return (
		<div className="flex h-10 items-center gap-1 rounded-[8px] border-none bg-white px-0 text-sm shadow-md">
			<Button onClick={goToPreviousWeek} variant={"ghost"} size={"icon"} className="h-6 w-6 hover:bg-transparent">
				<ChevronLeft size={16} className="!h-6 !w-6" />
			</Button>

			<DatePicker
				selected={startDate}
				onChange={(date) => {
					if (date) setParams(date);
				}}
				customInput={
					<Button variant="ghost" className="px-2 text-sm font-medium hover:bg-transparent">
						{getWeekRangeString(startDate, endDate)}
					</Button>
				}
			/>

			<Button onClick={goToNextWeek} variant={"ghost"} size={"icon"} className="h-6 w-6 hover:bg-transparent">
				<ChevronRight size={16} className="!h-6 !w-6" />
			</Button>
		</div>
	);
};

export default UserActivityDatePick;
