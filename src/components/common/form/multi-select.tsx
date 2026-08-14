import React, { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils/utils";

import type { IOptions } from "@/components/common/form/types";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

interface MultiSelectProps {
	label?: string;
	options: IOptions[];
	selected: IOptions[];
	onChange: (selected: IOptions[]) => void;
	placeholder?: string;
	onSearch?: (value: string) => void;
	showSelected?: boolean;
	fallbackText?: string;
	loading?: boolean;
	disabled?: boolean;
	className?: string;
	// Opt-in checklist style: real checkboxes instead of a "✓" mark, and the picked
	// option's own label in the trigger instead of "1 selected". Existing callers are
	// unaffected unless they turn it on.
	showCheckbox?: boolean;
	// When set, adds a "<label>" row that selects/clears every option at once.
	allOptionLabel?: string;
	// Hide the in-dropdown filter input — useful for short, fixed option lists where
	// the trigger already shows what's picked and a search box is just noise.
	showSearch?: boolean;
}

export function MultiSelect({
	options = [],
	selected = [],
	onChange,
	placeholder = "Select options",
	onSearch,
	showSelected = true,
	fallbackText = "No results found",
	loading = false,
	disabled = false,
	className,
	showCheckbox = false,
	allOptionLabel,
	showSearch = true,
}: MultiSelectProps) {
	const [open, setOpen] = React.useState(false);
	const [inputValue, setInputValue] = React.useState("");
	const filtered = options.filter((option) => option.label.toLowerCase().includes(inputValue.toLowerCase()));

	function toggleItem(item: IOptions) {
		const exists = selected.find((i) => i.value === item.value);
		if (exists) {
			onChange(selected.filter((i) => i.value !== item.value));
		} else {
			onChange([...selected, item]);
		}
	}

	const isAllSelected = options.length > 0 && selected.length === options.length;
	const toggleAll = () => onChange(isAllSelected ? [] : options);

	const triggerLabel =
		selected.length === 0
			? placeholder
			: showCheckbox && selected.length === 1
				? selected[0]?.label
				: `${selected.length} selected`;

	const handleSearch = (value: string) => {
		setInputValue(value);
		onSearch?.(value);
	};

	return (
		<div className="flex-col space-y-2">
			<div className="space-y-1">
				<Popover open={open} onOpenChange={setOpen}>
					<PopoverTrigger asChild>
						<Button
							variant="ghost"
							disabled={disabled}
							className={cn(
								"text-left",
								"w-full",
								"!bg-brand-bgLightgrey",
								"text-sm",

								"px-3",
								"py-2",
								"rounded-[10px]",
								"h-10",
								"border-none",
								"font-normal",
								"outline-none",
								"focus:outline-none",
								"focus:ring-0",
								"focus:border-none",
								"justify-between",
								"font-normal",
								selected.length === 0 ? "text-gray-500" : "text-black"
							)}
						>
							{triggerLabel}

							<ChevronDown className="h-4 w-4 text-gray-400" />
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-full p-0" align="start">
						<div>
							{showSearch && (
								<Input
									className="!border-none"
									placeholder={"filter"}
									value={inputValue}
									onChange={(e) => handleSearch(e.target.value)}
								/>
							)}

							{loading ? (
								<div className="flex items-center justify-center py-2">
									<Spinner />
								</div>
							) : (
								<>
									{filtered.length === 0 && <p className="p-2 text-center text-sm text-gray-500">{fallbackText}</p>}

									<div className="max-h-[300px] cursor-pointer overflow-y-auto">
										{allOptionLabel && !inputValue && (
											<div
												onClick={toggleAll}
												className="flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-brand-bgLightgrey"
											>
												<Checkbox checked={isAllSelected} onCheckedChange={toggleAll} />
												<span>{allOptionLabel}</span>
											</div>
										)}
										{filtered.map((option) => {
											const isSelected = !!selected.find((i) => i.value === option.value);
											return (
												<div
													key={option.value}
													onClick={() => toggleItem(option)}
													className={cn("flex items-center px-3", showCheckbox ? "gap-2 py-1.5" : "justify-between")}
												>
													{showCheckbox && <Checkbox checked={isSelected} onCheckedChange={() => toggleItem(option)} />}
													{option?.labelJsx ? (
														option?.labelJsx
													) : showCheckbox ? (
														<span className="text-sm">{option.label}</span>
													) : (
														<div className="py-1 text-sm hover:bg-brand-bgLightgrey">
															<span>{option.label}</span>
														</div>
													)}
													{!showCheckbox && isSelected && <span className="ml-auto">✓</span>}
												</div>
											);
										})}
									</div>
								</>
							)}
						</div>
					</PopoverContent>
				</Popover>
			</div>
			{showSelected && (
				<div className="flex max-h-[100px] flex-wrap gap-2 overflow-y-auto">
					{selected.map((item) => (
						<Badge key={item.value}>
							{item.label}
							<X className="ml-2 h-3 w-3 cursor-pointer" onClick={() => toggleItem(item)} />
						</Badge>
					))}
				</div>
			)}
		</div>
	);
}
