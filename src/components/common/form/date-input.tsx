import type { FormDateInputProps } from "@/components/common/form/types";
import { DatePicker } from "@/components/ui/date-picker";
import type { FieldValues } from "react-hook-form";

export function FormDateInput<TData extends FieldValues>({
	field,
	fieldConfig,
	className,
	disabled,
}: FormDateInputProps<TData>) {
	if (!fieldConfig) return null;

	return (
		<DatePicker
			value={field.value}
			onChange={field.onChange}
			disabled={disabled || fieldConfig.disabled}
			disabledDate={fieldConfig.disabledDate}
			className={className}
			placeholder={fieldConfig.placeholder}
		/>
	);
}
