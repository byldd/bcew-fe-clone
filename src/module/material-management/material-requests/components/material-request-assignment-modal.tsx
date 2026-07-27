"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { TextareaField } from "@/components/ui/textareaField";
import { MaterialRequestAssignmentModalProps } from "../utils/types";

export default function MaterialRequestAssignmentModal({
	confirmLabel,
	cancelLabel = "Cancel",
	noteLabel = "Any specific note (Optional)",
	notePlaceholder = "Type here",
	initialValue = "",
	onConfirm,
	onCancel,
	isSubmitting = false,
}: MaterialRequestAssignmentModalProps) {
	const [note, setNote] = useState(initialValue ?? "");

	useEffect(() => {
		setNote(initialValue ?? "");
	}, [initialValue]);

	return (
		<div className="space-y-5 px-1">
			<TextareaField
				label={noteLabel}
				placeholder={notePlaceholder}
				value={note}
				onChange={(event) => setNote(event.target.value)}
			/>
			<div className="flex gap-4">
				<Button className="w-full" variant="outline" onClick={onCancel} disabled={isSubmitting}>
					{cancelLabel}
				</Button>
				<Button className="w-full" variant="filled" onClick={() => onConfirm(note)} disabled={isSubmitting}>
					{confirmLabel}
				</Button>
			</div>
		</div>
	);
}
