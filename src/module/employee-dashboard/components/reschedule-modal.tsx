import { openErrorToast, openSuccessToast } from "@/components/toast";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { NAMESPACE } from "@/i18n/type";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { getTodayDate, toMidnightDateString } from "@/lib/utils/date";
import { useRescheduleJob } from "@/module/job/hooks/useEmployeeSchedule";
import { useQueryClient } from "@tanstack/react-query";
import { addDays } from "date-fns";
import React, { useState } from "react";

const RescheduleModal = ({ onClose, dailyJobId }: { onClose: () => void; dailyJobId: string }) => {
	const { mutate: rescheduleJobMutation, isPending: isRescheduleJob } = useRescheduleJob();

	const [newDate, setNewDate] = useState<Date | undefined>(undefined);
	const queryClient = useQueryClient();
	const tEmployee = useTypedTranslations(NAMESPACE.EMPLOYEE);

	const handleReschedule = () => {
		if (newDate) {
			rescheduleJobMutation(
				{ dailyJobId, newDate: toMidnightDateString(newDate) },
				{
					onSuccess: () => {
						openSuccessToast(tEmployee.jobRescheduledSuccessfully);
						onClose();
						void queryClient.invalidateQueries({ queryKey: ["employee-schedule"] });
					},
					onError: (error) => {
						openErrorToast({ error });
					},
				}
			);
		}
	};

	return (
		<div>
			<DatePicker
				value={newDate}
				onChange={(date) => setNewDate(date)}
				placeholder={tEmployee.selectNewDate}
				disabledDate={{ before: addDays(getTodayDate(), 1), after: addDays(getTodayDate(), 10) }}
			/>
			<div className="mt-3 flex w-full justify-between gap-2">
				<Button loading={isRescheduleJob} variant={"outline"} className="w-full" onClick={onClose}>
					{tEmployee.cancel}
				</Button>
				<Button
					loading={isRescheduleJob}
					disabled={!newDate || isRescheduleJob}
					variant={"filled"}
					className="w-full"
					onClick={handleReschedule}
				>
					{tEmployee.reschedule}
				</Button>
			</div>
		</div>
	);
};

export default RescheduleModal;
