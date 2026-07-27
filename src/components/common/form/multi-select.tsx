import React, { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
							{selected.length > 0 ? `${selected.length} selected` : placeholder}

							<ChevronDown className="h-4 w-4 text-gray-400" />
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-full p-0" align="start">
						<div>
							<Input
								className="!border-none"
								placeholder={"filter"}
								value={inputValue}
								onChange={(e) => handleSearch(e.target.value)}
							/>

							{loading ? (
								<div className="flex items-center justify-center py-2">
									<Spinner />
								</div>
							) : (
								<>
									{filtered.length === 0 && <p className="p-2 text-center text-sm text-gray-500">{fallbackText}</p>}

									<div className="max-h-[300px] cursor-pointer overflow-y-auto">
										{filtered.map((option) => {
											return (
												<div
													key={option.value}
													onClick={() => toggleItem(option)}
													className="flex items-center justify-between px-3"
												>
													{option?.labelJsx ? (
														option?.labelJsx
													) : (
														<div className="py-1 text-sm hover:bg-brand-bgLightgrey">
															<span>{option.label}</span>
														</div>
													)}
													{selected.find((i) => i.value === option.value) && <span className="ml-auto">✓</span>}
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
