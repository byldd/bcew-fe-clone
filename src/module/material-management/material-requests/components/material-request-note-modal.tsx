"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { TextareaField } from "@/components/ui/textareaField";
import { MATERIAL_REQUEST_NOTE_MODE } from "../utils/enums";
import { MaterialRequestNoteModalProps } from "../utils/types";
import { NOTE_MAX_LENGTH } from "../utils/constants";

export default function MaterialRequestNoteModal({
	mode,
	initialValue = "",
	onCancel,
	onSubmit,
	isSubmitting = false,
}: MaterialRequestNoteModalProps) {
	const [note, setNote] = useState(initialValue ?? "");

	useEffect(() => {
		setNote(initialValue ?? "");
	}, [initialValue]);

	const helperText =
		mode === MATERIAL_REQUEST_NOTE_MODE.UPDATE ? "Update notes for reference" : "Add notes for reference";

	return (
		<div className="space-y-6 px-1">
			<TextareaField
				label={helperText}
				placeholder="Type here"
				value={note}
				onChange={(event) => setNote(event.target.value)}
				className="min-h-[140px] rounded-[12px] bg-brand-bgLightgrey text-[15px]"
				labelClassName="mb-2 text-[15px] font-normal text-brand-dark50"
				maxLength={NOTE_MAX_LENGTH}
			/>
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
					onClick={() => onSubmit(note)}
					disabled={isSubmitting}
				>
					Submit
				</Button>
			</div>
		</div>
	);
}
