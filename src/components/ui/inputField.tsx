import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils/utils";

interface InputFieldProps {
	id?: string;
	name?: string;
	label?: string;
	placeholder?: string;
	value?: string;
	onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
	disabled?: boolean;
	error?: string;
	className?: string;
	style?: React.CSSProperties;
	type?: string;
	readOnly?: boolean;
	checked?: boolean;
	step?: string;
	min?: string;
	labelClassName?: string;
	inputClassName?: string;
}

export const InputField = ({
	id,
	name,
	label,
	placeholder,
	value,
	onChange,
	onKeyDown,
	disabled,
	error,
	className,
	labelClassName,
	inputClassName,
	style,
	type = "text",
	readOnly,
	checked,
	step,
	min,
}: InputFieldProps) => (
	<div className="space-y-1" style={style}>
		{label && (
			<Label className={cn("font-inter text-sm font-normal text-brand-grey md:text-sm", labelClassName)}>{label}</Label>
		)}
		<Input
			id={id}
			name={name}
			className={cn(
				"h-10 w-full rounded-[10px] !border-none bg-brand-bgLightgrey text-sm md:h-10",
				error && "border-red-500",
				inputClassName,
				className
			)}
			placeholder={placeholder}
			value={value}
			onChange={onChange}
			onKeyDown={onKeyDown}
			disabled={disabled}
			type={type}
			readOnly={readOnly}
			checked={checked}
			step={step && step}
			min={step && min && min}
		/>
		{error && <p className="text-xs text-red-500">{error}</p>}
	</div>
);
