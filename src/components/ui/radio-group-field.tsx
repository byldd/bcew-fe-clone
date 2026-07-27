import React from "react";
import { RadioGroup, RadioGroupItem } from "./radio-group";
import { Label } from "./label";

const RadioGroupField = ({
	options,
	value,
	onChange,
	disabled,
}: {
	options: { label: string; value: string }[];
	value: string | undefined;
	onChange: (value: string) => void;
	disabled?: boolean;
}) => {
	return (
		<RadioGroup
			value={value || ""}
			onValueChange={onChange}
			className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-16 sm:gap-y-3"
			disabled={disabled}
		>
			{options.map((option) => (
				<div key={option.value} className="inline-flex items-center gap-2 leading-none">
					<RadioGroupItem value={option.value} id={option.value} className="custom-radio" />
					<Label htmlFor={option.value}>{option.label}</Label>
				</div>
			))}
		</RadioGroup>
	);
};

export default RadioGroupField;
