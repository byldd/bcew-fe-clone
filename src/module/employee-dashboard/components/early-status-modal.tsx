"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { openErrorToast, openSuccessToast } from "@/components/toast";
import { OptionYesNo } from "@/utils/enums";
import { useAttendanceReasonNotification } from "../hooks/foreman";
import { useQueryClient } from "@tanstack/react-query";
import { timeDifferenceInHoursAndMinutes } from "@/module/schedule-management/lateness-detection/utils";
import { IEarlyStatusModalProps } from "../types";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
import TimeInput from "@/components/ui/time-input";
import { dateToUTCString, toFormattedDate } from "@/lib/utils/date";
import { DATE_FORMAT } from "@/types/date";
import { FormLabelRequired } from "@/components/ui/formLabelrequired";

export default function EarlyStatusModal({
	onClose,
	employeeDayTimeId,
	rosterEndTime,
	loggedEndTime,
}: IEarlyStatusModalProps) {
	const [didLeaveEarly, setDidLeaveEarly] = useState<OptionYesNo | null>(null);
	const [reason, setReason] = useState("");
	const tEmployee = useTypedTranslations(NAMESPACE.EMPLOYEE);
	const [claimedEndTime, setClaimedEndTime] = useState<string | undefined>();

	const attendanceMutation = useAttendanceReasonNotification(employeeDayTimeId);

	const queryClient = useQueryClient();

	const hasReason = reason.trim().length > 0;

	const canSubmit = didLeaveEarly !== null && hasReason && (didLeaveEarly === OptionYesNo.YES || !!claimedEndTime);

	const handleSubmit = () => {
		if (!canSubmit) return;

		let formattedClaimedEndTime: string | undefined;

		if (didLeaveEarly === OptionYesNo.NO && claimedEndTime) {
			formattedClaimedEndTime = dateToUTCString(claimedEndTime);
		}

		attendanceMutation.mutate(
			{
				early: {
					response: didLeaveEarly,
					reason,
					claimedEndTime: formattedClaimedEndTime,
				},
			},
			{
				onSuccess: (res) => {
					openSuccessToast(res?.message || tEmployee.notificationSentSuccessfully);
					queryClient.invalidateQueries({ queryKey: ["employee-day-time-technician"] });
					onClose();
				},
				onError: (error) => {
					openErrorToast({ error });
					onClose();
				},
			}
		);
	};
	return (
		<div className="space-y-4">
			{rosterEndTime && loggedEndTime && (
				<div className="space-y-0.5 text-xs font-medium">
					<p>You are marked for a {timeDifferenceInHoursAndMinutes(loggedEndTime, rosterEndTime)} early quit.</p>
					<p>Scheduled End Time: {toFormattedDate(rosterEndTime, DATE_FORMAT.HH_MM_AA_PM)}</p>
					<p>Actual End Time: {toFormattedDate(loggedEndTime, DATE_FORMAT.HH_MM_AA_PM)}</p>
				</div>
			)}
			<div className="space-y-3">
				<FormLabelRequired label={tEmployee.didYouLeaveEarly} required className="text-brand-dark60" />

				<RadioGroup
					value={didLeaveEarly ?? ""}
					onValueChange={(val) => setDidLeaveEarly(val as OptionYesNo)}
					className="flex flex-row space-x-24"
				>
					<div className="flex items-center space-x-2">
						<RadioGroupItem value={OptionYesNo.YES} id="early-yes" className="custom-radio" />
						<Label htmlFor="early-yes">{tEmployee.yes}</Label>
					</div>

					<div className="flex items-center space-x-2">
						<RadioGroupItem value={OptionYesNo.NO} id="early-no" className="custom-radio" />
						<Label htmlFor="early-no">{tEmployee.no}</Label>
					</div>
				</RadioGroup>
			</div>

			{didLeaveEarly === OptionYesNo.NO && loggedEndTime && (
				<div className="space-y-1">
					<FormLabelRequired label="What time did you actually leave?" required className="text-brand-dark60" />

					<TimeInput date={loggedEndTime} value={claimedEndTime} onChange={setClaimedEndTime} minuteStep={15} />
				</div>
			)}

			{/* Reason */}
			<div className="space-y-1">
				<FormLabelRequired label={tEmployee.stateReason} required className="text-brand-dark60" />
				<Textarea
					placeholder={tEmployee.typeHere}
					className="rounded-[8px]"
					value={reason}
					onChange={(e) => setReason(e.target.value)}
				/>
			</div>

			<div className="flex flex-col gap-2 pt-4">
				<Button onClick={onClose} variant="outline" className="w-full" disabled={attendanceMutation.isPending}>
					{tEmployee.cancel}
				</Button>

				<Button
					variant="filled"
					className="w-full"
					onClick={handleSubmit}
					loading={attendanceMutation.isPending}
					disabled={!canSubmit}
				>
					{tEmployee.update}
				</Button>
			</div>
		</div>
	);
}
