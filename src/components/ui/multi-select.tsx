"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";

import { Badge } from "@/components/ui/badge";
import { ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils/utils";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
import { Input } from "./input";
import { Spinner } from "./spinner";

export interface OptionItem {
	id: string;
	name: string;
	labelJsx?: React.ReactNode;
}

interface MultiSelectProps {
	label?: string;
	options: OptionItem[];
	selected: OptionItem[];
	onChange: (selected: OptionItem[]) => void;
	placeholder?: string;
	onSearch?: (value: string) => void;
	showSelected?: boolean;
	fallbackText?: string;
	loading?: boolean;
}

export function MultiSelect({
	label,
	options = [],
	selected = [],
	onChange,
	placeholder = "Select options",
	onSearch,
	showSelected = true,
	fallbackText = "No results found",
	loading = false,
}: MultiSelectProps) {
	const [open, setOpen] = React.useState(false);
	const [inputValue, setInputValue] = React.useState("");
	const tschedule = useTypedTranslations(NAMESPACE.SCHEDULE);
	const filtered = options.filter((option) => option.name.toLowerCase().includes(inputValue.toLowerCase()));

	function toggleItem(item: OptionItem) {
		const exists = selected.find((i) => i.id === item.id);
		if (exists) {
			onChange(selected.filter((i) => i.id !== item.id));
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
				{label && <Label className="font-inter text-sm font-normal text-brand-grey">{label}</Label>}

				<Popover open={open} onOpenChange={setOpen}>
					<PopoverTrigger asChild>
						<Button
							variant="ghost"
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
					<PopoverContent className="w-full p-0">
						<div>
							<Input
								className="!border-none"
								placeholder={tschedule.typeToFilter}
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
													key={option.id}
													onClick={() => toggleItem(option)}
													className="flex items-center justify-between px-3"
												>
													{option?.labelJsx ? (
														option?.labelJsx
													) : (
														<div className="py-1 text-sm hover:bg-brand-bgLightgrey">
															<span>{option.name}</span>
														</div>
													)}
													{selected.find((i) => i.id === option.id) && <span className="ml-auto">✓</span>}
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
						<Badge key={item.id}>
							{item.name}
							<X className="ml-2 h-3 w-3 cursor-pointer" onClick={() => toggleItem(item)} />
						</Badge>
					))}
				</div>
			)}
		</div>
	);
}
