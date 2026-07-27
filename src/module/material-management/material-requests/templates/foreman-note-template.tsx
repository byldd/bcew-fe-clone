"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { TextareaField } from "@/components/ui/textareaField";
import { ChevronLeft } from "lucide-react";
import { useUpdateForemanMaterialRequestNote } from "../hooks/useMaterialRequests";
import { openErrorToast, openSuccessToast } from "@/components/toast";
import { NOTE_MAX_LENGTH } from "../utils/constants";

export default function ForemanNoteTemplate({
	pullListItemId,
	initialNote,
}: {
	pullListItemId: string;
	initialNote: string;
}) {
	const router = useRouter();
	const [note, setNote] = useState(initialNote);
	const { mutate, isPending } = useUpdateForemanMaterialRequestNote();

	useEffect(() => {
		setNote(initialNote);
	}, [initialNote]);

	const handleSubmit = () => {
		mutate(
			{ pullListItemId, note: note.trim() || null },
			{
				onSuccess: () => {
					openSuccessToast(note.trim() ? "Note saved." : "Note removed.");
					router.back();
				},
				onError: (error) => openErrorToast({ error }),
			}
		);
	};

	return (
		<div className="min-h-screen bg-brand-bgLightgrey px-4 py-6">
			<div className="mb-6 flex items-center gap-2">
				<button
					type="button"
					onClick={() => router.back()}
					className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-[#1515151A] bg-white"
					aria-label="Go back"
				>
					<ChevronLeft className="h-5 w-5 text-brand-dark" />
				</button>
				<h1 className="text-lg font-semibold text-brand-dark">Foreman Note</h1>
			</div>

			<div className="space-y-6 rounded-[16px] bg-white p-5 shadow-sm">
				<TextareaField
					label={initialNote ? "Update note" : "Add note"}
					placeholder="Type your note here..."
					value={note}
					onChange={(e) => setNote(e.target.value)}
					className="min-h-[160px] rounded-[12px] bg-brand-bgLightgrey text-[15px]"
					labelClassName="mb-2 text-[15px] font-normal text-brand-dark50"
					maxLength={NOTE_MAX_LENGTH}
				/>

				<div className="flex gap-3">
					<Button
						type="button"
						variant="outline"
						className="h-12 w-full rounded-[12px] text-base font-medium"
						onClick={() => router.back()}
						disabled={isPending}
					>
						Cancel
					</Button>
					<Button
						type="button"
						variant="filled"
						className="h-12 w-full rounded-[12px] text-base font-medium"
						onClick={handleSubmit}
						disabled={isPending}
					>
						{isPending ? "Saving..." : "Save Note"}
					</Button>
				</div>
			</div>
		</div>
	);
}
