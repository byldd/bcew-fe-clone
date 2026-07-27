import { Button } from "@/components/ui/button";
import { TextareaField } from "@/components/ui/textareaField";
import React, { useState } from "react";
import { IRemoveMemberModalProps } from "../types/schedule-interface";
import { useRemoveDailyJobEmployee } from "../hooks/useSchedule";
import { openErrorToast, openSuccessToast } from "@/components/toast";
import { useQueryClient } from "@tanstack/react-query";
import { useHandleJobOperation } from "../hooks/useHandleJobOperation";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import useAuthStore from "@/store/auth-store";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";

const RemoveMemberModal = ({ assignmentIds, onClose, dailyJob }: IRemoveMemberModalProps) => {
	const { mutate: removeDailyJobEmployee, isPending } = useRemoveDailyJobEmployee();
	const { user } = useAuthStore((state) => state);
	const [message, setMessage] = useState("");
	const [sendSms, setSendSms] = useState(false);
	const queryClient = useQueryClient();
	const { onUpdateDailyJob } = useHandleJobOperation();
	const tjobCards = useTypedTranslations(NAMESPACE.JOB_CARDS);
	const tschedule = useTypedTranslations(NAMESPACE.SCHEDULE);
	const tCommon = useTypedTranslations(NAMESPACE.COMMON);

	const handleRemove = () => {
		removeDailyJobEmployee(
			{ assignmentIds: assignmentIds, dailyJobId: dailyJob.id, message, sendSms },
			{
				onSuccess: (data) => {
					openSuccessToast(tjobCards.crewMemberRemovedSuccessfully);
					queryClient.invalidateQueries({ queryKey: ["week-schedule"] });
					onClose();
					onUpdateDailyJob({ dailyJobId: dailyJob.id, updatedJob: data });
				},
				onError: (error) => {
					openErrorToast({ error });
				},
			}
		);
	};

	return (
		<div className="p-1">
			<div className="flex flex-col gap-4">
				<div className="flex-1">
					<TextareaField label={tCommon.addMessageHere} value={message} onChange={(e) => setMessage(e.target.value)} />
				</div>
				{user?.role?.canSendNotification && (
					<div className="flex items-center justify-between gap-2 overflow-hidden px-2 py-2">
						<Label className="text-sm font-normal text-brand-grey md:text-sm">{tschedule.sendSmsNotification}</Label>
						<Checkbox checked={sendSms} onCheckedChange={(checked) => setSendSms(checked === true)} />
					</div>
				)}
			</div>
			<Button disabled={isPending} variant={"outline"} onClick={onClose} className="mt-4 w-full">
				{tCommon.cancel}
			</Button>

			<Button disabled={isPending} className="mt-4 w-full" variant={"filled"} onClick={handleRemove}>
				{tCommon.save}
			</Button>
		</div>
	);
};

export default RemoveMemberModal;
