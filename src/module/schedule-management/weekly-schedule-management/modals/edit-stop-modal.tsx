import { Button } from "@/components/ui/button";
import { InputField } from "@/components/ui/inputField";
import React, { useState } from "react";
import { IEditStopModalProps } from "../types/schedule-interface";
import { useUpdateDailyJobEmployee } from "../hooks/useSchedule";
import { openErrorToast, openSuccessToast } from "@/components/toast";
import { useQueryClient } from "@tanstack/react-query";

import StopNumberInput from "@/components/ui/stop-number-input";
import { Label } from "@/components/ui/label";
import { useHandleJobOperation } from "../hooks/useHandleJobOperation";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";

const EditStopModal = ({ employee, onClose, dailyJob }: IEditStopModalProps) => {
	const { mutate: updateDailyJobEmployee, isPending } = useUpdateDailyJobEmployee();
	const [newStopNumber, setNewStopNumber] = useState(employee.stopNumber || null);
	const queryClient = useQueryClient();
	const { onUpdateDailyJob } = useHandleJobOperation();
	const tjobCards = useTypedTranslations(NAMESPACE.JOB_CARDS);
	const tschedule = useTypedTranslations(NAMESPACE.SCHEDULE);

	const tCommon = useTypedTranslations(NAMESPACE.COMMON);

	const handleSave = () => {
		updateDailyJobEmployee(
			{ id: employee.id!, payload: { stopNumber: newStopNumber } },
			{
				onSuccess: (data) => {
					openSuccessToast(tjobCards.stopNumberUpdatedSuccessfully);
					queryClient.invalidateQueries({ queryKey: ["week-schedule"] });
					onUpdateDailyJob({
						updatedJob: data,
						dailyJobId: dailyJob.id,
					});
					onClose();
				},
				onError: (error) => {
					openErrorToast({ error });
				},
			}
		);
	};

	return (
		<div className="p-1">
			<div className="flex justify-between gap-4">
				<div className="flex-1">
					<InputField label={tschedule.crewMemberName} value={employee?.employee?.user?.name} disabled />
				</div>
				<div className="flex-1">
					<Label className="text-sm font-normal text-brand-grey">{tschedule.stopNumber}</Label>
					<StopNumberInput
						value={newStopNumber ?? undefined}
						onChange={(stopNumber) => setNewStopNumber(stopNumber)}
						placeholder={tschedule.enterStopNumber}
					/>
				</div>
			</div>
			<Button onClick={handleSave} className="mt-4 w-full" variant={"filled"} disabled={isPending}>
				{tCommon.save}
			</Button>
		</div>
	);
};

export default EditStopModal;
