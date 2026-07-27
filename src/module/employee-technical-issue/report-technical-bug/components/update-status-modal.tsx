"use client";

import { Button } from "@/components/ui/button";
import { SelectField } from "@/components/ui/selectField";

type Props = {
	onClose: () => void;
};

export default function UpdateStatusModal({}: Props) {
	return (
		<div className="h-screen space-y-4 rounded-[12px] bg-white pb-5">
			<p className="mb-4 text-sm text-brand-dark50">
				Update the status of this ticket. The employee will be notified of the changes.
			</p>

			<div className="space-y-2">
				<p className="text-xs text-brand-grey">Current Status</p>
				<p className="font-inter text-sm font-semibold">ASANA Created (#5689)</p>
			</div>

			<div className="space-y-2">
				<p className="text-xs text-brand-grey">Change Status to</p>
				<SelectField
					placeholder="Select new status"
					options={[
						{ label: "In-Progress", value: "IN_PROGRESS" },
						{ label: "Resolved", value: "RESOLVED" },
					]}
				/>
			</div>

			<div className="space-y-2">
				<p className="text-xs text-brand-grey"> Add Note</p>
				<textarea
					className="w-full resize-none rounded-[8px] border p-3 text-sm"
					rows={3}
					placeholder="Add context for this status change"
				/>
			</div>

			<div className="fixed inset-x-0 bottom-0 border-t bg-white px-4 py-3">
				<div className="mx-auto flex max-w-md gap-3">
					<Button variant="filled" className="h-11 flex-1">
						Save
					</Button>
				</div>
			</div>
		</div>
	);
}
