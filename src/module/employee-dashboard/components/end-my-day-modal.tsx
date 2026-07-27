"use client";

import { Button } from "@/components/ui/button";
import { InputField } from "@/components/ui/inputField";
import { Check, Edit, Plus, Trash } from "lucide-react";
import { openErrorToast, openSuccessToast } from "@/components/toast";
import { IEndDayModalProps } from "../types";
import { vehicleChangeOptions } from "../constants";
import {
	useEmployeeDayEndTime,
	useEmployeeTodayRoster,
	useEmployeeVehicleWithGPS,
	useGetEmployeeData,
	usePauseTime,
	useUpdateDayTime,
	useUpdateEmployeeVehicle,
} from "@/module/job/hooks/useEmployeeSchedule";
import { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { IPauseTime } from "@/module/job/types";
import { validateEODSubmission, calculateHoursFromDateRange, checkGPSTimeMatch, checkRosterTimeMatch } from "../utils";
import { SelectField } from "@/components/ui/selectField";
import { PauseTimes } from "../utils/enums";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@radix-ui/react-tooltip";
import { TEAM_NAME } from "@/utils/enums";
import { dateToUTCString, toDate, toFormattedDate } from "@/lib/utils/date";
import { useQueryClient } from "@tanstack/react-query";
import TimeInput from "@/components/ui/time-input";
import { DATE_FORMAT } from "@/types/date";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
import { useEmployeeJobContext } from "../context/JobContext";
import { calculateDayHours } from "@/module/schedule-management/time-logs-management/utils/calculate-hours";
import { useEmployeeScheduleParams } from "@/module/job/hooks/useEmployeeScheduleParams";
import { FormLabelRequired } from "@/components/ui/formLabelrequired";

export function EndDayModalContent({
	vehicleNumber,
	setVehicleNumber,
	setShowEndDayModal,
	isGPSTimeLogAllowed,
}: IEndDayModalProps) {
	const { jobs } = useEmployeeJobContext();

	const sortedJobsOnTime = jobs?.sort((a, b) => {
		const aTime = a.overrideStartTime || a.startTime;
		const bTime = b.overrideStartTime || b.startTime;
		const aTimeInMs = aTime ? toDate(aTime).getTime() : 0;
		const bTimeInMs = bTime ? toDate(bTime).getTime() : 0;
		return aTimeInMs - bTimeInMs;
	});

	const firstStopStartTime = sortedJobsOnTime?.[0]?.overrideStartTime || sortedJobsOnTime?.[0]?.startTime;
	const lastStopEndTime =
		sortedJobsOnTime?.[sortedJobsOnTime.length - 1]?.overrideEndTime ||
		sortedJobsOnTime?.[sortedJobsOnTime.length - 1]?.endTime;

	const { getParams } = useEmployeeScheduleParams();
	const { startDate } = getParams();
	const { data: pauses } = usePauseTime(dateToUTCString(startDate));
	const { data: rosterTime } = useEmployeeTodayRoster({ date: dateToUTCString(startDate) });
	const { data: dayEndTimeInputs } = useEmployeeDayEndTime(dateToUTCString(startDate));

	const [overrideStartTime, setOverrideStartTime] = useState(
		dateToUTCString(
			firstStopStartTime ||
				rosterTime?.extendedApprovedStartTime ||
				rosterTime?.dayStartTime ||
				dateToUTCString(startDate)
		)
	);
	const [overrideEndTime, setOverrideEndTime] = useState(
		dateToUTCString(
			lastStopEndTime || rosterTime?.extendedApprovedEndTime || rosterTime?.dayEndTime || dateToUTCString(startDate)
		)
	);

	const [hasPause, setHasPause] = useState(false);
	const [pauseTimes, setPauseTimes] = useState<IPauseTime[]>(pauses);
	const [pauseReason, setPauseReason] = useState("");
	const [isVehicleEditing, setIsVehicleEditing] = useState(false);
	const [vehicleChangeNote, setVehicleChangeNote] = useState<string>("");

	const { data } = useEmployeeVehicleWithGPS(dateToUTCString(startDate));
	const { gpsStartTime, gpsEndTime, truckNumber } = data || {};
	const { mutate: updateTime, isPending: isDayTimePending } = useUpdateDayTime();
	const { mutate: updateVehicle, isPending: isVehiclePending } = useUpdateEmployeeVehicle();
	const queryClient = useQueryClient();
	const tEmployee = useTypedTranslations(NAMESPACE.EMPLOYEE);
	const { data: user } = useGetEmployeeData(dateToUTCString(startDate));
	const {
		dayStartTime,
		dayEndTime,
		note,
		pauseReason: employeePauseReason,
	} = user?.employee?.employeeDayTimes[0] || {};
	const [eodNote, setEodNote] = useState<string>(dayEndTime ? note || "" : "");
	const isPending = isVehiclePending || isDayTimePending || (isVehicleEditing && !vehicleChangeNote);
	const isWareHouseEmployee = user?.team?.name === TEAM_NAME?.WAREHOUSE;

	const { timeString: recordedHours } = calculateDayHours({
		employeeDayTime: {
			dayStartTime: overrideStartTime,
			dayEndTime: overrideEndTime,
		},
		stops: jobs || [],
		pauses:
			pauseTimes
				?.filter((pause) => !!pause.pauseStartTime && !!pause.pauseEndTime)
				?.map((pause) => ({
					pauseStartTime: pause.pauseStartTime!,
					pauseEndTime: pause.pauseEndTime!,
				})) || [],
	});

	const adminDayOverrideStartTime = dayEndTimeInputs?.overrideStartTime;
	const adminDayOverrideEndTime = dayEndTimeInputs?.overrideEndTime;

	const handleEndDay = () => {
		let roster = { dayStartTime: rosterTime?.dayStartTime, dayEndTime: rosterTime?.dayEndTime };
		if (rosterTime?.extendedApprovedStartTime && rosterTime.extendedApprovedEndTime) {
			roster = { dayStartTime: rosterTime.extendedApprovedStartTime, dayEndTime: rosterTime.extendedApprovedEndTime };
		}
		if (
			validateEODSubmission(
				eodNote,
				toFormattedDate(overrideStartTime, DATE_FORMAT.HH_MM),
				toFormattedDate(overrideEndTime, DATE_FORMAT.HH_MM),
				roster
			)
		) {
			return;
		}
		if (pauseTimes?.length && !pauseReason) {
			openErrorToast({ message: tEmployee.enterPauseReason });
			return false;
		}

		if (isVehicleEditing && (!vehicleNumber || vehicleNumber === truckNumber)) {
			return openErrorToast({ message: tEmployee.enterNewVehicle });
		}

		if (isVehicleEditing && vehicleNumber && vehicleNumber !== truckNumber) {
			return handleUpdateVehicle(vehicleNumber);
		}

		handleEndDayConfirmed();
	};

	const handleEodNoteActive = () => {
		if (isGPSTimeLogAllowed) {
			if (!rosterTime || !data?.gpsStartTime || !data.gpsEndTime) return false;
			const rosterStart = toDate(rosterTime.dayStartTime);
			const rosterEnd = toDate(rosterTime.dayEndTime);

			return checkGPSTimeMatch(
				toFormattedDate(data.gpsStartTime, DATE_FORMAT.HH_MM_AA_PM),
				toFormattedDate(data.gpsEndTime, DATE_FORMAT.HH_MM_AA_PM),
				rosterStart,
				rosterEnd
			);
		} else {
			if (!rosterTime || !overrideStartTime || !overrideEndTime) return false;
			const rosterStart = toDate(rosterTime.dayStartTime);
			const rosterEnd = toDate(rosterTime.dayEndTime);

			return checkRosterTimeMatch(
				toFormattedDate(overrideStartTime, DATE_FORMAT.HH_MM_AA_PM),
				toFormattedDate(overrideEndTime, DATE_FORMAT.HH_MM_AA_PM),
				rosterStart,
				rosterEnd
			);
		}
	};

	const handleChangePause = (index: number, field: keyof IPauseTime, value: string) => {
		setPauseTimes((prev) => {
			if (!prev[index]) return prev;
			const updated = [...prev];
			updated[index] = {
				...updated[index],
				[field]: value,
			} as IPauseTime;
			return updated;
		});
	};

	const addPauseEntry = () => {
		setPauseTimes((prev) => [
			...prev,
			{
				pauseStartTime: dateToUTCString(startDate),
				pauseEndTime: dateToUTCString(startDate),
			},
		]);
	};

	const handlePauseDelete = (index: number) => {
		setPauseTimes((prev) => {
			const updated = prev.filter((_, i) => i !== index);
			return updated;
		});
	};

	const handleLogEndTimeSave = () => {
		const payload = {
			startTime: overrideStartTime,
			endTime: overrideEndTime,
			note: eodNote,
			pauseReason,
			pauseTimes,
		};

		updateTime(payload, {
			onSuccess: () => {
				openSuccessToast(tEmployee.timeLoggedSuccessfully);
				setShowEndDayModal(false);
				queryClient.invalidateQueries({ queryKey: ["employeeData"] });
				queryClient.invalidateQueries({ queryKey: ["employee-schedule-job-timelogs"] });
			},
			onError: (error) => {
				openErrorToast({ error });
			},
		});
	};

	const handleEndDayConfirmed = () => {
		handleLogEndTimeSave();
	};

	const handleUpdateVehicle = (licenseNumber: string | undefined) => {
		if (licenseNumber) {
			return updateVehicle(
				{
					licenseNumber,
					notes: vehicleChangeNote,
					assignTime: dateToUTCString(startDate),
				},
				{
					onSuccess: () => {
						handleEndDayConfirmed();
					},
					onError: (error) => {
						openErrorToast({ error });
					},
				}
			);
		} else {
			handleEndDayConfirmed();
		}
	};

	useEffect(() => {
		setVehicleNumber(truckNumber);
		setIsVehicleEditing(false);
	}, [data, truckNumber, setVehicleNumber]);

	useEffect(() => {
		setPauseTimes(pauses);
		setHasPause(pauses?.length > 0 ? true : false);
	}, [pauses]);

	useEffect(() => {
		if (dayEndTimeInputs?.dayStartTime) {
			setOverrideStartTime(dateToUTCString(dayEndTimeInputs?.dayStartTime ?? startDate));
		}
		if (dayEndTimeInputs?.dayEndTime) {
			setOverrideEndTime(dateToUTCString(dayEndTimeInputs?.dayEndTime ?? startDate));
		}
		if (employeePauseReason) {
			setPauseReason(employeePauseReason);
		}
	}, [
		user,
		dayEndTimeInputs,
		employeePauseReason,
		dayStartTime,
		dayEndTime,
		setOverrideStartTime,
		setOverrideEndTime,
		startDate,
	]);

	return (
		<div className="max-h-[70vh] space-y-3 overflow-y-auto border-t">
			<div>
				<div className="my-2 font-inter text-sm font-normal text-brand-grey">
					Date: {toFormattedDate(startDate, DATE_FORMAT.MM_SLASH_DD_YYYY)}
				</div>
				<div className="mt-3 flex justify-between gap-2">
					<div className="w-full flex-1 space-y-1">
						<Label htmlFor="start-time" className="font-inter text-sm font-normal text-brand-grey">
							{tEmployee.startTime}
						</Label>
						{adminDayOverrideStartTime ? (
							<p className="mt-1 px-1 font-inter text-[15px] font-normal text-brand-dark">
								{overrideStartTime ? toFormattedDate(overrideStartTime, DATE_FORMAT.HH_MM_AA_PM) : "--"}
							</p>
						) : (
							<TimeInput
								value={overrideStartTime}
								onChange={(value) => setOverrideStartTime(value)}
								date={overrideStartTime}
							/>
						)}
						{isGPSTimeLogAllowed && !isWareHouseEmployee && (
							<p className="mt-1 px-1 font-inter text-[10px] font-normal text-brand-dark">
								1st Stop GPS In {gpsStartTime ? toFormattedDate(gpsStartTime, DATE_FORMAT.HH_MM_AA_PM) : "--"}
							</p>
						)}
						{adminDayOverrideStartTime && (
							<>
								<Label htmlFor="start-time" className="font-inter text-sm font-normal text-brand-grey">
									Admin Override{" "}
									<p className="mt-1 px-1 font-inter text-[15px] font-normal text-brand-dark">
										{dayEndTimeInputs?.overrideStartTime
											? toFormattedDate(dayEndTimeInputs?.overrideStartTime, DATE_FORMAT.HH_MM_AA_PM)
											: "--"}
									</p>
								</Label>
							</>
						)}
					</div>
					<div className="w-full flex-1 space-y-1">
						<Label htmlFor="end-time" className="font-inter text-sm font-normal text-brand-grey">
							{tEmployee.endTime}
						</Label>
						{adminDayOverrideEndTime ? (
							<p className="mt-1 px-1 font-inter text-[15px] font-normal text-brand-dark">
								{overrideEndTime ? toFormattedDate(overrideEndTime, DATE_FORMAT.HH_MM_AA_PM) : "--"}
							</p>
						) : (
							<TimeInput
								value={overrideEndTime}
								onChange={(value) => setOverrideEndTime(value)}
								date={overrideEndTime}
							/>
						)}

						{isGPSTimeLogAllowed && !isWareHouseEmployee && (
							<p className="mt-1 px-1 font-inter text-[10px] font-normal text-brand-dark">
								{tEmployee.lastStopGpsOut} {gpsEndTime ? toFormattedDate(gpsEndTime, DATE_FORMAT.HH_MM_AA_PM) : "--"}
							</p>
						)}

						{adminDayOverrideEndTime && (
							<>
								<Label htmlFor="start-time" className="font-inter text-sm font-normal text-brand-grey">
									Admin Override{" "}
									<p className="mt-1 px-1 font-inter text-[15px] font-normal text-brand-dark">
										{dayEndTimeInputs?.overrideEndTime
											? toFormattedDate(dayEndTimeInputs?.overrideEndTime, DATE_FORMAT.HH_MM_AA_PM)
											: "--"}
									</p>
								</Label>
							</>
						)}
					</div>
				</div>
			</div>

			<div className="space-y-1">
				{user?.employee?.user?.team?.isPauseAllowed && (
					<>
						<div className="flex justify-between">
							<div className="flex items-center gap-2">
								<Checkbox
									id="pause"
									checked={hasPause}
									onCheckedChange={(val) => {
										setHasPause(!!val);
									}}
									className="flex h-4 w-4 items-center justify-center rounded border-2 border-[black] font-medium"
								>
									{hasPause && <Check className="h-3 w-3 text-brand-dark" />}
								</Checkbox>
								<Label className="cursor-pointer font-inter text-xs font-normal text-brand-grey md:text-xs">
									{tEmployee.anyPauseInYourDay}
								</Label>
							</div>
							<Button
								disabled={!hasPause}
								variant="ghost"
								onClick={addPauseEntry}
								className="h-10 rounded-[4px] text-xs font-normal"
							>
								<Plus /> {tEmployee.addPause}
							</Button>
						</div>
						<div className="rounded-[10px] border border-blue-200 bg-blue-50 p-2 text-[10px]">
							<p className="font-medium text-gray-700">{tEmployee.note}:</p>

							<ul className="list-disc pl-4 font-normal text-gray-800">
								<li>{tEmployee.lunchAutoDeducted}</li>
							</ul>
						</div>
					</>
				)}

				{hasPause && (
					<div className="space-y-3 rounded-md pt-2">
						<p className="font-inter text-sm font-medium text-brand-dark60">{tEmployee.enterPauseTimings}</p>

						{pauseTimes &&
							pauseTimes?.map((pause: IPauseTime, index: number) => (
								<div key={index} className="flex items-center gap-3">
									<div className="w-full flex-1">
										<Label className="font-inter text-xs font-normal text-brand-grey">{tEmployee.from}</Label>
										<TimeInput
											value={pause.pauseStartTime}
											onChange={(val) => handleChangePause(index, PauseTimes.PAUSE_START_TIME, val)}
											date={pause.pauseStartTime}
										/>
									</div>
									<div className="w-full flex-1">
										<Label className="font-inter text-xs font-normal text-brand-grey">{tEmployee.to}</Label>
										<TimeInput
											value={pause.pauseEndTime || dateToUTCString(startDate)}
											onChange={(val) => handleChangePause(index, PauseTimes.PAUSE_END_TIME, val)}
											date={pause.pauseEndTime || dateToUTCString(startDate)}
										/>
									</div>
									<TooltipProvider>
										<Tooltip>
											<TooltipTrigger asChild>
												<Trash className="mt-6 h-4 w-4 cursor-pointer" onClick={() => handlePauseDelete(index)} />
											</TooltipTrigger>
											<TooltipContent>
												<p className="text-left text-[8px]">{tEmployee.deletePause}</p>
											</TooltipContent>
										</Tooltip>
									</TooltipProvider>
								</div>
							))}

						<div className="space-y-0.5">
							<FormLabelRequired label={tEmployee.pauseReasonRequired} required />
							<div className="px-0.5">
								<Textarea
									value={pauseReason}
									onChange={(e) => setPauseReason(e.target.value)}
									placeholder={tEmployee.typeHere}
								/>
							</div>
						</div>
					</div>
				)}
			</div>

			<div className="grid grid-cols-2 items-center gap-2">
				<div className="space-y-1">
					<p className="font-inter text-sm font-normal text-brand-dark60">{tEmployee.recordedHours}</p>
					<p className="text-sm font-medium">{recordedHours}</p>
				</div>
				<div className="space-y-1">
					<p className="text-sm font-normal text-brand-dark60">{tEmployee.assignedHours}</p>
					<p className="text-sm font-medium">
						{calculateHoursFromDateRange(
							rosterTime?.extendedApprovedStartTime || rosterTime?.dayStartTime,
							rosterTime?.extendedApprovedEndTime || rosterTime?.dayEndTime
						)}
					</p>
				</div>
			</div>

			{!handleEodNoteActive() && (
				<div className="space-y-1.5">
					<p className="text-sm font-medium text-brand-dark60">{`Note (${isGPSTimeLogAllowed ? tEmployee.gpsTimeMismatch : tEmployee.rosterTimeMismatch})*`}</p>
					<div className="px-0.5">
						<Textarea
							className="min-h-20 w-full rounded-lg border border-gray-300 p-2 text-sm"
							placeholder={tEmployee.typeHere}
							value={eodNote}
							onChange={(e) => setEodNote(e.target.value)}
							disabled={adminDayOverrideStartTime && adminDayOverrideEndTime ? true : false}
						/>
					</div>
				</div>
			)}

			{(!isWareHouseEmployee || !dayEndTime) && (
				<div className="px-0.5">
					<InputField
						id="vehicle"
						value={vehicleNumber || ""}
						onChange={(e) => setVehicleNumber(e.target.value)}
						disabled={!isVehicleEditing || (adminDayOverrideStartTime && adminDayOverrideEndTime) ? true : false}
						label={tEmployee.vehicleNumber}
						placeholder={tEmployee.enterVehicleNumber}
						style={{ width: "100%" }}
					/>
					<Button
						variant="ghost"
						size="sm"
						onClick={() => setIsVehicleEditing(!isVehicleEditing)}
						className="!bg-transparent p-0 text-xs font-normal"
					>
						<Edit className="h-2 w-2" />
						{tEmployee.updateVehicleNumber}
					</Button>{" "}
				</div>
			)}

			{isVehicleEditing && (
				<div>
					<SelectField
						label={tEmployee.reasonForVehicleChangeRequired}
						required
						placeholder={tEmployee.selectReasonForChange}
						options={vehicleChangeOptions.map((option) => ({ label: option, value: option }))}
						value={vehicleChangeNote}
						onValueChange={setVehicleChangeNote}
					/>
				</div>
			)}

			{adminDayOverrideStartTime && adminDayOverrideEndTime ? (
				<p className="mt-4 text-sm text-muted-foreground">{tEmployee.dayTimeHasBeenOverriden}</p>
			) : (
				<Button
					disabled={isPending}
					variant="filled"
					onClick={handleEndDay}
					className="w-full rounded-lg bg-black py-3 text-white"
				>
					{dayEndTime ? tEmployee.update : tEmployee.end}
				</Button>
			)}
		</div>
	);
}
