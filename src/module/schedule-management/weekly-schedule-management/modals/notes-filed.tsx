import React from "react";
import { IWeekScheduleResponse } from "../types/schedule-interface";
import { formatDateToMMDDYYYY } from "../../time-logs-management/utils";
import { Separator } from "@/components/ui/separator";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";

const NotesFiled = ({ notes }: { notes: IWeekScheduleResponse["dailyJobs"][number]["notes"] }) => {
	const tschedule = useTypedTranslations(NAMESPACE.SCHEDULE);

	if (notes?.length === 0) return null;

	return (
		<div className="space-y-3">
			<p className="text-base font-medium text-brand-dark">{tschedule.notes}</p>
			{notes.map((note, index) => (
				<div key={note.id} className="space-y-1">
					<p className="font-medim text-xs text-brand-dark50">{formatDateToMMDDYYYY(note.createdAt)}</p>

					<div className="flex items-center justify-between">
						<p className="text-sm font-medium text-brand-dark">{note.note}</p>
						<p className="text-sm font-medium text-brand-dark50">{note?.user?.name}</p>
					</div>
					{index !== notes.length - 1 && <Separator className="!my-3 bg-brand-dark10" />}
				</div>
			))}
		</div>
	);
};

export default NotesFiled;
