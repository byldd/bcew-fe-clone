"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils/utils";
import { MATERIAL_HISTORY_FILTER } from "../utils/enums";
import { MATERIAL_HISTORY_FILTER_OPTIONS } from "../utils/constants";

interface MaterialHistoryFilterProps {
	selected: MATERIAL_HISTORY_FILTER[];
	onChange: (selected: MATERIAL_HISTORY_FILTER[]) => void;
}

export default function MaterialHistoryFilter({ selected, onChange }: MaterialHistoryFilterProps) {
	const [open, setOpen] = useState(false);

	const allValues = MATERIAL_HISTORY_FILTER_OPTIONS.map((option) => option.value);
	const isAllSelected = allValues.every((value) => selected.includes(value));

	const toggle = (value: MATERIAL_HISTORY_FILTER) => {
		const next = selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value];
		onChange(next);
	};

	const toggleAll = () => {
		onChange(isAllSelected ? [] : allValues);
	};

	const triggerLabel = isAllSelected
		? MATERIAL_HISTORY_FILTER.ALL
		: selected.length === 1
			? MATERIAL_HISTORY_FILTER_OPTIONS.find((option) => option.value === selected[0])?.label
			: `${selected.length} selected`;

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<button
					type="button"
					className="flex items-center gap-2 rounded-[8px] border border-brand-dark10 bg-white px-3 py-1.5 text-xs font-medium text-brand-dark"
				>
					{triggerLabel}
					<ChevronDown className="h-4 w-4 text-brand-dark50" />
				</button>
			</PopoverTrigger>
			<PopoverContent align="end" className="w-56 p-0">
				<div className="py-1">
					<button
						type="button"
						onClick={toggleAll}
						className={cn(
							"flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm text-brand-dark",
							"border-b border-brand-dark10 hover:bg-brand-bgLightgrey"
						)}
					>
						<Checkbox checked={isAllSelected} className="pointer-events-none rounded-[4px]" />
						<span>All</span>
					</button>
					{MATERIAL_HISTORY_FILTER_OPTIONS.map((option) => {
						const isChecked = selected.includes(option.value);
						return (
							<button
								key={option.value}
								type="button"
								onClick={() => toggle(option.value)}
								className={cn(
									"flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm text-brand-dark",
									"border-b border-brand-dark10 last:border-b-0 hover:bg-brand-bgLightgrey"
								)}
							>
								<Checkbox checked={isChecked} className="pointer-events-none rounded-[4px]" />
								<span>{option.label}</span>
							</button>
						);
					})}
				</div>
			</PopoverContent>
		</Popover>
	);
}
