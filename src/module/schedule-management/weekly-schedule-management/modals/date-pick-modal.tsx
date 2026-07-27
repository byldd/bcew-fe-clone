import React from "react";
import DatePicker from "react-datepicker";
import { addDays, subDays } from "date-fns";
import "react-datepicker/dist/react-datepicker.css";
import { Button } from "@/components/ui/button";
import { useScheduleParams } from "../hooks/useScheduleParams";
import { getWeekRange } from "../utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useScheduleContext } from "../context/schedule-context";

const DatePickModal = () => {
	const { getParams, setParams } = useScheduleParams();
	const { startDate } = getParams();
	const { dataOfWeek } = useScheduleContext();

	const goToPreviousDay = () => {
		setParams({ startDate: subDays(startDate, 1) });
	};

	const goToNextDay = () => {
		setParams({ startDate: addDays(startDate, 1) });
	};

	const calendarStartDate = dataOfWeek.at(0)?.date;
	const calendarEndDate = dataOfWeek.at(-1)?.date;

	return (
		<div className="z-20 flex h-10 items-center rounded-[10px] border border-brand-dark10 bg-white text-xl font-semibold 3xl:h-[80px]">
			<Button onClick={goToPreviousDay} variant={"ghost"} size={"icon"} className="h-6 w-6 p-0 hover:bg-transparent">
				<ChevronLeft className="h-6 w-6 font-semibold" />
			</Button>

			<DatePicker
				selected={startDate}
				onChange={(date) => {
					if (date) {
						setParams({ startDate: date });
					}
				}}
				wrapperClassName="flex"
				popperPlacement="bottom-start"
				popperClassName="!z-[9999]"
				showPopperArrow={false}
				customInput={
					<Button variant="ghost" className="px-1 text-sm font-medium hover:bg-transparent 3xl:text-xl">
						{startDate && calendarStartDate && calendarEndDate
							? getWeekRange(calendarStartDate, calendarEndDate)
							: "Select a date"}
					</Button>
				}
			/>

			<Button onClick={goToNextDay} variant={"ghost"} size={"icon"} className="h-6 w-6 p-0 hover:bg-transparent">
				<ChevronRight className="h-6 w-6 font-semibold" />
			</Button>
		</div>
	);
};

export default DatePickModal;
