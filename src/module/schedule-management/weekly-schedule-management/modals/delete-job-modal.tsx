"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useDeleteDailyJob } from "../hooks/useSchedule";
import { openErrorToast, openSuccessToast } from "@/components/toast";
import { useQueryClient } from "@tanstack/react-query";

import { TextareaField } from "@/components/ui/textareaField";
import { useHandleJobOperation } from "../hooks/useHandleJobOperation";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import useAuthStore from "@/store/auth-store";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";

interface DeleteJobModalProps {
	onClose: () => void;
	dailyJobId: string;
	onDeleteSuccess?: () => void;
}

const DeleteJobModal: React.FC<DeleteJobModalProps> = ({ onClose, dailyJobId, onDeleteSuccess }) => {
	const [message, setMessage] = useState("");
	const [sendSms, setSendSms] = useState(false);
	const queryClient = useQueryClient();
	const { onDeleteDailyJob } = useHandleJobOperation();
	const { user } = useAuthStore((state) => state);
	const tCommon = useTypedTranslations(NAMESPACE.COMMON);
	const tschedule = useTypedTranslations(NAMESPACE.SCHEDULE);
	const { mutate: deleteDailyJob, isPending } = useDeleteDailyJob();
	const onDelete = () => {
		deleteDailyJob(
			{ id: dailyJobId, message, sendSms },
			{
				onSuccess: () => {
					void queryClient.invalidateQueries({ queryKey: ["week-schedule"] });
					openSuccessToast(tschedule.jobDeletedSuccessfully);
					onClose();
					onDeleteSuccess?.();
					onDeleteDailyJob(dailyJobId);
				},
				onError: (error) => {
					openErrorToast({ error });
				},
			}
		);
	};
	return (
		<div className="space-y-4">
			<div className="space-y-1">
				<Label className="text-sm text-brand-grey">{tCommon.addMessageHere}</Label>
				<div className="px-0.5">
					<TextareaField
						id="cancelMessage"
						className="mb-6 w-full rounded-[10px] border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-black"
						placeholder={tCommon.typeHere}
						value={message}
						onChange={(e) => setMessage(e.target.value)}
					/>
				</div>
			</div>
			{user?.role?.canSendNotification && (
				<div className="flex items-center gap-2">
					<Checkbox checked={sendSms} onCheckedChange={(checked) => setSendSms(checked === true)} />
					<Label className="text-sm font-normal text-brand-grey md:text-sm">{tCommon.sendSmsNotification}</Label>
				</div>
			)}
			<div className="mt-4 flex justify-end gap-2">
				<Button
					type="button"
					key="cancel-delete-job"
					variant={"outline"}
					disabled={isPending}
					onClick={onClose}
					className="w-full"
				>
					{tCommon.cancel}
				</Button>
				<Button
					type="button"
					key="delete-job"
					disabled={isPending}
					loading={isPending}
					variant={"filled"}
					onClick={onDelete}
					className="w-full bg-brand-red hover:bg-red-700"
				>
					{tCommon.sendMessageAndDelete}
				</Button>
			</div>
		</div>
	);
};

export default DeleteJobModal;
