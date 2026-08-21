"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils/utils";

import { INCIDENT_SEVERITY_META } from "../utils/constants";
import { INCIDENT_SEVERITY } from "../utils/enums";

const SEVERITY_OPTIONS = Object.values(INCIDENT_SEVERITY);

const SeveritySelectCell = ({
	value,
	disabled,
	onChange,
}: {
	value: INCIDENT_SEVERITY | null;
	disabled?: boolean;
	onChange: (severity: INCIDENT_SEVERITY) => void;
}) => {
	const meta = value ? INCIDENT_SEVERITY_META[value] : null;

	return (
		<Select
			value={value ?? undefined}
			onValueChange={(next) => onChange(next as INCIDENT_SEVERITY)}
			disabled={disabled}
		>
			<SelectTrigger
				className={cn(
					"h-8 w-full justify-center gap-1 rounded-[8px] border-none bg-transparent px-2 text-sm font-medium shadow-none",
					meta?.className
				)}
			>
				<SelectValue placeholder="--" />
			</SelectTrigger>
			<SelectContent>
				{SEVERITY_OPTIONS.map((severity) => (
					<SelectItem key={severity} value={severity}>
						<span className={cn("text-sm font-medium", INCIDENT_SEVERITY_META[severity].className)}>
							{INCIDENT_SEVERITY_META[severity].label}
						</span>
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
};

export default SeveritySelectCell;
