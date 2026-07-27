"use client";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { JobType } from "@/module/employee-dashboard/enums/weekend-type";

type Props = {
	value?: JobType;
	onChange: (value: JobType) => void;
};

export function JobTypeRadioGroup({ value, onChange }: Props) {
	return (
		<RadioGroup value={value} onValueChange={(val) => onChange(val as JobType)} className="flex gap-6">
			<div className="flex items-center space-x-2">
				<RadioGroupItem id="special-job" value={JobType.SPECIAL} />
				<Label htmlFor="special-job" className="mt-2 text-xs text-brand-dark">
					Special Job
				</Label>
			</div>

			<div className="flex items-center space-x-2">
				<RadioGroupItem id="project-job" value={JobType.PROJECT} />
				<Label htmlFor="project-job" className="mt-2 text-xs text-brand-dark">
					Project Job
				</Label>
			</div>
		</RadioGroup>
	);
}
