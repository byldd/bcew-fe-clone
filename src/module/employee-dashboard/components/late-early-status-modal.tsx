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
import { ILateEarlyStatusModalProps } from "../types";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
import TimeInput from "@/components/ui/time-input";
import { dateToUTCString, toFormattedDate } from "@/lib/utils/date";
import { DATE_FORMAT } from "@/types/date";
import { FormLabelRequired } from "@/components/ui/formLabelrequired";

export default function LateEarlyStatusModal({
	onClose,
	employeeDayTimeId,
	rosterStartTime,
	loggedStartTime,
	rosterEndTime,
	loggedEndTime,
}: ILateEarlyStatusModalProps) {
	const tEmployee = useTypedTranslations(NAMESPACE.EMPLOYEE);

	const [lateResponse, setLateResponse] = useState<OptionYesNo | null>(null);
	const [lateReason, setLateReason] = useState("");

	const [earlyResponse, setEarlyResponse] = useState<OptionYesNo | null>(null);
	const [earlyReason, setEarlyReason] = useState("");

	const [lateClaimedStartTime, setLateClaimedStartTime] = useState<string>();
	const [earlyClaimedEndTime, setEarlyClaimedEndTime] = useState<string>();

	const attendanceMutation = useAttendanceReasonNotification(employeeDayTimeId);

	const queryClient = useQueryClient();

	// Validation
	const hasLateReason = lateReason.trim().length > 0;
	const hasEarlyReason = earlyReason.trim().length > 0;

	const hasValidTimeRange =
		lateResponse === OptionYesNo.NO && earlyResponse === OptionYesNo.NO && lateClaimedStartTime && earlyClaimedEndTime
			? new Date(lateClaimedStartTime).getTime() < new Date(earlyClaimedEndTime).getTime()
			: true;

	const canSubmit =
		lateResponse !== null &&
		earlyResponse !== null &&
		hasLateReason &&
		hasEarlyReason &&
		(lateResponse === OptionYesNo.YES || !!lateClaimedStartTime) &&
		(earlyResponse === OptionYesNo.YES || !!earlyClaimedEndTime) &&
		hasValidTimeRange;

	const handleSubmit = () => {
		if (!canSubmit) return;

		let formattedLateClaimedStartTime: string | undefined;
		let formattedEarlyClaimedEndTime: string | undefined;

		// Late
		if (lateResponse === OptionYesNo.NO && lateClaimedStartTime) {
			formattedLateClaimedStartTime = dateToUTCString(lateClaimedStartTime);
		}

		// Early
		if (earlyResponse === OptionYesNo.NO && earlyClaimedEndTime) {
			formattedEarlyClaimedEndTime = dateToUTCString(earlyClaimedEndTime);
		}

		attendanceMutation.mutate(
			{
				late: {
					response: lateResponse,
					reason: lateReason.trim(),
					claimedStartTime: formattedLateClaimedStartTime,
				},
				early: {
					response: earlyResponse,
					reason: earlyReason.trim(),
					claimedEndTime: formattedEarlyClaimedEndTime,
				},
			},
			{
				onSuccess: (res) => {
					openSuccessToast(res?.message || tEmployee.attendanceClarificationSentSuccessfully);
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
			{rosterStartTime && loggedStartTime && rosterEndTime && loggedEndTime && (
				<div className="space-y-0.5 text-xs font-medium">
					<p className="space-y-2">
						You are marked for a {timeDifferenceInHoursAndMinutes(loggedStartTime, rosterStartTime)} late start and{" "}
						{timeDifferenceInHoursAndMinutes(loggedEndTime, rosterEndTime)} early quit.
					</p>

					<p>
						Scheduled Time:{" "}
						{toFormattedDate(rosterStartTime, DATE_FORMAT.HH_MM_AA_PM) +
							"-" +
							toFormattedDate(rosterEndTime, DATE_FORMAT.HH_MM_AA_PM)}
					</p>
					<p>
						Actual Log Time:{" "}
						{toFormattedDate(loggedStartTime, DATE_FORMAT.HH_MM_AA_PM) +
							"-" +
							toFormattedDate(loggedEndTime, DATE_FORMAT.HH_MM_AA_PM)}
					</p>
				</div>
			)}
			{/* -------------------------
				LATE SECTION
			-------------------------- */}
			<div className="space-y-3">
				<FormLabelRequired label={tEmployee.wereYouLate} required className="text-brand-dark60" />

				<RadioGroup
					value={lateResponse ?? ""}
					onValueChange={(val) => setLateResponse(val as OptionYesNo)}
					className="flex flex-row space-x-24"
				>
					<div className="flex items-center space-x-2">
						<RadioGroupItem value={OptionYesNo.YES} id="late-yes" className="custom-radio" />
						<Label htmlFor="late-yes">{tEmployee.yes}</Label>
					</div>

					<div className="flex items-center space-x-2">
						<RadioGroupItem value={OptionYesNo.NO} id="late-no" className="custom-radio" />
						<Label htmlFor="late-no">{tEmployee.no}</Label>
					</div>
				</RadioGroup>

				{lateResponse === OptionYesNo.NO && loggedStartTime && (
					<div className="space-y-1">
						<FormLabelRequired label="What time did you actually start?" required className="text-brand-dark60" />

						<TimeInput
							date={loggedStartTime}
							value={lateClaimedStartTime}
							onChange={setLateClaimedStartTime}
							minuteStep={15}
						/>
					</div>
				)}

				<div className="space-y-1">
					<FormLabelRequired label={tEmployee.stateReason} required className="mb-1 text-brand-dark60" />
					<div className="px-0.5">
						<Textarea
							placeholder={tEmployee.typeHere}
							className="rounded-[8px]"
							value={lateReason}
							onChange={(e) => setLateReason(e.target.value)}
						/>
					</div>
				</div>
			</div>

			{/* -------------------------
				EARLY SECTION
			-------------------------- */}
			<div className="space-y-3">
				<FormLabelRequired label={tEmployee.didYouLeaveEarly} required className="text-brand-dark60" />

				<RadioGroup
					value={earlyResponse ?? ""}
					onValueChange={(val) => setEarlyResponse(val as OptionYesNo)}
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

				{earlyResponse === OptionYesNo.NO && loggedEndTime && (
					<div className="space-y-1">
						<FormLabelRequired label="What time did you actually leave?" required className="text-brand-dark60" />
						<TimeInput
							date={loggedEndTime}
							value={earlyClaimedEndTime}
							onChange={setEarlyClaimedEndTime}
							minuteStep={15}
						/>
					</div>
				)}

				<div className="space-y-1">
					<FormLabelRequired label={tEmployee.stateReason} required className="text-brand-dark60" />
					<div className="px-0.5">
						<Textarea
							placeholder={tEmployee.typeHere}
							className="rounded-[8px]"
							value={earlyReason}
							onChange={(e) => setEarlyReason(e.target.value)}
						/>
					</div>
				</div>
			</div>

			{/* -------------------------
				ACTIONS
			-------------------------- */}
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
