"use client";

import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils/utils";

type CrateActivityFilterOption = {
	label: string;
	value: string;
};

type CrateActivityFilterPopoverProps = {
	label: string;
	options: CrateActivityFilterOption[];
	selected: string[];
	onChange: (values: string[]) => void;
	className?: string;
};

export default function CrateActivityFilterPopover({
	label,
	options,
	selected,
	onChange,
	className,
}: CrateActivityFilterPopoverProps) {
	const [isOpen, setIsOpen] = useState(false);

	const triggerLabel = useMemo(() => {
		if (selected.length === 0) return "All";
		if (selected.length === 1) {
			return options.find((option) => option.value === selected[0])?.label ?? selected[0];
		}
		return `${selected.length} selected`;
	}, [selected, options]);

	const handleToggle = (value: string) => {
		onChange(selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value]);
	};

	return (
		<Popover open={isOpen} onOpenChange={setIsOpen}>
			<PopoverTrigger asChild>
				<button
					type="button"
					className={cn(
						"flex h-10 items-center justify-between gap-2 rounded-[10px] border-none bg-white px-3 text-sm text-brand-dark shadow-md",
						className
					)}
				>
					<span className="truncate">
						{label}: <span className="font-medium">{triggerLabel}</span>
					</span>
					<ChevronDown className="h-4 w-4 shrink-0 text-brand-dark50" />
				</button>
			</PopoverTrigger>
			<PopoverContent align="start" sideOffset={8} className="w-[240px] p-3">
				<div className="space-y-2">
					<div className="max-h-[220px] space-y-0.5 overflow-y-auto pr-1">
						{options.length === 0 ? (
							<p className="px-1 py-2 text-xs text-brand-dark50">No options available</p>
						) : (
							options.map((option) => (
								<label
									key={option.value}
									className="flex cursor-pointer select-none items-center gap-2 rounded-[6px] px-2 py-1.5 hover:bg-gray-50"
								>
									<input
										type="checkbox"
										checked={selected.includes(option.value)}
										onChange={() => handleToggle(option.value)}
										className="h-3.5 w-3.5 shrink-0 cursor-pointer rounded accent-brand-dark"
									/>
									<span className="line-clamp-2 min-w-0 flex-1 break-words text-xs leading-5 text-brand-dark">
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
							onClick={() => onChange([])}
							disabled={selected.length === 0}
						>
							Clear
						</Button>
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);
}
