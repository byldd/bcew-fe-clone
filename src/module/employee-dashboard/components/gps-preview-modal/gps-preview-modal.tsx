"use client";

import { Button } from "@/components/ui/button";
import { InputField } from "@/components/ui/inputField";
import { Check, Edit, Plus, Trash } from "lucide-react";
import { openErrorToast, openSuccessToast } from "@/components/toast";
import {
	useEmployeeDayEndTime,
	useEmployeeTodayRoster,
	useEmployeeVehicleWithGPS,
	useGetEmployeeData,
	usePauseTime,
	useUpdateEmployeeVehicle,
	useUpdateGPSEmployeePause,
} from "@/module/job/hooks/useEmployeeSchedule";
import { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { IPauseTime } from "@/module/job/types";
import { SelectField } from "@/components/ui/selectField";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@radix-ui/react-tooltip";
import { dateToUTCString, getTodayDate, toDate, toFormattedDate } from "@/lib/utils/date";
import { useQueryClient } from "@tanstack/react-query";
import TimeInput from "@/components/ui/time-input";
import { DATE_FORMAT } from "@/types/date";
import { IGPSPreviewProps } from "../../types";
import { PauseTimes } from "../../utils/enums";
import { calculateHoursFromDateRange } from "../../utils";
import { vehicleChangeOptions } from "../../constants";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
import { useEmployeeScheduleParams } from "@/module/job/hooks/useEmployeeScheduleParams";

export function GPSPreviewModal({ vehicleNumber, setVehicleNumber, setShowGpsPreviewModal }: IGPSPreviewProps) {
	const { getParams } = useEmployeeScheduleParams();
	const { startDate } = getParams();
	const { data: pauses } = usePauseTime(dateToUTCString(startDate));
	const { data: rosterTime } = useEmployeeTodayRoster({});
	const { data: dayEndTimeInputs } = useEmployeeDayEndTime(dateToUTCString(getTodayDate()));
	const [overrideStartTime, setOverrideStartTime] = useState(
		dateToUTCString(rosterTime?.extendedApprovedStartTime || rosterTime?.dayStartTime || dateToUTCString(new Date()))
	);
	const [overrideEndTime, setOverrideEndTime] = useState(
		dateToUTCString(rosterTime?.extendedApprovedEndTime || rosterTime?.dayEndTime || dateToUTCString(new Date()))
	);

	const [hasPause, setHasPause] = useState(false);
	const [pauseTimes, setPauseTimes] = useState<IPauseTime[]>(pauses);
	const [pauseReason, setPauseReason] = useState("");
	const [isVehicleEditing, setIsVehicleEditing] = useState(false);
	const [vehicleChangeNote, setVehicleChangeNote] = useState<string>("");

	const { data } = useEmployeeVehicleWithGPS(dateToUTCString(startDate));
	const { truckNumber, gpsStartTime } = data || {};
	const { mutate: updatePause, isPending: isPausePending } = useUpdateGPSEmployeePause();
	const { mutate: updateVehicle, isPending: isVehiclePending } = useUpdateEmployeeVehicle();
	const queryClient = useQueryClient();

	const { data: user } = useGetEmployeeData(dateToUTCString(startDate));
	const { dayStartTime, dayEndTime, pauseReason: employeePauseReason } = user?.employee?.employeeDayTimes[0] || {};
	const isPending = isVehiclePending || isPausePending || (isVehicleEditing && !vehicleChangeNote);
	const tEmployee = useTypedTranslations(NAMESPACE.EMPLOYEE);

	const handleUpdate = () => {
		if (!hasPause && !isVehicleEditing) {
			return openErrorToast({ message: tEmployee.noDataToUpdate });
		}
		if (pauseTimes?.length && !pauseReason) {
			return openErrorToast({ message: tEmployee.enterPauseReason });
		}

		if (isVehicleEditing && (!vehicleNumber || vehicleNumber === truckNumber)) {
			return openErrorToast({ message: tEmployee.enterNewVehicle });
		}

		if (isVehicleEditing && vehicleNumber && vehicleNumber !== truckNumber) {
			return handleUpdateVehicle(vehicleNumber);
		}

		handlePauseUpdate();
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
				pauseStartTime: dateToUTCString(new Date()),
				pauseEndTime: dateToUTCString(new Date()),
			},
		]);
	};

	const handlePauseDelete = (index: number) => {
		setPauseTimes((prev) => {
			const updated = prev.filter((_, i) => i !== index);
			return updated;
		});
	};

	const handlePauseUpdate = () => {
		const payload = {
			startTime: overrideStartTime,
			endTime: overrideEndTime,
			pauseReason,
			pauseTimes,
		};

		updatePause(payload, {
			onSuccess: () => {
				openSuccessToast("Updated successfully");
				setShowGpsPreviewModal(false);
				queryClient.invalidateQueries({ queryKey: ["employeeData"] });
				queryClient.invalidateQueries({ queryKey: ["employee-schedule-job-timelogs"] });
			},
			onError: (error) => {
				openErrorToast({ error });
			},
		});
	};

	const handleUpdateVehicle = (licenseNumber: string | undefined) => {
		if (licenseNumber) {
			return updateVehicle(
				{
					licenseNumber,
					notes: vehicleChangeNote,
					assignTime: dateToUTCString(new Date()),
				},
				{
					onSuccess: () => {
						handlePauseUpdate();
					},
					onError: (error) => {
						openErrorToast({ error });
					},
				}
			);
		} else {
			handlePauseUpdate();
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
			setOverrideStartTime(dateToUTCString(dayEndTimeInputs?.dayStartTime ?? dayStartTime ?? toDate(new Date())));
		}
		if (dayEndTimeInputs?.dayEndTime) {
			setOverrideEndTime(dateToUTCString(dayEndTimeInputs?.dayEndTime ?? dayEndTime ?? toDate(new Date())));
		}
		if (employeePauseReason) {
			setPauseReason(employeePauseReason);
		}
	}, [user, dayEndTimeInputs, employeePauseReason, dayStartTime, dayEndTime]);

	return (
		<div className="max-h-[70vh] space-y-4 overflow-y-auto">
			<div>
				<div className="mt-4 flex gap-2">
					{/* GPS Start Time */}
					<div className="flex w-full flex-col gap-1">
						<Label htmlFor="start-time" className="font-inter text-sm font-normal text-brand-grey">
							{tEmployee.gpsStartTime}
						</Label>

						<p className="justify-start text-start text-sm font-medium">
							{toFormattedDate(overrideStartTime, DATE_FORMAT.HH_MM_AA_PM)}
						</p>

						<p className="text-[10px] text-brand-dark">
							1st Stop GPS In {gpsStartTime ? toFormattedDate(gpsStartTime, DATE_FORMAT.HH_MM_AA_PM) : "--"}
						</p>
					</div>

					{/* GPS End Time */}
					<div className="flex w-full flex-col gap-1">
						<Label htmlFor="end-time" className="font-inter text-sm font-normal text-brand-grey">
							{tEmployee.gpsEndTime}
						</Label>

						<p className="justify-start text-sm font-medium">--</p>
					</div>
				</div>
			</div>

			<div className="space-y-1">
				{user?.employee?.user?.team?.isPauseAllowed && (
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
							<Label className="md cursor-pointer font-inter text-xs font-normal text-brand-grey md:text-xs">
								Any Pause in your Day?
							</Label>
						</div>
						<Button disabled={!hasPause} variant="ghost" onClick={addPauseEntry} className="text-xs font-normal">
							<Plus /> Unpaid Pause Time
						</Button>
					</div>
				)}

				<div className="rounded-[10px] border border-blue-200 bg-blue-50 p-2 text-[10px]">
					<p className="font-medium text-gray-700">{tEmployee.note}:</p>

					<ul className="list-disc pl-4 font-normal text-gray-800">
						<li>{tEmployee.lunchAutoDeducted}</li>
					</ul>
				</div>

				{hasPause && (
					<div className="space-y-3 rounded-md pt-2">
						<p className="font-inter text-sm font-medium text-brand-dark60">Enter Pause Timing</p>

						{pauseTimes &&
							pauseTimes?.map((pause: IPauseTime, index: number) => (
								<div key={index} className="flex items-center gap-2">
									<div className="w-full flex-1 space-y-1">
										<Label className="font-inter text-xs font-normal text-brand-grey">From</Label>
										<TimeInput
											value={pause.pauseStartTime}
											onChange={(val) => handleChangePause(index, PauseTimes.PAUSE_START_TIME, val)}
											date={pause.pauseStartTime}
										/>
									</div>
									<div className="w-full flex-1 space-y-1">
										<Label className="font-inter text-xs font-normal text-brand-grey">To</Label>
										<TimeInput
											value={pause.pauseEndTime || dateToUTCString(new Date())}
											onChange={(val) => handleChangePause(index, PauseTimes.PAUSE_END_TIME, val)}
											date={pause.pauseEndTime || dateToUTCString(new Date())}
										/>
									</div>
									<TooltipProvider>
										<Tooltip>
											<TooltipTrigger asChild>
												<Trash className="mt-6 h-4 w-4 cursor-pointer" onClick={() => handlePauseDelete(index)} />
											</TooltipTrigger>
											<TooltipContent>
												<p className="text-left text-[8px]">Delete Pause</p>
											</TooltipContent>
										</Tooltip>
									</TooltipProvider>
								</div>
							))}

						<div className="space-y-0.5">
							<Label className="font-inter text-sm font-normal text-brand-grey">Please mention reason for Pause*</Label>
							<div className="px-0.5">
								<Textarea
									value={pauseReason}
									onChange={(e) => setPauseReason(e.target.value)}
									placeholder="Type here"
								/>
							</div>
						</div>
					</div>
				)}
			</div>

			<div className="grid grid-cols-2 items-center gap-2">
				<div className="space-y-1">
					<p className="font-inter text-sm font-normal text-brand-dark60">{tEmployee.recordedHours}</p>
					<p className="text-sm font-medium">{calculateHoursFromDateRange(overrideStartTime, overrideEndTime)}</p>
				</div>
				<div className="space-y-1">
					<p className="text-sm font-normal text-brand-dark60">Assigned Hours</p>
					<p className="text-sm font-medium">
						{calculateHoursFromDateRange(rosterTime?.dayStartTime, rosterTime?.dayEndTime)}
					</p>
				</div>
			</div>

			<div className="px-0.5">
				<InputField
					id="vehicle"
					value={vehicleNumber || ""}
					onChange={(e) => setVehicleNumber(e.target.value)}
					disabled={!isVehicleEditing}
					label="Vehicle Number"
					placeholder="Enter Vehicle Number"
					style={{ width: "100%" }}
				/>
				<Button
					variant="ghost"
					size="sm"
					onClick={() => setIsVehicleEditing(!isVehicleEditing)}
					className="!bg-transparent p-0 text-xs font-normal"
				>
					<Edit className="h-2 w-2" />
					Update Vehicle Number
				</Button>
			</div>

			{isVehicleEditing && (
				<div>
					<SelectField
						disabled={!isVehicleEditing}
						label="Reason for Change (if using different vehicle)*"
						placeholder="Select reason for change"
						options={vehicleChangeOptions.map((option) => ({ label: option, value: option }))}
						value={vehicleChangeNote}
						onValueChange={setVehicleChangeNote}
					/>
				</div>
			)}

			<Button
				disabled={isPending}
				variant="filled"
				onClick={handleUpdate}
				className="w-full rounded-lg bg-black py-3 text-white"
			>
				Update
			</Button>
		</div>
	);
}
