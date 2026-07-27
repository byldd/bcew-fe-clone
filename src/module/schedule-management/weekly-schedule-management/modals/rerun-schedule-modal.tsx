import React from "react";
import { IRerunModalProps } from "../types/schedule-interface";
import { Button } from "@/components/ui/button";
import { useReRunWeekSchedule } from "../hooks/useSchedule";
import { openErrorToast, openSuccessToast } from "@/components/toast";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";

const RerunModal: React.FC<IRerunModalProps> = ({ onClose }: { onClose: () => void }) => {
	const { mutate: reRunWeekScheduleMutation, isPending } = useReRunWeekSchedule();
	const tschedule = useTypedTranslations(NAMESPACE.SCHEDULE);
	const tCommon = useTypedTranslations(NAMESPACE.COMMON);

	const handleReRun = () => {
		reRunWeekScheduleMutation(undefined, {
			onSuccess: () => {
				onClose();
				openSuccessToast(tschedule.scheduleRerunSuccess);
			},
			onError: (error) => {
				openErrorToast({ error });
				onClose();
			},
		});
	};
	return (
		<div className="py-1">
			<p className="mb-6 text-sm text-brand-dark50">{tschedule.reRunScheduleDescription}</p>
			<div className="flex items-center justify-end gap-2">
				<Button variant={"outline"} onClick={onClose} className="w-full">
					{tCommon.cancel}
				</Button>
				<Button variant={"filled"} onClick={handleReRun} disabled={isPending} className="w-full">
					{tschedule.reRunSchedule}
				</Button>
			</div>
		</div>
	);
};

export default RerunModal;
