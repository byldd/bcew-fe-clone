import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils/utils";

export type Option<T extends Record<string, unknown> = Record<string, never>> = {
	label: string;
	value: string | number;
	disabled?: boolean;
} & T;

// Collect all keys from a union type
type UnionKeys<T> = T extends unknown ? keyof T : never;

// Make all properties optional and collect from union
type UnionToOptionalIntersection<U> = {
	[K in UnionKeys<U>]?: U extends unknown ? (K extends keyof U ? U[K] : never) : never;
};

// Extract all possible additional fields from an array of options
// This collects all unique fields from all options and makes them optional
type ExtractAllFields<TOptions> = TOptions extends readonly Option<infer U>[]
	? UnionToOptionalIntersection<U>
	: TOptions extends Option<infer U>[]
		? UnionToOptionalIntersection<U>
		: Record<string, never>;

interface SelectFieldProps<T extends Record<string, unknown> = Record<string, never>> {
	id?: string;
	label?: string;
	required?: boolean;
	placeholder?: string;
	options: Option<T>[];
	value?: string | number;
	onValueChange?: (value: string, option?: Option<T>) => void;
	error?: string;
	className?: string;
	style?: React.CSSProperties;
	disabled?: boolean;
}

function SelectFieldInner<T extends Record<string, unknown> = Record<string, never>>({
	id,
	label,

	placeholder,
	options,
	required = false,
	value = "",
	onValueChange,
	error,
	className,
	style,
	disabled,
}: SelectFieldProps<T>) {
	return (
		<div className="space-y-1" style={style}>
			{label && (
				<Label className="inline-flex items-start font-inter text-sm font-normal text-brand-grey">
					<span>{label}</span>
					{required && <span className="ml-0.5 align-super text-[10px] leading-none text-brand-grey">*</span>}
				</Label>
			)}
			<Select
				value={String(value)}
				onValueChange={(value) =>
					onValueChange?.(
						value,
						options.find((option) => String(option.value) === value)
					)
				}
			>
				<SelectTrigger
					id={id}
					disabled={disabled}
					className={cn(
						"h-10 w-full rounded-[10px] border-none bg-brand-bgLightgrey px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-none focus:outline-none focus:ring-0",
						error && "border-red-500",
						className
					)}
				>
					<SelectValue placeholder={placeholder} />
				</SelectTrigger>
				<SelectContent>
					{options.map((option, idx) => {
						if (typeof option === "string") {
							return (
								<SelectItem key={`${option}-${idx}`} value={option}>
									{option}
								</SelectItem>
							);
						}
						return (
							<SelectItem key={`${option.value}-${idx}`} value={String(option.value)} disabled={option.disabled}>
								{option.label}
							</SelectItem>
						);
					})}
				</SelectContent>
			</Select>
			{error && <p className="text-xs text-red-500">{error}</p>}
		</div>
	);
}

// Overload signatures for type inference from options array
function SelectField<TOptions extends readonly Option<Record<string, unknown>>[]>(
	props: SelectFieldProps<ExtractAllFields<TOptions>> & { options: TOptions }
): React.ReactElement;
function SelectField<T extends Record<string, unknown> = Record<string, never>>(
	props: SelectFieldProps<T>
): React.ReactElement;
function SelectField<T extends Record<string, unknown> = Record<string, never>>(
	props: SelectFieldProps<T>
): React.ReactElement {
	return SelectFieldInner(props);
}

export { SelectField };
