import React from "react";
import DatePicker from "react-datepicker";
import { addDays, subDays } from "date-fns";
import "react-datepicker/dist/react-datepicker.css";
import { Button } from "@/components/ui/button";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { getWeekRange } from "@/module/schedule-management/weekly-schedule-management/utils";
import { toDate } from "@/lib/utils/date";

export enum DATE_PICK_APPLY_TO {
	START_DATE,
	END_DATE,
}

const DateRangePickModal = ({
	startDate,
	endDate,
	onChange,
	dayRange = 7,
	onMoveBack,
	onMoveForward,
	selectApplyTo = DATE_PICK_APPLY_TO.START_DATE,
}: {
	startDate: Date | string;
	endDate: Date | string;
	onChange?: (startDate: Date, endDate: Date) => void;
	dayRange?: number;
	selectApplyTo?: DATE_PICK_APPLY_TO;
	onMoveBack?: (startDate: Date, endDate: Date) => void;
	onMoveForward?: (startDate: Date, endDate: Date) => void;
}) => {
	const goToPreviousDay = () => {
		onMoveBack?.(subDays(startDate, dayRange), subDays(endDate, dayRange));
	};

	const goToNextDay = () => {
		onMoveForward?.(addDays(startDate, dayRange), addDays(endDate, dayRange));
	};

	return (
		<div className="z-20 flex h-9 items-center rounded-[10px] border border-brand-dark10 bg-white text-xl font-semibold 3xl:h-[80px]">
			<Button onClick={goToPreviousDay} variant={"ghost"} size={"icon"} className="h-8 w-8 hover:bg-transparent">
				<ChevronLeft className="mb-0.5 h-11 w-6 font-semibold" />
			</Button>

			<DatePicker
				selected={toDate(startDate)}
				onChange={(date) => {
					if (date) {
						if (selectApplyTo == DATE_PICK_APPLY_TO.START_DATE) {
							onChange?.(date, addDays(date, dayRange));
						} else {
							onChange?.(subDays(date, dayRange), date);
						}
					}
				}}
				showPopperArrow={false}
				popperPlacement="bottom-end"
				portalId="datepicker-portal"
				popperProps={{ strategy: "fixed" }}
				wrapperClassName="flex"
				customInput={
					<Button variant="ghost" className="px-1 text-sm font-medium hover:bg-transparent 3xl:text-xl">
						{startDate ? getWeekRange(toDate(startDate), toDate(endDate)) : "Select a date"}
					</Button>
				}
			/>

			<Button onClick={goToNextDay} variant={"ghost"} size={"icon"} className="h-11 w-6 p-0 hover:bg-transparent">
				<ChevronRight className="mb-0.5 h-11 w-6 font-semibold" />
			</Button>
		</div>
	);
};

export default DateRangePickModal;
