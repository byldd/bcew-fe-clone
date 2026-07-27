import { LABEL_POSITION, type FormInputWrapperProps } from "@/components/common/form/types";
import { RenderFormInput } from "@/components/common/form/render-form-input";
import { FormLabelRequired } from "@/components/ui/formLabelrequired";

import { FormControl, FormDescription, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { cn } from "@/lib/utils/utils";
import { FieldValues } from "react-hook-form";

export function FormInputWrapper<TData extends FieldValues>({
	form,
	fieldConfig,
	className,
	wrapperClassName,
	disabled,
	canDelete,
}: FormInputWrapperProps<TData>) {
	const labelPosition = fieldConfig.labelPosition ?? LABEL_POSITION.TOP;
	const isHorizontal = labelPosition !== LABEL_POSITION.TOP;
	const rawLabel = fieldConfig.label ?? "";
	const isRequired = rawLabel.trim().endsWith("*");
	const displayLabel = isRequired ? rawLabel.trim().slice(0, -1).trim() : rawLabel;

	return (
		<FormField
			name={fieldConfig.name}
			control={form.control}
			render={({ field, fieldState }) => (
				<FormItem
					data-invalid={fieldState.invalid}
					data-error-anchor={fieldConfig.name}
					className={cn(
						"gap-1.5",
						"data-[invalid=true]:[&_input]:!border data-[invalid=true]:[&_input]:!border-brand-red",
						"data-[invalid=true]:[&_textarea]:!border data-[invalid=true]:[&_textarea]:!border-brand-red",
						wrapperClassName
					)}
				>
					<div
						className={cn(
							isHorizontal && "flex items-center justify-between gap-4",
							labelPosition === LABEL_POSITION.RIGHT && "flex-row-reverse"
						)}
					>
						<div>
							<FormLabelRequired
								htmlFor={field.name}
								label={displayLabel}
								required={isRequired}
								className="pb-1 font-inter text-sm font-normal text-brand-grey"
							/>
							{fieldConfig.description && (
								<FormDescription className="rounded-[10px] text-xs text-brand-grey">
									{fieldConfig.description}
								</FormDescription>
							)}
						</div>
						<FormControl>
							<RenderFormInput
								field={field}
								fieldConfig={fieldConfig}
								className={className}
								disabled={disabled}
								canDelete={canDelete}
							/>
						</FormControl>
					</div>

					{fieldConfig.note && <p className="text-xs text-brand-red800">{fieldConfig.note}</p>}

					<FormMessage />
				</FormItem>
			)}
		/>
	);
}
