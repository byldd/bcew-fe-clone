"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";

import { useCreateJobDailyNote } from "../hooks/useEmployeeSchedule";
import { IAddNoteModalContentProps } from "../types";
import { openErrorToast, openSuccessToast } from "@/components/toast";
import { TextareaField } from "@/components/ui/textareaField";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";

const AddNoteModalContent: React.FC<IAddNoteModalContentProps> = ({ onSave, userId, jobDailyRecordId }) => {
	const [note, setNote] = useState("");
	const { mutate: createNote } = useCreateJobDailyNote();
	const tEmployee = useTypedTranslations(NAMESPACE.EMPLOYEE);

	const handleSave = async () => {
		if (!userId || !jobDailyRecordId) {
			return;
		}
		if (!note.trim()) {
			openErrorToast({ message: tEmployee.pleaseEnterNote });
			return;
		}

		createNote(
			{
				userId: userId,
				jobDailyRecordId,
				note,
			},
			{
				onSuccess: () => {
					openSuccessToast(tEmployee.noteAddedSuccessfully);
					onSave();
				},
			}
		);
	};

	return (
		<div className="min-w-full space-y-4">
			<div className="px-1 py-2">
				<TextareaField
					id="note"
					placeholder={tEmployee.typeHere}
					value={note}
					onChange={(e) => setNote(e.target.value)}
					className="w-full bg-muted"
				/>
			</div>

			<Button variant="filled" onClick={handleSave} className="w-full">
				{tEmployee.save}
			</Button>
		</div>
	);
};

export default AddNoteModalContent;
