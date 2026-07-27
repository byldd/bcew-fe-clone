"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { AppTooltip } from "@/components/ui/tooltip";

const NOT_ASSIGNED_LABEL = "Not assigned";

export default function MaterialRequestAssignmentCheckbox({
	testId,
	checked,
	onToggle,
	ariaLabel,
	disabled,
	assigneeName,
}: {
	testId: string;
	checked: boolean;
	onToggle: () => void;
	ariaLabel: string;
	disabled: boolean;
	assigneeName: string | null | undefined;
}) {
	return (
		<AppTooltip
			side="top"
			text={assigneeName?.trim() ? assigneeName : NOT_ASSIGNED_LABEL}
			trigger={
				<div className="flex justify-center">
					<Checkbox
						data-testid={testId}
						checked={checked}
						onCheckedChange={onToggle}
						aria-label={ariaLabel}
						disabled={disabled}
					/>
				</div>
			}
		/>
	);
}
