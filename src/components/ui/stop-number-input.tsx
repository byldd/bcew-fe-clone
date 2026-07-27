import React from "react";
import { Input } from "./input";
import { cn } from "@/lib/utils/utils";

const StopNumberInput = ({
	value = undefined,
	onChange,
	className,
	placeholder = "-",
	disabled = false,
}: {
	value?: number;
	onChange: (value: number | null) => void;
	className?: string;
	placeholder?: string;
	disabled?: boolean;
}) => {
	return (
		<Input
			placeholder={placeholder}
			disabled={disabled}
			className={cn(
				"placeholder:text-brand-grey-200 h-4 w-10 rounded-lg p-2 text-xs",
				disabled && "bg-brand-bgLightgrey",
				className
			)}
			value={value ?? ""}
			onChange={(e) => {
				if (isNaN(Number(e.target.value))) {
					return;
				}
				// return null if input is empty, do not return undefined
				onChange(!!Number(e.target.value) ? Number(e.target.value) : null);
			}}
		/>
	);
};

export default StopNumberInput;
