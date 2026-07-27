import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { TiPlus } from "react-icons/ti";
import { extractUTCDayAndTime, formatDateToMMDDYYYY } from "@/module/schedule-management/time-logs-management/utils";
import { IJobNotesCardProps } from "@/module/schedule-management/weekly-schedule-management/types/schedule-interface";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";

export function JobNotesCard({ notes, openAddNoteModal, isAddNoteAllowed = true }: IJobNotesCardProps) {
	const tEmployee = useTypedTranslations(NAMESPACE.EMPLOYEE);
	return (
		<div className="w-full space-y-[10px] rounded-[10px] border border-brand-dark10 bg-white px-4 py-3">
			<div className="flex items-center justify-between">
				<h3 className="text-base font-medium text-brand-dark">{tEmployee.notes}</h3>
				<Button
					variant={"outline"}
					className="flex h-[18px] w-[18px] items-center justify-center rounded-[4px] px-2 text-brand-dark"
					onClick={openAddNoteModal}
					disabled={!isAddNoteAllowed}
				>
					<TiPlus className="!h-3 !w-3" />
				</Button>
			</div>

			{notes &&
				notes.map((note, index) => (
					<div key={index} className="space-y-1">
						<div className="flex justify-between text-xs font-medium text-brand-dark50">
							<span>{formatDateToMMDDYYYY(note.createdAt)}</span>
							<span>{extractUTCDayAndTime(note.createdAt)}</span>
						</div>
						<div className="flex justify-between text-xs font-medium text-brand-dark50">
							<p className="break-words text-sm font-medium text-brand-dark">{note.note}</p>
							<span>{note.user?.name}</span>
						</div>

						{index !== notes.length - 1 && <Separator className="!my-3 bg-brand-dark10" />}
					</div>
				))}
		</div>
	);
}
