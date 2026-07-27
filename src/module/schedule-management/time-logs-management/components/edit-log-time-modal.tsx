"use client";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import { IEditLogTimeProps } from "../types";
import OverrideSuccessModal from "./success-modal";
import { useModal } from "@/hooks/useModal";
import { useUpdateJobAssignmentTime } from "../hooks/useTimeLogs";
import { extractUTCDayAndTime } from "../utils";
import { openErrorToast } from "@/components/toast";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { dateToUTCString, getTodayDate, toDate, toFormattedDate } from "@/lib/utils/date";
import TimeInput from "@/components/ui/time-input";
import { DATE_FORMAT } from "@/types/date";
import { JobWorkType } from "@/module/job/utils/enums";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
import { getRosterTime } from "@/utils/time-logs";
import { Checkbox } from "@/components/ui/checkbox";

const EditLoggedTimeModal: React.FC<IEditLogTimeProps> = ({
	onClose,
	onSave,
	stop,
	employeeName,
	trackTimeByGPS,
	rosterTime,
}) => {
	const { rosterStartTime, rosterEndTime } = getRosterTime(rosterTime);

	const initialStartTime =
		stop.overrideStartTime ??
		stop.startTime ??
		rosterStartTime ??
		(stop?.date ? toDate(stop.date) : rosterStartTime) ??
		getTodayDate();

	const initialEndTime =
		stop.overrideEndTime ??
		stop.endTime ??
		rosterEndTime ??
		(stop?.date ? toDate(stop.date) : rosterStartTime) ??
		getTodayDate();

	const [overrideStartTime, setOverrideStartTime] = useState(dateToUTCString(initialStartTime));

	const [overrideEndTime, setOverrideEndTime] = useState(dateToUTCString(initialEndTime));

	const [overrideReason, setOverrideReason] = useState("");
	const [syncRoster, setSyncRoster] = useState(false);
	const { Modal, openModal } = useModal();
	const tTimeLogs = useTypedTranslations(NAMESPACE.TIME_LOGS);

	const tCommon = useTypedTranslations(NAMESPACE.COMMON);

	const isBeyondRosterTime =
		overrideStartTime &&
		overrideEndTime &&
		rosterStartTime &&
		rosterEndTime &&
		(new Date(rosterStartTime) > new Date(overrideStartTime) || new Date(rosterEndTime) < new Date(overrideEndTime));

	const {
		shtnme: siteName,
		gpsStart: gpsStartTime,
		gpsEnd: gpsEndTime,
		startTime: loggedStartTime,
		endTime: loggedEndTime,
		jobEmployeeId,
		date,

		id,
		didNotWorked,
	} = stop;

	const { mutate: updateTime, isPending } = useUpdateJobAssignmentTime();

	const handleSave = () => {
		if (!overrideStartTime || !overrideEndTime || overrideStartTime > overrideEndTime) {
			return openErrorToast({ message: tTimeLogs.pleaseEnterValidTime });
		}

		const startTime = dateToUTCString(overrideStartTime ?? date);
		const endTime = dateToUTCString(overrideEndTime ?? date);

		updateTime(
			{
				id: String(jobEmployeeId ?? id),
				overrideStartTime: dateToUTCString(startTime),
				overrideEndTime: dateToUTCString(endTime),
				overrideReason,
				syncRoster: !!isBeyondRosterTime && syncRoster,
			},
			{
				onSuccess: () => {
					onSave?.();
					openModal({
						modalView: (
							<OverrideSuccessModal
								name={siteName}
								timeRange={`${toFormattedDate(overrideStartTime, DATE_FORMAT.HH_MM_AA_PM)} to ${toFormattedDate(overrideEndTime, DATE_FORMAT.HH_MM_AA_PM)}`}
								onClose={onClose}
							/>
						),
						showDefaultClose: false,
					});
				},
				onError: (error) => {
					openErrorToast({ error });
				},
			}
		);
	};

	return (
		<div className="w-full space-y-4 border-t bg-white">
			<div className="mt-2 space-y-1">
				<p className="text-sm text-gray-500">{tTimeLogs.employeeName}</p>
				<p className="text-sm text-gray-900">{employeeName ?? "N/A"}</p>
			</div>

			<div className="space-y-3">
				<p className="text-sm text-gray-500">Schedule Time</p>
				<div className="grid grid-cols-2 text-sm font-medium text-gray-500">
					<span>
						{tCommon.startTime}
						<br />
						<span className="text-xs font-semibold text-brand-dark">
							{" "}
							{rosterStartTime ? toFormattedDate(rosterStartTime, DATE_FORMAT.HH_MM_AA_PM) : "--"}
						</span>
					</span>
					<span>
						{tCommon.endTime}
						<br />
						<span className="text-xs font-semibold text-brand-dark">
							{" "}
							{rosterEndTime ? toFormattedDate(rosterEndTime, DATE_FORMAT.HH_MM_AA_PM) : "--"}
						</span>
					</span>
				</div>
			</div>

			{trackTimeByGPS && (
				<div className="space-y-3">
					<p className="text-sm text-gray-500">{tTimeLogs.gpsTrackedTime}</p>
					<div className="grid grid-cols-2 text-sm font-medium text-gray-500">
						<span>
							{tCommon.startTime}
							<br />
							<span className="text-xs font-semibold text-brand-dark">
								{" "}
								{gpsStartTime ? toFormattedDate(gpsStartTime, DATE_FORMAT.HH_MM_AA_PM) : "--"}
							</span>
						</span>
						<span>
							{tCommon.endTime}
							<br />
							<span className="text-xs font-semibold text-brand-dark">
								{" "}
								{gpsEndTime ? toFormattedDate(gpsEndTime, DATE_FORMAT.HH_MM_AA_PM) : "--"}
							</span>
						</span>
					</div>
				</div>
			)}

			<div className="space-y-3">
				<p className="text-sm text-gray-500">{tTimeLogs.membersLoggedTime}</p>
				<div className="grid grid-cols-2 gap-4 text-sm font-medium text-gray-500">
					<span>
						{tCommon.startTime}
						<br />
						<span className="text-xs font-semibold text-brand-dark">
							{didNotWorked
								? JobWorkType.DID_NOT_WORKED
								: loggedStartTime
									? extractUTCDayAndTime(loggedStartTime)
									: "--"}
						</span>
					</span>
					<span>
						{tCommon.endTime}
						<br />

						<span className="text-xs font-semibold text-brand-dark">
							{didNotWorked ? JobWorkType.DID_NOT_WORKED : loggedEndTime ? extractUTCDayAndTime(loggedEndTime) : "--"}
						</span>
					</span>
				</div>
			</div>

			<div className="space-y-2">
				<p className="text-sm text-gray-500">{tTimeLogs.overrideLoggedTime}</p>
				<div className="flex gap-2">
					<div className="flex w-full flex-col">
						<Label htmlFor="override-start" className="text-12-inter-gray-400 !font-medium">
							{tCommon.startTime}
						</Label>
						<TimeInput
							value={overrideStartTime}
							onChange={(val) => setOverrideStartTime(val)}
							date={overrideStartTime}
						/>
					</div>

					<div className="flex w-full flex-col">
						<Label htmlFor="override-end" className="text-12-inter-gray-400 !font-medium">
							{tCommon.endTime}
						</Label>
						<TimeInput value={overrideEndTime} onChange={(val) => setOverrideEndTime(val)} date={overrideEndTime} />
					</div>
				</div>
			</div>
			<div className="space-y-1">
				<p className="font-inter text-sm text-gray-500">{tTimeLogs.mentionReasonForOverride}</p>
				<div className="px-0.5">
					<Textarea
						className="mt-1 w-full resize-y rounded-[8px] border border-gray-300 bg-gray-50 p-2 text-sm"
						rows={3}
						placeholder={tCommon.typeHere}
						value={overrideReason}
						onChange={(e) => setOverrideReason(e.target.value)}
					/>
				</div>
			</div>

			{isBeyondRosterTime && (
				<div className="flex gap-5 space-y-1 px-2">
					<p className="font-inter text-sm text-gray-500">
						This change creates a time variance. Do you also want to update the scheduled hours?
					</p>
					<div className="">
						<Checkbox checked={syncRoster} onCheckedChange={(value) => setSyncRoster(!!value)} />
					</div>
				</div>
			)}

			<div className="mt-6 flex justify-end gap-3 border-t pt-4">
				<Button onClick={onClose} variant={"outline"} className="w-full">
					{tCommon.cancel}
				</Button>
				<Button variant={"filled"} className="w-full" disabled={isPending} onClick={handleSave}>
					{tCommon.save}
				</Button>
			</div>
			<Modal />
		</div>
	);
};

export default EditLoggedTimeModal;
