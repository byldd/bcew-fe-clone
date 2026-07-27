import React, { useState } from "react";
import { IEmployeeTravelPayRequestsResponse } from "../types";
import { toFormattedDate } from "@/lib/utils/date";
import { TextareaField } from "@/components/ui/textareaField";
import { Button } from "@/components/ui/button";
import { openErrorToast, openSuccessToast } from "@/components/toast";
import { useAddNoteToTravelPayRequest } from "../hooks/useEmployeeTravelPay";
import { useQueryClient } from "@tanstack/react-query";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";

const NotesHistoryModal = ({
	notes,
	onClose,
	travelPayRequestId,
}: {
	notes: IEmployeeTravelPayRequestsResponse[number]["notes"];
	travelPayRequestId: string;
	onClose: () => void;
}) => {
	const tEmployee = useTypedTranslations(NAMESPACE.EMPLOYEE);

	const [note, setNote] = useState("");
	const { mutateAsync: addNote, isPending } = useAddNoteToTravelPayRequest();
	const queryClient = useQueryClient();
	const handleAddNote = async () => {
		if (!note) {
			openErrorToast({ message: tEmployee.pleaseEnterNote });
			return;
		}

		await addNote(
			{ travelPayRequestId, note },
			{
				onSuccess: () => {
					openSuccessToast(tEmployee.noteAddedSuccessfully);
					setNote("");
					onClose();
					queryClient.invalidateQueries({ queryKey: ["employee-travel-pay-requests"] });
				},
				onError: (error) => {
					openErrorToast({ error: error });
				},
			}
		);
	};
	return (
		<div className="space-y-4">
			{notes.map((note) => (
				<div key={note.id} className="flex flex-col space-y-1">
					<p className="text-xs font-normal text-brand-grey">{toFormattedDate(note.createdAt)}</p>
					<p className="text-sm font-medium text-brand-dark"> {note.note}</p>
				</div>
			))}
			<div className="space-y-1">
				<p className="text-xs font-normal text-brand-grey">{tEmployee.addNewNote}</p>
				<div className="px-0.5">
					<TextareaField
						placeholder={tEmployee.typeHere}
						value={note}
						onChange={(e) => setNote(e.target.value)}
						className="w-full bg-muted"
					/>
				</div>
			</div>
			<div className="flex flex-col gap-2">
				<Button variant="outline" className="w-full" onClick={onClose}>
					{tEmployee.cancel}
				</Button>
				<Button variant="filled" onClick={handleAddNote} className="w-full" loading={isPending} disabled={!note}>
					{tEmployee.save}
				</Button>
			</div>
		</div>
	);
};

export default NotesHistoryModal;
