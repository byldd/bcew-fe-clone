import React from "react";
import DatePicker from "react-datepicker";
import { addDays, subDays } from "date-fns";
import "react-datepicker/dist/react-datepicker.css";
import { Button } from "@/components/ui/button";
import { useTimeLogsParams } from "../hooks/useTimeLogsParams";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toFormattedDate } from "@/lib/utils/date";
import { DATE_FORMAT } from "@/types/date";

const DatePickModal = () => {
	const { getParams, setParams } = useTimeLogsParams();
	const { startDate } = getParams();

	const goToPreviousDay = () => {
		setParams({ startDate: subDays(startDate, 1) });
	};

	const goToNextDay = () => {
		setParams({ startDate: addDays(startDate, 1) });
	};

	return (
		<div className="z-20 flex h-10 items-center rounded-[10px] border border-brand-dark10 bg-white text-xl font-semibold 3xl:h-[80px]">
			<Button onClick={goToPreviousDay} variant={"ghost"} size={"icon"} className="h-11 w-6 p-0 hover:bg-transparent">
				<ChevronLeft className="mb-0.5 h-11 w-6 font-semibold" />
			</Button>
			<DatePicker
				selected={startDate}
				onChange={(date) => {
					if (date) {
						setParams({ startDate: date });
					}
				}}
				popperPlacement="bottom-start"
				customInput={
					<Button variant="ghost" className="px-1 text-sm font-medium hover:bg-transparent 3xl:text-xl">
						{toFormattedDate(startDate, DATE_FORMAT.MM_SLASH_DD_YYYY)}
					</Button>
				}
			/>
			<Button onClick={goToNextDay} variant={"ghost"} size={"icon"} className="h-11 w-6 p-0 hover:bg-transparent">
				<ChevronRight className="mb-0.5 h-11 w-6 font-semibold" />
			</Button>
		</div>
	);
};

export default DatePickModal;
