"use client";
import React from "react";
import { IEditLogDetailsProps } from "../types";

import { calculatePauseHours } from "../utils";

import { ViewPauseModal } from "./view-pause-modal";
import { toFormattedDate } from "@/lib/utils/date";
import { DATE_FORMAT } from "@/types/date";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";

const EditDetailModal: React.FC<IEditLogDetailsProps> = ({ dailyJobEmployee }) => {
	const { employeeName, date, jobs, trucks, employeeDayTimes } = dailyJobEmployee;
	const { dayStartTime, dayEndTime, employeePauseTime, pauseReason } = employeeDayTimes || {};
	const tTimeLogs = useTypedTranslations(NAMESPACE.TIME_LOGS);

	const tCommon = useTypedTranslations(NAMESPACE.COMMON);

	/* Note: Temporarily disabled on client demand
	const [overrideStartTime, setOverrideStartTime] = useState(
		dateToUTCString(overRideStart ?? dayStartTime ?? date ?? getTodayDate())
	);
	const [overrideEndTime, setOverrideEndTime] = useState(
		dateToUTCString(overRideEnd ?? dayEndTime ?? date ?? getTodayDate())
	);
	const [overrideReason, setOverrideReason] = useState("");
	const { Modal, openModal } = useModal();
	const { mutate: updateTime, isPending } = useUpdateTimelogDayTime();

	const handleLogTimeSave = () => {
		updateTime(
			{
				overrideStartTime: dateToUTCString(overrideStartTime),
				overrideEndTime: dateToUTCString(overrideEndTime),
				overrideReason,
				employeeId,
			},
			{
				onSuccess: () => {
					onSave();
					openModal({
						modalView: (
							<OverrideSuccessModal
								name={employeeName}
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

	*/

	return (
		<div className="space-y-4 rounded-xl bg-white">
			<div className="grid grid-cols-3 gap-y-4 text-sm">
				<div className="space-y-1">
					<p className="text-12-inter-gray-400">{tTimeLogs.employeeName}</p>
					<p className="text-14-inter-dark-500">{employeeName ?? "John S."}</p>
				</div>
				<div className="space-y-1">
					<p className="text-12-inter-gray-400">{tTimeLogs.numberOfStops}</p>
					<p className="text-14-inter-dark-500">{jobs.length}</p>
				</div>
				<div className="space-y-1">
					<p className="text-12-inter-gray-400">{tCommon.date}</p>
					<p className="text-14-inter-dark-500">{date ? toFormattedDate(date) : "--"}</p>
				</div>

				<div className="space-y-1">
					<p className="text-12-inter-gray-400">{tTimeLogs.dayStartTruck}</p>
					<p className="text-14-inter-dark-500">{trucks[0]?.truckNumber ?? "--"}</p>
				</div>
				<div className="space-y-1">
					<p className="text-12-inter-gray-400">{tTimeLogs.dayEndTruck}</p>
					<p className="text-14-inter-dark-500">{trucks[trucks.length - 1]?.truckNumber ?? "--"}</p>
				</div>
				<div className="space-y-1">
					<p className="text-12-inter-gray-400">{tTimeLogs.totalDistanceTraveled}</p>
					<p className="text-14-inter-dark-500">
						{trucks[0]?.Odometer_reading ? trucks[0]?.Odometer_reading + " Miles" : "--"}
					</p>
				</div>

				<div className="space-y-1">
					<p className="text-12-inter-gray-400">{tTimeLogs.dayStartTime}</p>
					<p className="text-14-inter-dark-500">
						{dayStartTime ? toFormattedDate(dayStartTime, DATE_FORMAT.HH_MM_AA_PM) : "--"}
					</p>
				</div>
				<div className="space-y-1">
					<p className="text-12-inter-gray-400">{tTimeLogs.dayEndTime}</p>
					<p className="text-14-inter-dark-500">
						{dayEndTime ? toFormattedDate(dayEndTime, DATE_FORMAT.HH_MM_AA_PM) : "--"}
					</p>
				</div>
				<div className="space-y-1">
					<p className="text-12-inter-gray-400">{tTimeLogs.pauseTimeIfAny}</p>
					{employeePauseTime?.length ? (
						<>
							<p className="text-14-inter-dark-500">{calculatePauseHours(employeePauseTime)} hrs</p>
							<ViewPauseModal employeePauseTimes={employeePauseTime} gapBeetweenStops={[]} />
						</>
					) : (
						"--"
					)}
				</div>
			</div>

			<div className="space-y-1">
				<p className="text-12-inter-gray-400">{tTimeLogs.reasonForPause}</p>
				<p className="text-14-inter-dark-500">{pauseReason || "N/A"}</p>
			</div>

			{/*Temporary disabled*/}
			{/* <div className="mb-4">
				<p className="text-12-inter-gray-400 mb-2 mt-4">Override day time</p>
				<div className="flex gap-3 px-1">
					<div className="flex w-full flex-col space-y-1">
						<Label className="font-inter text-sm font-normal text-brand-dark50">Day Start Time</Label>
						<TimeInput value={overrideStartTime} onChange={(val) => setOverrideStartTime(val)} date={date} />
					</div>

					<div className="flex w-full flex-col space-y-1">
						<Label className="font-inter text-sm font-normal text-brand-dark50">Day End Time</Label>
						<TimeInput value={overrideEndTime} onChange={(val) => setOverrideEndTime(val)} date={date} />
					</div>
				</div>
			</div>
			<div className="space-y-1">
				<p className="font-inter text-sm font-normal text-brand-dark50">Mention reason for Override*</p>
				<div className="px-0.5">
					<Textarea
						className="resize-y rounded-md border border-gray-300 bg-gray-50 text-xs"
						rows={3}
						placeholder="Type here"
						onChange={(e) => setOverrideReason(e.target.value)}
					/>
				</div>
			</div>

			<div className="mt-6 flex justify-between gap-2">
				<Button onClick={onClose} variant={"outline"} className="w-full">
					Cancel
				</Button>
				<Button variant={"filled"} className="w-full" disabled={isPending} onClick={handleLogTimeSave}>
					Save
				</Button>
			</div> */}
		</div>
	);
};

export default EditDetailModal;
