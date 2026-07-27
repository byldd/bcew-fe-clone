import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import type { FieldValues } from "react-hook-form";
import type { FormRadioGroupProps } from "@/components/common/form/types";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils/utils";

export function FormRadioGroup<TData extends FieldValues>({
	field,
	fieldConfig,
	className,
	disabled,
}: FormRadioGroupProps<TData>) {
	return (
		<RadioGroup
			onValueChange={field.onChange}
			value={field.value}
			className={cn("flex flex-wrap items-center gap-10 py-2", fieldConfig.className, className)}
		>
			{fieldConfig.options?.map((option) => {
				const id = option.value.toLowerCase().replace(/\s+/g, "_");
				return (
					<div key={option.value} className="flex items-center space-x-2">
						<RadioGroupItem
							value={option.value}
							id={id}
							disabled={option.disabled || fieldConfig.disabled || disabled}
						/>
						<Label
							htmlFor={id}
							className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
						>
							{option.label}
						</Label>
					</div>
				);
			})}
		</RadioGroup>
	);
}
