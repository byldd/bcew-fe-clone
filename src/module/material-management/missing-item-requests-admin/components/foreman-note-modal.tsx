"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ForemanNoteModalProps } from "../utils/types";
import { MAX_LENGTH } from "../utils/constants";

export default function ForemanNoteModal({
	initialValue,
	requesterName,
	description,
	isSubmitting,
	onCancel,
	onConfirm,
}: ForemanNoteModalProps) {
	const [note, setNote] = useState(initialValue ?? "");

	return (
		<div className="flex flex-col gap-3">
			{(requesterName || description) && (
				<div className="space-y-1 rounded-[12px] bg-brand-bgLightgrey p-3">
					{requesterName && <p className="text-sm font-medium text-brand-dark50">From {requesterName}</p>}
					{description && <p className="whitespace-pre-wrap text-sm text-brand-dark">{description}</p>}
				</div>
			)}

			<div className="space-y-1">
				<Label className="text-sm font-medium text-brand-dark50">Note to Technician</Label>
				<div className="px-1">
					<Textarea
						value={note}
						onChange={(event) => setNote(event.target.value)}
						placeholder="Write your response"
						maxLength={MAX_LENGTH}
						className="min-h-[140px] rounded-[12px] bg-brand-bgLightgrey text-sm text-brand-dark"
					/>
				</div>
				<p className="mt-1 text-right text-[10px] text-brand-dark50">
					{note.length}/{MAX_LENGTH}
				</p>
			</div>

			<div className="flex justify-between gap-2">
				<Button variant="outline" onClick={onCancel} disabled={isSubmitting} className="w-full">
					Cancel
				</Button>
				<Button
					variant="filled"
					onClick={() => onConfirm(note)}
					loading={isSubmitting}
					disabled={!note.length || isSubmitting}
					className="w-full"
				>
					Send Response
				</Button>
			</div>
		</div>
	);
}
