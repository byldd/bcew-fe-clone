import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/utils";
import { CRATE_ISSUE_CATEGORY } from "../enums";
import { CRATE_ISSUE_CATEGORY_OPTIONS } from "../utils/constants";

interface IssueCategoryPickerProps {
	value: CRATE_ISSUE_CATEGORY | null;
	onChange: (category: CRATE_ISSUE_CATEGORY) => void;
}

export default function IssueCategoryPicker({ value, onChange }: IssueCategoryPickerProps) {
	return (
		<div className="grid grid-cols-3 gap-2">
			{CRATE_ISSUE_CATEGORY_OPTIONS.map((option) => {
				const Icon = option.icon;
				const isSelected = value === option.value;

				return (
					<Button
						key={option.value}
						type="button"
						variant="ghost"
						onClick={() => onChange(option.value)}
						className={cn(
							"h-auto flex-col items-center gap-2 whitespace-normal rounded-xl border bg-white p-3 text-center transition-colors",
							isSelected ? "border-gray-900" : "hover:bg-gray-50"
						)}
					>
						<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100">
							<Icon className="h-4 w-4 text-gray-700" />
						</div>
						<div>
							<p className="text-xs font-medium text-gray-900">{option.label}</p>
							<p className="mt-0.5 text-[10px] leading-tight text-gray-400">{option.subtitle}</p>
						</div>
					</Button>
				);
			})}
		</div>
	);
}
