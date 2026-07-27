"use client";

import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const FOUNDATION_OPTIONS = ["Yes", "No"];

export default function ScheduleFoundationSelect({
	defaultValue,
	disabled,
}: {
	defaultValue: string | null;
	disabled?: boolean;
}) {
	const [value, setValue] = useState<string | undefined>(defaultValue ?? undefined);

	return (
		<Select value={value} onValueChange={setValue} disabled={disabled}>
			<SelectTrigger className="mx-auto h-6 w-auto justify-center gap-1 border-0 bg-transparent px-2 text-xs font-medium text-brand-dark shadow-none focus:ring-0 data-[placeholder]:text-brand-dark50">
				<SelectValue placeholder="Select" />
			</SelectTrigger>
			<SelectContent>
				{FOUNDATION_OPTIONS.map((option) => (
					<SelectItem key={option} value={option} className="text-sm">
						{option}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
