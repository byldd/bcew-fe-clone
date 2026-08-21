import { FormInput, FormTextarea } from "@/components/common/form/form-input";
import { FormMultiDocumentInput } from "@/components/common/form/document-field";
import { FormMultiImageInput } from "@/components/common/form/image-field";
import { FormRadioGroup } from "@/components/common/form/radio-group";
import SearchableSelect from "@/components/common/form/searchable-select";
import { FormToggle } from "@/components/common/form/toggle-field";
import { FIELD_VARIANT, type RenderFormInputProps } from "@/components/common/form/types";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type FieldValues } from "react-hook-form";
import { FormDateInput } from "@/components/common/form/date-input";
import { FormLocationInput } from "@/components/common/form/location-input";
import { cn } from "@/lib/utils/utils";
import { MultiSelect } from "./multi-select";

export function RenderFormInput<TData extends FieldValues>({
	field,
	fieldConfig,
	className,
	disabled,
	canDelete,
}: RenderFormInputProps<TData>) {
	const baseClassName = "rounded-[8px] border-none bg-brand-bgLightgrey";

	switch (fieldConfig.fieldVariant) {
		case FIELD_VARIANT.INPUT:
			return <FormInput field={field} fieldConfig={fieldConfig} className={className} disabled={disabled} />;

		case FIELD_VARIANT.TEXTAREA:
			return <FormTextarea field={field} fieldConfig={fieldConfig} className={className} disabled={disabled} />;

		case FIELD_VARIANT.RADIO_GROUP:
			return <FormRadioGroup field={field} fieldConfig={fieldConfig} className={className} disabled={disabled} />;

		case FIELD_VARIANT.DATE:
			return <FormDateInput field={field} fieldConfig={fieldConfig} className={className} disabled={disabled} />;

		case FIELD_VARIANT.LOCATION:
			return <FormLocationInput field={field} fieldConfig={fieldConfig} className={className} disabled={disabled} />;

		case FIELD_VARIANT.READONLY_TEXT: {
			const hasValue = field.value !== null && field.value !== undefined && String(field.value).trim() !== "";
			return (
				<p
					className={cn(
						"flex min-h-10 items-center text-sm",
						hasValue ? "text-brand-black" : "text-brand-grey",
						fieldConfig.className,
						className
					)}
				>
					{hasValue ? String(field.value) : (fieldConfig.emptyText ?? "Not Available")}
				</p>
			);
		}

		case FIELD_VARIANT.TOGGLE:
			return <FormToggle field={field} fieldConfig={fieldConfig} className={className} disabled={disabled} />;

		case FIELD_VARIANT.MULTI_IMAGE:
			return (
				<FormMultiImageInput
					field={field}
					fieldConfig={fieldConfig}
					className={className}
					disabled={disabled}
					canDelete={canDelete}
				/>
			);

		case FIELD_VARIANT.MULTI_DOCUMENT:
			return (
				<FormMultiDocumentInput
					field={field}
					fieldConfig={fieldConfig}
					className={className}
					disabled={disabled}
					canDelete={canDelete}
				/>
			);

		case FIELD_VARIANT.SELECT:
			return (
				<Select onValueChange={field.onChange} value={field.value} disabled={disabled || fieldConfig.disabled}>
					<SelectTrigger id={field.name} className={cn(baseClassName, fieldConfig.className, className)}>
						<SelectValue placeholder={fieldConfig.placeholder} />
					</SelectTrigger>
					<SelectContent onCloseAutoFocus={(event) => event.preventDefault()}>
						<SelectGroup>
							{fieldConfig.options.map((option) => (
								<SelectItem key={option.value} value={option.value} disabled={option.disabled}>
									{option.label}
								</SelectItem>
							))}
						</SelectGroup>
					</SelectContent>
				</Select>
			);

		case FIELD_VARIANT.MULTI_SELECT:
			return (
				<MultiSelect
					options={fieldConfig.options}
					selected={field.value || []}
					onChange={field.onChange}
					placeholder={fieldConfig.placeholder}
					onSearch={fieldConfig.onSearch}
					disabled={disabled || fieldConfig.disabled}
					className={cn(fieldConfig.className, className)}
				/>
			);

		case FIELD_VARIANT.SEARCHABLE_SELECT:
			return (
				<SearchableSelect
					options={fieldConfig.options}
					value={field.value}
					onChange={field.onChange}
					placeholder={fieldConfig.placeholder}
					onSearch={fieldConfig.onSearch}
					disabled={disabled || fieldConfig.disabled}
					className={cn(fieldConfig.className, className)}
				/>
			);

		case FIELD_VARIANT.CURRENCY_INPUT:
			return (
				<div className={cn("relative", fieldConfig.className)}>
					<span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
						{fieldConfig.currencySymbol || "$"}
					</span>
					<Input
						{...field}
						{...fieldConfig.inputProps}
						type="number"
						min={0}
						id={field.name}
						disabled={disabled || fieldConfig.disabled}
						// A cost can't be negative — block the keys that produce one (typing or paste is caught below).
						onKeyDown={(event) => {
							if (["-", "+", "e", "E"].includes(event.key)) event.preventDefault();
						}}
						onChange={(event) => {
							if (event.target.value.startsWith("-")) return;
							field.onChange(event);
						}}
						className={cn(baseClassName, "no-spinner !border-none")}
						placeholder={fieldConfig.placeholder}
					/>
				</div>
			);

		default:
			return null;
	}
}
