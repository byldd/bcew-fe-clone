import type { FormInputProps, FormTextAreaProps } from "@/components/common/form/types";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Eye, EyeOff } from "lucide-react";
import { type ChangeEvent, useMemo, useState } from "react";
import { type FieldValues } from "react-hook-form";
import { cn } from "@/lib/utils/utils";

export function FormInput<TData extends FieldValues>({
	field,
	fieldConfig,
	className,
	disabled,
}: FormInputProps<TData>) {
	const baseClassName = "rounded-[10px] !border-none bg-brand-bgLightgrey";
	const [showPassword, setShowPassword] = useState(false);

	const isPassword = fieldConfig.inputProps?.type === "password";

	const togglePassword = () => setShowPassword((prev) => !prev);

	return (
		<div className="relative">
			<Input
				{...field}
				{...fieldConfig.inputProps}
				{...(fieldConfig.numericOnly && {
					inputMode: "numeric" as const,
					onChange: (event: ChangeEvent<HTMLInputElement>) => field.onChange(event.target.value.replace(/\D/g, "")),
				})}
				type={isPassword && showPassword ? "text" : fieldConfig.inputProps?.type}
				placeholder={fieldConfig.placeholder}
				id={field.name}
				disabled={disabled || fieldConfig.disabled}
				className={cn(baseClassName, isPassword && "pr-8", fieldConfig.className, className)}
			/>
			{isPassword && (
				<button
					type="button"
					onClick={togglePassword}
					aria-label={showPassword ? "Hide password" : "Show password"}
					className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
				>
					{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
				</button>
			)}
		</div>
	);
}

export function FormTextarea<TData extends FieldValues>({
	field,
	fieldConfig,
	className,
	disabled,
}: FormTextAreaProps<TData>) {
	const baseClassName = "resize-none";

	const maxLength = fieldConfig.textareaProps?.maxLength;

	const count = useMemo(() => (typeof field.value === "string" ? field.value.length : 0) as number, [field.value]);

	return (
		<div className="space-y-1">
			<Textarea
				{...field}
				{...fieldConfig.textareaProps}
				id={field.name}
				placeholder={fieldConfig.placeholder}
				disabled={disabled || fieldConfig.disabled}
				maxLength={maxLength}
				className={cn(baseClassName, fieldConfig.className, className)}
			/>
			{fieldConfig.showCharCount && maxLength && (
				<div className="text-right text-xs text-muted-foreground">
					{count} / {maxLength}
				</div>
			)}
		</div>
	);
}
