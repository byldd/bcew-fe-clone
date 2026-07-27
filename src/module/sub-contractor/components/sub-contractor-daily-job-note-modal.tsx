"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";

import { useModal } from "@/hooks/useModal";
import { openErrorToast } from "@/components/toast";
import { useSubContractorDailyJobCreateJobDailyNote } from "@/module/sub-contractor/hooks/useSubContractorJobSchedule";
import { ISubContractorDailyJobAddNoteModalContentProps } from "@/module/sub-contractor/types";
import { TextareaField } from "@/components/ui/textareaField";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";

const SubContractorDailyJobAddNoteModalContent: React.FC<ISubContractorDailyJobAddNoteModalContentProps> = ({
	onSave: handleRefetch,
	userId,
	jobDailyRecordId,
	subContractorType,
}) => {
	const [note, setNote] = useState("");
	const tEmployee = useTypedTranslations(NAMESPACE.EMPLOYEE);
	const { Modal, openModal } = useModal();
	const { mutate: createNote } = useSubContractorDailyJobCreateJobDailyNote(
		subContractorType?.user,
		subContractorType?.subcontractorCrew
	);

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
				userId,
				jobDailyRecordId,
				note,
			},
			{
				onSuccess: () => {
					openModal({
						modalTitle: tEmployee.noteAddedSuccessfully,
						modalView: (
							<Button variant={"outline"} className="w-full" onClick={handleRefetch}>
								{tEmployee.okay}
							</Button>
						),
					});
				},
			}
		);
	};

	return (
		<div className="space-y-4 px-0">
			<div className="px-1 py-2">
				<TextareaField
					id="note"
					placeholder={tEmployee.typeHere}
					value={note}
					onChange={(e) => setNote(e.target.value)}
					className="min-h-[120px] bg-muted"
				/>
			</div>

			<Button variant="filled" onClick={handleSave} className="w-full">
				{tEmployee.save}
			</Button>
			<Modal />
		</div>
	);
};

export default SubContractorDailyJobAddNoteModalContent;
