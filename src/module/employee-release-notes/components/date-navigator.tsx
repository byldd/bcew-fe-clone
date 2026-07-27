import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

interface DateNavigatorProps {
	formattedDate: string;
	selectedDate: Date;
	isCalendarOpen: boolean;
	onOpenChange: (open: boolean) => void;
	onDateSelect: (date: Date) => void;
	onPrev: () => void;
	onNext: () => void;
}

const DateNavigator = ({
	formattedDate,
	selectedDate,
	isCalendarOpen,
	onOpenChange,
	onDateSelect,
	onPrev,
	onNext,
}: DateNavigatorProps) => {
	return (
		<div className="flex items-center gap-1 rounded-[8px] p-1.5 text-center shadow-md">
			<button onClick={onPrev} className="rounded p-0 hover:bg-gray-100">
				<ChevronLeft className="h-4 w-4 text-gray-600" />
			</button>

			<Popover open={isCalendarOpen} onOpenChange={onOpenChange}>
				<PopoverTrigger asChild>
					<button className="items-center text-center text-sm font-medium text-brand-dark">{formattedDate}</button>
				</PopoverTrigger>

				<PopoverContent className="w-auto p-0" align="end">
					<Calendar mode="single" selected={selectedDate} onSelect={(date) => date && onDateSelect(date)} />
				</PopoverContent>
			</Popover>

			<button onClick={onNext} className="rounded p-0 hover:bg-gray-100">
				<ChevronRight className="h-4 w-4 text-gray-600" />
			</button>
		</div>
	);
};

export default DateNavigator;
