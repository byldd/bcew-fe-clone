"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ISendJobAlertModalProps } from "../types/schedule-interface";

import { TextareaField } from "@/components/ui/textareaField";

import { useSendJobAlerts } from "../hooks/useSchedule";
import { openErrorToast, openSuccessToast } from "@/components/toast";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import useAuthStore from "@/store/auth-store";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";

export const SendJobAlertModal: React.FC<ISendJobAlertModalProps> = ({ onClose, dailyJobId }) => {
	const [message, setMessage] = useState("");
	const tCommon = useTypedTranslations(NAMESPACE.COMMON);
	const tschedule = useTypedTranslations(NAMESPACE.SCHEDULE);
	const [sendSms, setSendSms] = useState(false);
	const { mutate: sendJobAlert, isPending: isSendingJobAlert } = useSendJobAlerts();
	const { user } = useAuthStore((state) => state);

	const handleSendAlert = () => {
		sendJobAlert(
			{ dailyJobId, message, sendSms },
			{
				onSuccess: () => {
					openSuccessToast(tschedule.jobAlertsSentSuccessfully);
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
			<Label className="text-sm text-brand-grey">{tCommon.addMessage}</Label>
			<TextareaField
				placeholder={tCommon.typeHere}
				value={message}
				onChange={(e) => setMessage(e.target.value)}
				className="max-h-[300px] rounded-md border border-black bg-gray-100"
			/>

			{user?.role?.canSendNotification && (
				<div className="mt-2 flex items-center gap-2">
					<Checkbox checked={sendSms} onCheckedChange={(checked) => setSendSms(checked === true)} />
					<Label className="mt-2 text-sm font-normal text-brand-grey md:text-sm">{tCommon.sendSmsNotification}</Label>
				</div>
			)}
			<div className="mt-4 flex items-center justify-end gap-2">
				<Button key="cancel-send-alerts" type="button" variant={"outline"} onClick={onClose} className="w-full">
					{tCommon.cancel}
				</Button>
				<Button
					key="send-alerts"
					type="button"
					onClick={handleSendAlert}
					disabled={isSendingJobAlert || !message}
					variant={"filled"}
					className="w-full"
				>
					{tCommon.send}
				</Button>
			</div>
		</div>
	);
};
