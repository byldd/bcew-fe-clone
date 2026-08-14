"use client";

import { ReactNode } from "react";
import { UseFormReturn, type UseFormRegisterReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ReviewCard } from "@/module/driving-safety/incident-reports/components/review-card";
import { IJobSiteSafetyEmailDraft } from "../types";

const EmailField = ({
	label,
	disabled,
	registration,
}: {
	label: string;
	disabled: boolean;
	registration: UseFormRegisterReturn;
}) => (
	<div className="flex items-center gap-3">
		<label className="w-16 shrink-0 text-sm text-brand-dark50">{label}</label>
		<Input disabled={disabled} className="min-w-0 flex-1" {...registration} />
	</div>
);

// The report itself sits between the intro and closing and is never editable —
// it has to match the record that was approved. Only the wrapper the Fleet
// Manager writes around it can be changed before the email goes out.
const JobSiteSafetyEmailPreview = ({
	form,
	disabled,
	children,
}: {
	form: UseFormReturn<IJobSiteSafetyEmailDraft>;
	disabled: boolean;
	children: ReactNode;
}) => (
	<ReviewCard title="Email Preview">
		<div className="space-y-3">
			<EmailField label="From" disabled={disabled} registration={form.register("from")} />
			<EmailField label="To" disabled={disabled} registration={form.register("to")} />
			<EmailField label="Cc" disabled={disabled} registration={form.register("cc")} />
			<EmailField label="Subject" disabled={disabled} registration={form.register("subject")} />
		</div>

		<div className="mt-4 space-y-4 border-t border-brand-dark10 pt-4">
			<Textarea rows={3} disabled={disabled} className="text-sm leading-relaxed" {...form.register("intro")} />

			{children}

			<Textarea rows={5} disabled={disabled} className="text-sm leading-relaxed" {...form.register("closing")} />
		</div>
	</ReviewCard>
);

export default JobSiteSafetyEmailPreview;
