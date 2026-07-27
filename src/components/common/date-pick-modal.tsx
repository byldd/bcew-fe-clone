import React from "react";
import { addDays, subDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { dateToUTCString, getTodayDate, toDate } from "@/lib/utils/date";
import { DatePicker } from "../ui/date-picker";

const DatePickModal = ({
	value,
	onChange,
	allowClear = false,
}: {
	value?: string;
	onChange?: (date: string | undefined) => void;
	allowClear?: boolean;
}) => {
	const selectedDate = value ? toDate(value) : undefined;
	const goToPreviousDay = () => {
		const newDate = subDays(selectedDate ?? getTodayDate(), 1);
		onChange?.(dateToUTCString(newDate));
	};

	const goToNextDay = () => {
		const nextDate = addDays(selectedDate ?? getTodayDate(), 1);
		onChange?.(dateToUTCString(nextDate));
	};

	return (
		<div className="flex h-10 items-center gap-1 rounded-[8px] bg-white px-0 text-sm shadow-md">
			<Button onClick={goToPreviousDay} variant={"ghost"} size={"icon"} className="h-6 w-6 hover:bg-transparent">
				<ChevronLeft className="!h-6 !w-6 font-medium" />
			</Button>

			<div className="flex items-center gap-1">
				<DatePicker
					className="border-none bg-white px-0 hover:bg-white"
					value={selectedDate}
					onChange={(date) => onChange?.(dateToUTCString(date))}
				/>
				{selectedDate && allowClear && (
					<X
						size={14}
						onClick={(e) => {
							e.stopPropagation();
							e.preventDefault();
							onChange?.(undefined);
						}}
					/>
				)}
			</div>

			<Button onClick={goToNextDay} variant={"ghost"} size={"icon"} className="h-6 w-6 hover:bg-transparent">
				<ChevronRight className="!h-6 !w-6 font-medium" />
			</Button>
		</div>
	);
};

export default DatePickModal;
