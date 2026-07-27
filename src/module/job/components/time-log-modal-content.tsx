"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { ITimeLogModalContentProps } from "../types";
import { useUpdateJobEmployeeDayTime } from "../hooks/useEmployeeSchedule";
import { validateRosterTime } from "@/module/employee-dashboard/utils";
import { dateToUTCString, setTime, toDate, toFormattedDate } from "@/lib/utils/date";
import { DATE_FORMAT } from "@/types/date";
import TimeInput from "@/components/ui/time-input";
import { openErrorToast, openSuccessToast } from "@/components/toast";
import { formatHoursToHM, getFormattedTimeRange } from "@/module/schedule-management/roster-time-configuration/utils";
import { FALLBACK_TIME_RANGE_STRINGS } from "@/utils/enums";
import { calculateStopHours } from "@/module/schedule-management/time-logs-management/utils/calculate-hours";
import { defaultRosterTime } from "../utils/constants";
import { getMaxStartTime, getMinEndTime } from "../utils";
import { calculateLunchDeductedHours } from "@/module/employee/utils";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
import { useQueryClient } from "@tanstack/react-query";
import DidNotWorkButton from "@/module/employee-dashboard/components/new-start-modal/did-not-work-button";
import { TimeSource } from "@/module/schedule-management/roster-time-configuration/enums";
import { isSelfSchedulingEnabledForTheDate } from "@/module/employee-dashboard/utils/self-schedule";
import useAuthStore from "@/store/auth-store";

export function TimeLogModalContent({ onClose, user, jobDate }: ITimeLogModalContentProps) {
	const ActiveFrom = user?.employee?.gpsLogData?.activeFrom;
	const ActiveTo = user?.employee?.gpsLogData?.activeTo;
	const jobEmployeeAssignments = user?.employee?.jobEmployeeAssignments || [];
	const rosterTime = user?.employee?.user?.rosterTimes?.[0] || defaultRosterTime;
	const tEmployee = useTypedTranslations(NAMESPACE.EMPLOYEE);
	const tTimelogs = useTypedTranslations(NAMESPACE.TIME_LOGS);
	const initialStartDate = user?.startTime
		? toDate(user.startTime)
		: getMaxStartTime(jobEmployeeAssignments, rosterTime);
	const initialEndDate = user?.endTime ? toDate(user.endTime) : getMinEndTime(jobEmployeeAssignments, rosterTime);
	const { mutate: updateTime, isPending } = useUpdateJobEmployeeDayTime();
	const queryClient = useQueryClient();

	const { user: authUser } = useAuthStore((store) => store);

	const [startTime, setStartTime] = useState(dateToUTCString(initialStartDate));
	const [endTime, setEndTime] = useState(dateToUTCString(initialEndDate));
	const jobHours = formatHoursToHM(calculateLunchDeductedHours(startTime, endTime));

	const adminOverrideStartTime = user?.overrideStartTime;
	const adminOverrideEndTime = user?.overrideEndTime;

	const isWorking = rosterTime?.timeSource !== TimeSource.NOT_WORKING;

	const isSelfSchedule = isSelfSchedulingEnabledForTheDate({ date: jobDate, user: authUser! });

	const handleSubmit = () => {
		let roster = { dayStartTime: rosterTime?.dayStartTime, dayEndTime: rosterTime?.dayEndTime };
		if (rosterTime?.extendedApprovedStartTime && rosterTime.extendedApprovedEndTime) {
			roster = {
				dayStartTime: rosterTime.extendedApprovedStartTime,
				dayEndTime: rosterTime.extendedApprovedEndTime,
			};
		}

		const formattedStartTime = toFormattedDate(startTime, DATE_FORMAT.HH_MM);
		const formattedEndTime = toFormattedDate(endTime, DATE_FORMAT.HH_MM);

		if (!validateRosterTime(roster, formattedStartTime, formattedEndTime, isSelfSchedule)) {
			return;
		}

		handleLogTimeSave(formattedStartTime, formattedEndTime);
	};

	const handleLogTimeSave = (startTime: string, endTime: string) => {
		if (!user?.id || !jobDate) {
			return openErrorToast({ message: `The stop is not available for the ${user?.employee?.employeeName}` });
		}

		updateTime(
			{
				assignmentId: String(user?.id),
				startTime: dateToUTCString(setTime(jobDate, startTime)),
				endTime: dateToUTCString(setTime(jobDate, endTime)),
			},
			{
				onSuccess: () => {
					openSuccessToast(tEmployee.timeLoggedSuccessfully);
					queryClient.invalidateQueries({ queryKey: ["employee-daily-job"] });
					onClose();
				},
				onError: (error) => {
					openErrorToast({ error });
				},
			}
		);
	};

	const stopHour = calculateStopHours({
		stop: {
			startTime: user?.startTime ?? undefined,
			endTime: user?.endTime ?? undefined,
			overrideStartTime: user?.overrideStartTime ?? undefined,
			overrideEndTime: user?.overrideEndTime ?? undefined,
		},
		employeePauseTime: user?.employee?.employeeDayTimes?.[0]?.employeePauseTime ?? undefined,
	});

	return (
		<div className="w-full space-y-4 border-t px-0">
			<div>
				<h2 className="border-brand-lightgrey py-3 font-inter text-sm font-medium text-brand-grey">
					{tEmployee.date}:{" "}
					<span className="text-xs font-medium text-brand-dark">
						{rosterTime ? toFormattedDate(rosterTime?.date) : "--"}
					</span>
				</h2>

				<h2 className="mb-4 border-b pb-2 font-inter text-sm font-medium text-brand-dark60">
					{tEmployee.rosterTime}:{" "}
					<span className="text-xs font-medium text-brand-dark">
						{isWorking
							? getFormattedTimeRange(
									rosterTime?.dayStartTime || null,
									rosterTime?.dayEndTime || null,
									FALLBACK_TIME_RANGE_STRINGS.DEFAULT_TIME_RANGE
								)
							: "Not Working"}
					</span>
				</h2>

				{rosterTime?.extendedApprovedStartTime && isWorking && (
					<h2 className="mb-4 border-b pb-2 font-inter text-sm font-normal text-brand-grey">
						{tEmployee.extendedRosterTime}:{" "}
						<span className="text-xs font-medium text-brand-dark">
							{getFormattedTimeRange(
								rosterTime?.extendedApprovedStartTime || null,
								rosterTime?.extendedApprovedEndTime || null
							)}
						</span>
					</h2>
				)}
				<div className="space-y-2">
					<p className="text-sm font-medium text-brand-dark60">{tEmployee.gpsTrackedTime}</p>

					<div className="grid grid-cols-2 items-center gap-6 font-inter text-xs font-medium text-brand-dark50">
						<div>
							<p>{tEmployee.startTime}</p>
							<p className="font-inter text-sm font-medium text-brand-dark">
								{" "}
								{ActiveFrom ? toFormattedDate(ActiveFrom, DATE_FORMAT.HH_MM_AA_PM) : "--"}
							</p>
						</div>
						<div>
							<p>{tEmployee.endTime}</p>
							<p className="font-inter text-sm font-medium text-brand-dark">
								{" "}
								{ActiveTo ? toFormattedDate(ActiveTo, DATE_FORMAT.HH_MM_AA_PM) : "--"}
							</p>
						</div>
					</div>
				</div>
			</div>
			{isWorking && <p className="font-inter text-sm font-medium text-brand-dark60">{tEmployee.changeStartEndTime}</p>}

			{adminOverrideStartTime && adminOverrideEndTime && isWorking && (
				<div className="flex min-w-full gap-2">
					<div className="w-full flex-1">
						<Label className="font-inter text-xs font-normal text-brand-grey">{tTimelogs.overrideStartTime}</Label>
						<TimeInput date={adminOverrideStartTime} value={adminOverrideStartTime} disabled />
					</div>
					<div className="w-full flex-1">
						<Label className="font-inter text-xs font-normal text-brand-grey">{tTimelogs.overrideEndTime}</Label>
						<TimeInput date={adminOverrideEndTime} value={adminOverrideEndTime} disabled />
					</div>
				</div>
			)}

			{isWorking && (
				<div className="flex min-w-full gap-2">
					<div className="w-full flex-1">
						<Label className="font-inter text-xs font-normal text-brand-grey">{tEmployee.startTime}</Label>
						<TimeInput
							date={startTime}
							value={startTime}
							onChange={(val) => setStartTime(val)}
							disabled={!!(adminOverrideStartTime && adminOverrideEndTime)}
						/>
					</div>
					<div className="w-full flex-1">
						<Label className="font-inter text-xs font-normal text-brand-grey">{tEmployee.endTime}</Label>
						<TimeInput
							date={endTime}
							value={endTime}
							onChange={(val) => setEndTime(val)}
							disabled={!!(adminOverrideStartTime && adminOverrideEndTime)}
						/>
					</div>
				</div>
			)}

			{isWorking && (
				<div>
					{tTimelogs.hours}: {jobHours ? jobHours : typeof stopHour === "number" ? formatHoursToHM(stopHour) : "--"}
				</div>
			)}

			{adminOverrideStartTime && adminOverrideEndTime ? (
				<p className="mt-4 text-sm text-muted-foreground">
					Time for this job has been overridden by an admin. You cannot log or modify time for this job.
				</p>
			) : (
				<>
					<Button
						disabled={!startTime || !endTime || !isWorking || isPending}
						variant="filled"
						className="mt-4 w-full"
						onClick={handleSubmit}
						loading={isPending}
					>
						{tEmployee.saveTime}
					</Button>
					{!user?.didNotWorked && isWorking && <DidNotWorkButton assignmentId={user?.id} onClose={() => onClose()} />}
				</>
			)}
		</div>
	);
}
