"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { openErrorToast, openSuccessToast } from "@/components/toast";
import { NAMESPACE } from "@/i18n/type";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { useCreateJobDailyNote } from "../hooks/useEmployeeSchedule";
import { IJobNotesSectionProps } from "../types";
import { CollapsibleSection } from "./collapsible-section";
import { toLocalFormattedDate } from "@/lib/utils/date";
import { DATE_FORMAT } from "@/types/date";

export function JobNotesSection({
	notes,
	userId,
	jobDailyRecordId,
	isAddNoteAllowed = true,
	onNoteAdded,
}: IJobNotesSectionProps) {
	const tEmployee = useTypedTranslations(NAMESPACE.EMPLOYEE);
	const [note, setNote] = useState("");
	const { mutate: createNote, isPending } = useCreateJobDailyNote();

	const handleSend = () => {
		if (!isAddNoteAllowed || !userId || !jobDailyRecordId || isPending) {
			return;
		}
		if (!note.trim()) {
			openErrorToast({ message: tEmployee.pleaseEnterNote });
			return;
		}

		createNote(
			{ userId, jobDailyRecordId, note },
			{
				onSuccess: () => {
					openSuccessToast(tEmployee.noteAddedSuccessfully);
					setNote("");
					onNoteAdded();
				},
				onError: (error) => openErrorToast({ error }),
			}
		);
	};

	return (
		<div className="w-full rounded-[10px] border border-brand-dark10 bg-white px-4 py-3">
			<CollapsibleSection title={tEmployee.notes} contentClassName="space-y-3">
				<Separator className="bg-brand-dark10" />

				<div className="flex items-center gap-2">
					<Input
						value={note}
						onChange={(e) => setNote(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								handleSend();
							}
						}}
						placeholder="Add a note about this job..."
						disabled={!isAddNoteAllowed}
						className="h-11 flex-1 bg-brand-bgLightgrey"
					/>
					<Button
						type="button"
						onClick={handleSend}
						disabled={!isAddNoteAllowed || isPending}
						className="h-11 w-11 shrink-0 rounded-[12px] bg-brand-dark p-0 hover:bg-gray-800 [&_svg]:!h-5 [&_svg]:!w-5"
						aria-label={tEmployee.addNewNote}
					>
						<Send className="text-white" />
					</Button>
				</div>

				{notes &&
					notes.map((noteItem, index) => (
						<div key={index} className="space-y-1">
							<div className="flex justify-between text-xs font-medium text-brand-dark50">
								<span>{toLocalFormattedDate(noteItem.createdAt, DATE_FORMAT.MM_DD_YYYY)}</span>
								<span>{toLocalFormattedDate(noteItem.createdAt, DATE_FORMAT.HH_MM_AA_PM)}</span>
							</div>
							<div className="flex justify-between text-xs font-medium text-brand-dark50">
								<p className="break-words text-sm font-medium text-brand-dark">{noteItem.note}</p>
								<span>{noteItem.user?.name}</span>
							</div>

							{index !== notes.length - 1 && <Separator className="!my-3 bg-brand-dark10" />}
						</div>
					))}
			</CollapsibleSection>
		</div>
	);
}
