"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useAttendanceReasonNotification } from "../hooks/foreman";
import { openErrorToast, openSuccessToast } from "@/components/toast";
import { OptionYesNo } from "@/utils/enums";
import { useQueryClient } from "@tanstack/react-query";
import { timeDifferenceInHoursAndMinutes } from "@/module/schedule-management/lateness-detection/utils";
import { ILateStatusModalProps } from "../types";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
import TimeInput from "@/components/ui/time-input";
import { dateToUTCString, toFormattedDate } from "@/lib/utils/date";
import { DATE_FORMAT } from "@/types/date";
import { FormLabelRequired } from "@/components/ui/formLabelrequired";

export default function LateStatusModal({
	onClose,
	employeeDayTimeId,
	rosterStartTime,
	loggedStartTime,
}: ILateStatusModalProps) {
	const [isLate, setIsLate] = useState<OptionYesNo | null>(null);
	const [reason, setReason] = useState("");
	const tEmployee = useTypedTranslations(NAMESPACE.EMPLOYEE);
	const [claimedStartTime, setClaimedStartTime] = useState<string | undefined>();

	const latenessMutation = useAttendanceReasonNotification(employeeDayTimeId);

	const queryClient = useQueryClient();

	const hasReason = reason.trim().length > 0;

	const canSubmit = isLate !== null && hasReason && (isLate === OptionYesNo.YES || !!claimedStartTime);

	const handleSubmit = () => {
		if (!canSubmit) return;

		let formattedClaimedStartTime: string | undefined;

		if (isLate === OptionYesNo.NO && claimedStartTime) {
			formattedClaimedStartTime = dateToUTCString(claimedStartTime);
		}

		latenessMutation.mutate(
			{
				late: {
					response: isLate,
					reason,
					claimedStartTime: formattedClaimedStartTime,
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
			{rosterStartTime && loggedStartTime && (
				<div className="space-y-0.5 text-xs font-medium">
					<p>You are marked for a {timeDifferenceInHoursAndMinutes(loggedStartTime, rosterStartTime)} late start.</p>
					<p>Scheduled Start Time: {toFormattedDate(rosterStartTime, DATE_FORMAT.HH_MM_AA_PM)}</p>
					<p>Actual Start Time: {toFormattedDate(loggedStartTime, DATE_FORMAT.HH_MM_AA_PM)}</p>
				</div>
			)}
			<div className="space-y-3">
				<FormLabelRequired
					label={tEmployee.wereYouLate}
					className="font-inter text-sm font-normal text-brand-dark60"
					required
				/>
				<RadioGroup
					value={isLate ?? ""}
					onValueChange={(val) => setIsLate(val as OptionYesNo)}
					className="flex flex-row space-x-16"
				>
					<div className="flex items-center space-x-2">
						<RadioGroupItem value={OptionYesNo.YES} id="late-yes" className="custom-radio" />
						<Label htmlFor="late-yes" className="text-sm">
							{tEmployee.yes}
						</Label>
					</div>

					<div className="flex items-center space-x-2">
						<RadioGroupItem value={OptionYesNo.NO} id="late-no" className="custom-radio" />
						<Label htmlFor="late-no" className="text-sm">
							{tEmployee.no}
						</Label>
					</div>
				</RadioGroup>
			</div>

			{isLate === OptionYesNo.NO && loggedStartTime && (
				<div className="space-y-1">
					<FormLabelRequired
						label="	What time did you actually start?"
						className="font-inter text-sm font-normal text-brand-dark60"
						required
					/>

					<TimeInput date={loggedStartTime} value={claimedStartTime} onChange={setClaimedStartTime} minuteStep={15} />
				</div>
			)}

			{/* Reason always visible */}
			<div className="space-y-1">
				<FormLabelRequired
					label={tEmployee.stateReason}
					className="font-inter text-sm font-normal text-brand-dark60"
					required
				/>

				<div className="px-0.5">
					<Textarea
						placeholder={tEmployee.typeHere}
						className="rounded-[8px]"
						value={reason}
						onChange={(e) => setReason(e.target.value)}
					/>
				</div>
			</div>

			<div className="flex flex-col gap-2 pt-4">
				<Button onClick={onClose} variant="outline" className="w-full" disabled={latenessMutation.isPending}>
					{tEmployee.cancel}
				</Button>

				<Button
					variant="filled"
					className="w-full"
					onClick={handleSubmit}
					loading={latenessMutation.isPending}
					disabled={!canSubmit}
				>
					{tEmployee.update}
				</Button>
			</div>
		</div>
	);
}
