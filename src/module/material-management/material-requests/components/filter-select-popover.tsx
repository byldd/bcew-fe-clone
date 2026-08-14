"use client";

import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Spinner } from "@/components/ui/spinner";
import type { FilterSelectPopoverProps } from "../utils/types";
import { ALL_VALUE } from "../utils/constants";

export function FilterSelectPopover({
	label,
	value,
	options,
	onApply,
	triggerClassName,
	searchable,
	onSearch,
	searchPlaceholder,
	loading,
}: FilterSelectPopoverProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");

	const selectedValues = useMemo(() => {
		if (!value || value === ALL_VALUE) return [] as string[];
		return value.split("|").filter(Boolean);
	}, [value]);

	const nonAllOptions = useMemo(() => {
		const withoutAll = options.filter((o) => o.value !== ALL_VALUE);
		if (!searchable || !searchTerm) return withoutAll;
		return withoutAll.filter((o) => o.label.toLowerCase().includes(searchTerm.toLowerCase()));
	}, [options, searchable, searchTerm]);

	const handleOpenChange = (open: boolean) => {
		setIsOpen(open);
		if (!open) {
			setSearchTerm("");
			onSearch?.("");
		}
	};

	const handleSearchChange = (nextValue: string) => {
		setSearchTerm(nextValue);
		onSearch?.(nextValue);
	};

	const triggerLabel = useMemo(() => {
		if (selectedValues.length === 0) return "All";
		if (selectedValues.length === 1) {
			return options.find((o) => o.value === selectedValues[0])?.label ?? selectedValues[0];
		}
		return `${selectedValues.length} selected`;
	}, [selectedValues, options]);

	const handleToggle = (optionValue: string) => {
		const next = selectedValues.includes(optionValue)
			? selectedValues.filter((v) => v !== optionValue)
			: [...selectedValues, optionValue];
		onApply(next.join("|"));
	};

	const handleClear = () => onApply("");

	return (
		<Popover open={isOpen} onOpenChange={handleOpenChange}>
			<PopoverTrigger asChild>
				<button
					type="button"
					className={`flex w-full items-center justify-between rounded-[8px] border border-brand-dark10 bg-white px-2 text-xs text-brand-dark ${triggerClassName ?? ""}`}
				>
					<span className="truncate">
						{label}: {triggerLabel}
					</span>
					<ChevronDown className="ml-2 h-4 w-4 text-brand-dark" />
				</button>
			</PopoverTrigger>
			<PopoverContent
				align="start"
				sideOffset={8}
				collisionPadding={16}
				className="w-[260px] max-w-[calc(100vw-32px)] p-3"
			>
				<div className="space-y-2">
					{searchable && (
						<Input
							value={searchTerm}
							onChange={(e) => handleSearchChange(e.target.value)}
							placeholder={searchPlaceholder ?? `Search ${label.toLowerCase()}`}
							className="h-8 text-xs"
						/>
					)}
					{loading && (
						<div className="flex items-center gap-1.5 px-1 text-xs text-brand-dark50">
							<Spinner size="small" className="size-3" />
							Loading...
						</div>
					)}
					<div className="max-h-[220px] space-y-0.5 overflow-y-auto pr-1">
						{nonAllOptions.length === 0 ? (
							<p className="px-1 py-2 text-xs text-brand-dark50">No options available</p>
						) : (
							nonAllOptions.map((option) => (
								<label
									key={option.value}
									className="flex cursor-pointer select-none items-center gap-2 rounded-[6px] px-2 py-1.5 hover:bg-gray-50"
								>
									<input
										type="checkbox"
										checked={selectedValues.includes(option.value)}
										onChange={() => handleToggle(option.value)}
										className="h-3.5 w-3.5 shrink-0 cursor-pointer rounded accent-brand-dark"
									/>
									<span
										className="line-clamp-2 min-w-0 flex-1 break-words text-xs leading-5 text-brand-dark"
										title={option.label}
									>
										{option.label}
									</span>
								</label>
							))
						)}
					</div>
					<div className="flex items-center justify-end border-t border-brand-dark10 pt-2">
						<Button
							variant="outline"
							className="h-7 rounded-[6px] px-3 text-xs"
							onClick={handleClear}
							disabled={selectedValues.length === 0}
						>
							Clear
						</Button>
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);
}
