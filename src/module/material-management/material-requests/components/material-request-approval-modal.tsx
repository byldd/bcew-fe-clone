"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { TextareaField } from "@/components/ui/textareaField";
import { MaterialRequestApprovalModalProps } from "../utils/types";

export default function MaterialRequestApprovalModal({
	confirmLabel,
	cancelLabel = "Cancel",
	noteLabel = "Reason (Optional)",
	notePlaceholder = "Type here",
	initialValue = "",
	onConfirm,
	onCancel,
	isSubmitting = false,
	requireNote = false,
}: MaterialRequestApprovalModalProps) {
	const [note, setNote] = useState(initialValue ?? "");
	const [showError, setShowError] = useState(false);

	useEffect(() => {
		setNote(initialValue ?? "");
	}, [initialValue]);

	const isNoteEmpty = !note.trim();

	const handleConfirm = () => {
		if (requireNote && isNoteEmpty) {
			setShowError(true);
			return;
		}
		onConfirm(note);
	};

	return (
		<div className="space-y-5 px-1">
			<TextareaField
				label={noteLabel}
				placeholder={notePlaceholder}
				value={note}
				onChange={(event) => {
					setNote(event.target.value);
					if (showError) setShowError(false);
				}}
				error={requireNote && showError && isNoteEmpty ? "Reason is required" : undefined}
			/>
			<div className="flex gap-4">
				<Button className="w-full" variant="outline" onClick={onCancel} disabled={isSubmitting}>
					{cancelLabel}
				</Button>
				<Button
					className="w-full"
					variant="filled"
					onClick={handleConfirm}
					disabled={isSubmitting || (requireNote && isNoteEmpty)}
				>
					{confirmLabel}
				</Button>
			</div>
		</div>
	);
}
