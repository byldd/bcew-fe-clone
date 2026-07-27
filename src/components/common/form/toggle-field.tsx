import type { FormToggleProps } from "@/components/common/form/types";
import { Switch } from "@/components/ui/switch";
import type { FieldValues } from "react-hook-form";

export function FormToggle<TData extends FieldValues>({
	field,
	fieldConfig,
	className,
	disabled,
}: FormToggleProps<TData>) {
	return (
		<Switch
			id={field.name}
			checked={!!field.value}
			onCheckedChange={field.onChange}
			disabled={disabled || fieldConfig.disabled}
			className={className}
		/>
	);
}
