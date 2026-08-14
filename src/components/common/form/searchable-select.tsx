import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { ChevronDown } from "lucide-react";

import type { IOptions } from "@/components/common/form/types";
import { cn } from "@/lib/utils/utils";

interface SearchableSelectProps {
	options: IOptions[];
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	onSearch?: (value: string) => void;
	disabled?: boolean;
	className?: string;
}

export default function SearchableSelect({
	options,
	value,
	onChange,
	placeholder = "Select an item",
	onSearch,
	disabled,
	className,
}: SearchableSelectProps) {
	const [inputValue, setInputValue] = useState("");
	const [open, setOpen] = useState(false);

	const selectedOption = options.find((option) => option.value === value);
	const filteredOptions = options.filter((option) => option.label.toLowerCase().includes(inputValue.toLowerCase()));

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					role="combobox"
					aria-expanded={open}
					disabled={disabled}
					className={cn(
						"h-10 w-full justify-between rounded-[8px] border-none bg-brand-bgLightgrey text-sm font-normal",
						!value && "text-muted-foreground",
						className
					)}
				>
					<span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
					<ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-full p-0" align="start" onCloseAutoFocus={(event) => event.preventDefault()}>
				<div className="p-2">
					<Input
						placeholder="Search..."
						value={inputValue}
						onChange={(e) => {
							setInputValue(e.target.value);
							onSearch?.(e.target.value);
						}}
						className="h-8"
					/>

					<div className="max-h-60 max-w-full overflow-y-auto">
						{filteredOptions.length === 0 && (
							<p className="py-2 text-center text-xs text-muted-foreground">No results found.</p>
						)}
						{filteredOptions.map((option) => {
							const isSelected = value === option.value;
							return (
								<div
									key={option.value}
									onClick={() => {
										onChange(option.value);
										setOpen(false);
									}}
									className={cn(
										"mt-2 cursor-pointer rounded-lg p-2 text-xs hover:bg-accent",
										isSelected && "bg-accent"
									)}
								>
									{option.label} {isSelected && "✓"}
								</div>
							);
						})}
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);
}
