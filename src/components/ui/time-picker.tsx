import { toFormattedDate } from "@/lib/utils/date";
import { DATE_FORMAT } from "@/types/date";
import React, { forwardRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FiClock } from "react-icons/fi";

interface TimePickerProps {
	value: string;
	onChange: (value: string, date: Date) => void;
	placeholder?: string;
	disabled?: boolean;
	showIcon?: boolean;
}

type CustomInputProps = {
	value?: string;
	onClick?: () => void;
	placeholder?: string;
	disabled?: boolean;
};

const CustomInput = forwardRef<HTMLInputElement, CustomInputProps>(({ value, onClick, placeholder, disabled }, ref) => (
	<div className="relative w-full">
		<input
			readOnly
			ref={ref}
			value={value}
			onClick={onClick}
			placeholder={placeholder}
			disabled={disabled}
			className={`h-11 w-full rounded-[10px] border-none bg-brand-bgLightgrey px-3 py-2 pr-10 text-sm text-black outline-none focus:ring-0`}
		/>
		<FiClock
			className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 transform text-brand-dark`}
			size={18}
		/>
	</div>
));
CustomInput.displayName = "CustomInput";
export const TimePicker: React.FC<TimePickerProps> = ({
	value,
	onChange,
	placeholder = "Select time",
	disabled = false,
	showIcon = true,
}) => {
	const parseTimeString = (timeString: string): Date => {
		const [hours, minutes] = timeString.split(":").map(Number);
		const date = new Date();
		date.setHours(hours || 0);
		date.setMinutes(minutes || 0);
		date.setSeconds(0);
		return date;
	};

	const timeValue = value ? parseTimeString(value) : null;

	const handleDateChange = (date: Date | null, _event?: React.SyntheticEvent): void => {
		if (date) {
			onChange(toFormattedDate(date, DATE_FORMAT.HH_MM), date);
		}
	};

	return (
		<DatePicker
			selected={timeValue}
			onChange={handleDateChange}
			showTimeSelect
			showTimeSelectOnly
			timeIntervals={15}
			dateFormat="h:mm aa"
			timeCaption="Time"
			placeholderText={placeholder}
			disabled={disabled}
			className={`${disabled ? "cursor-not-allowed" : ""} focus:ring-0" z-10 h-11 w-full rounded-[10px] border-none bg-brand-bgLightgrey px-3 py-2 text-sm text-black outline-none focus:border-none focus:outline-none`}
			customInput={showIcon ? <CustomInput placeholder={placeholder} disabled={disabled} /> : undefined}
			popperClassName="time-picker-popper"
			popperPlacement="bottom-start"
			// portalId="time-picker-portal"
		/>
	);
};

export default TimePicker;
