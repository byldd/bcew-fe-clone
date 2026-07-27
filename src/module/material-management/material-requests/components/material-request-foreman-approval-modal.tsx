"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TextareaField } from "@/components/ui/textareaField";
import type { MaterialRequestForemanReassignModalProps } from "../utils/types";

export default function MaterialRequestForemanReassignModal({
	onConfirm,
	onCancel,
}: MaterialRequestForemanReassignModalProps) {
	const [note, setNote] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleConfirm = async () => {
		if (!note.trim()) return;
		setIsSubmitting(true);
		try {
			await onConfirm(note.trim());
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="space-y-5 px-1">
			<TextareaField
				label="Add notes*"
				placeholder="Type here"
				value={note}
				onChange={(e) => setNote(e.target.value)}
				className="min-h-[120px] rounded-[12px] bg-brand-bgLightgrey text-[15px]"
				labelClassName="mb-2 text-[15px] font-normal text-brand-dark50"
			/>
			<div className="rounded-[10px] border border-amber-200 bg-amber-50 px-4 py-3">
				<p className="text-[13px] text-amber-700">
					Please note this request with the above mentioned note will be re-assigned to the Production Manager for the
					review.
				</p>
			</div>
			<div className="flex gap-4 pt-1">
				<Button
					type="button"
					variant="outline"
					className="w-full rounded-[12px] text-base font-medium"
					onClick={onCancel}
					disabled={isSubmitting}
				>
					Cancel
				</Button>
				<Button
					type="button"
					variant="filled"
					className="w-full rounded-[12px] text-base font-medium"
					onClick={handleConfirm}
					loading={isSubmitting}
					disabled={isSubmitting || !note.trim()}
				>
					Submit & Assign
				</Button>
			</div>
		</div>
	);
}
