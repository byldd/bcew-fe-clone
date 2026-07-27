import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils/utils";

interface TextareaFieldProps {
	id?: string;
	label?: string;
	required?: boolean;
	placeholder?: string;
	value?: string;
	onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
	error?: string;
	className?: string;
	labelClassName?: string;
	style?: React.CSSProperties;
	disabled?: boolean;
	maxLength?: number;
}

export const TextareaField = ({
	id,
	label,
	required = false,
	placeholder,
	value,
	onChange,
	error,
	className,
	labelClassName,
	style,
	disabled = false,
	maxLength,
}: TextareaFieldProps) => (
	<div className="space-y-1" style={style}>
		{label && (
			<Label
				className={cn(
					"inline-flex items-start font-inter text-sm font-normal text-brand-grey", // default style
					labelClassName
				)}
			>
				<span>{label}</span>
				{required && <span className="ml-0.5 align-super text-[10px] leading-none text-brand-grey">*</span>}
			</Label>
		)}
		<Textarea
			id={id}
			disabled={disabled}
			className={cn(
				"h-28 w-full rounded-[10px] border-none bg-brand-bgLightgrey px-3 py-2 text-sm outline-none focus:border-none focus:outline-none focus:ring-0",
				error && "border-red-500",
				className
			)}
			placeholder={placeholder}
			value={value}
			onChange={onChange}
			maxLength={maxLength}
		/>
		{maxLength !== undefined && (
			<p className="mt-1 text-right text-[10px] text-brand-dark50">
				{(value ?? "").length}/{maxLength}
			</p>
		)}
		{error && <p className="text-xs text-red-500">{error}</p>}
	</div>
);
