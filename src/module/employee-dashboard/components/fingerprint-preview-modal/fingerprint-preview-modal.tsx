"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Form } from "@/components/ui/form";
import { Spinner } from "@/components/ui/spinner";
import { openErrorToast, openSuccessToast } from "@/components/toast";
import {
	dateToUTCString,
	getTodayDate,
	roundToNearest15Minutes,
	toFormattedDate,
	toMidnightDateString,
} from "@/lib/utils/date";
import { useEmployeeScheduleParams } from "@/module/job/hooks/useEmployeeScheduleParams";
import {
	useEmployeeDayEndTime,
	useEmployeeSchedules,
	useEmployeeTodayRoster,
	useGetEmployeeData,
	usePauseTime,
} from "@/module/job/hooks/useEmployeeSchedule";
import { useAllocateTime, useGetEmployeeFingerprintLogs } from "@/module/matching-finger/hooks/useAllocateTime";
import { buildConsecutivePairs, getUsedLogIds } from "@/module/matching-finger/utils/fingerprint-log-pairs";
import { IAllocateTimePayload } from "@/module/matching-finger/types";
import { IPauseTime } from "@/module/job/types";
import { calculateHoursFromDateRange } from "@/module/employee-dashboard/utils";
import { DATE_FORMAT } from "@/types/date";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
import { IFingerprintPreviewProps } from "../../types";
import { useQueryClient } from "@tanstack/react-query";
import { fingerprintPreviewFormSchema, IFingerprintPreviewFormSchema } from "../../utils/fingerprint-preview-schema";
import { FingerprintPreviewStopItem } from "./fingerprint-preview-stop-item";
import { FingerprintPreviewPauseSection } from "./fingerprint-preview-pause-section";

export function FingerprintPreviewModal({
	setShowFingerprintPreviewModal,
	showAllocateButton,
}: IFingerprintPreviewProps) {
	const { getParams } = useEmployeeScheduleParams();
	const { startDate } = getParams();
	const tEmployee = useTypedTranslations(NAMESPACE.EMPLOYEE);
	const queryClient = useQueryClient();

	const { data: user } = useGetEmployeeData(dateToUTCString(startDate));
	const { data: rosterTime } = useEmployeeTodayRoster({
		date: dateToUTCString(startDate),
	});
	const { data: dayEndTimeInputs } = useEmployeeDayEndTime(dateToUTCString(startDate));
	const { data: pauses } = usePauseTime(dateToUTCString(startDate));
	const { data: jobs, isLoading: isJobsLoading } = useEmployeeSchedules({
		startDate: toMidnightDateString(startDate),
	});
	const { data: logs, isLoading: isLogsLoading } = useGetEmployeeFingerprintLogs({
		date: toMidnightDateString(startDate),
	});
	const allocateTime = useAllocateTime();

	const dayTime = user?.employee?.employeeDayTimes?.[0];
	const roundedStart = dayTime?.dayStartTime || null;
	const roundedEnd = dayTime?.dayEndTime || null;
	const isPastDate = startDate < getTodayDate();

	const disabledAllocation = (jobs?.length || 0) <= 1 || (isPastDate && !showAllocateButton);

	const adminDayOverrideStartTime = dayEndTimeInputs?.overrideStartTime;
	const adminDayOverrideEndTime = dayEndTimeInputs?.overrideEndTime;

	const [note, setNote] = useState(dayTime?.note || "");

	const form = useForm<IFingerprintPreviewFormSchema>({
		resolver: zodResolver(fingerprintPreviewFormSchema),
		defaultValues: { stops: [], hasPause: false, pauseTimes: [], pauseReason: "" },
	});

	useEffect(() => {
		setNote(dayTime?.note || "");
	}, [dayTime?.note]);

	useEffect(() => {
		if (!jobs) return;

		form.setValue(
			"stops",
			jobs.map((job) => ({
				assignmentId: job.assignmentId,
				startTime: job.startTime ?? null,
				endTime: job.endTime ?? null,
				didNotWorked: !!job.didNotWorked,
				selectedPairId: null,
				startLogId: null,
				endLogId: null,
			}))
		);
	}, [jobs, form]);

	useEffect(() => {
		form.setValue("hasPause", (pauses?.length ?? 0) > 0);
		form.setValue(
			"pauseTimes",
			(pauses || []).map((pause: IPauseTime) => ({
				id: pause.id,
				pauseStartTime: pause.pauseStartTime,
				pauseEndTime: pause.pauseEndTime,
			}))
		);
	}, [pauses, form]);

	const stops = useWatch({ control: form.control, name: "stops" });

	const handleSelectPair = (index: number, assignmentId: string, pairId: string) => {
		const usedIds = getUsedLogIds(stops, assignmentId);
		const pair = buildConsecutivePairs(logs || [], usedIds).find((p) => p.id === pairId);
		if (!pair) return;

		form.setValue(
			`stops.${index}`,
			{
				assignmentId,
				didNotWorked: false,
				selectedPairId: pair.id,
				startLogId: pair.startLogId,
				endLogId: pair.endLogId,
				startTime: dateToUTCString(roundToNearest15Minutes(pair.startTime)),
				endTime: dateToUTCString(roundToNearest15Minutes(pair.endTime)),
			},
			{ shouldValidate: true }
		);
	};

	const handleDidNotWorkToggle = (index: number, assignmentId: string, checked: boolean) => {
		const currentStop = stops[index];
		form.setValue(
			`stops.${index}`,
			{
				assignmentId,
				didNotWorked: checked,
				startTime: checked ? null : (currentStop?.startTime ?? null),
				endTime: checked ? null : (currentStop?.endTime ?? null),
				selectedPairId: checked ? null : (currentStop?.selectedPairId ?? null),
				startLogId: checked ? null : (currentStop?.startLogId ?? null),
				endLogId: checked ? null : (currentStop?.endLogId ?? null),
			},
			{ shouldValidate: true }
		);
	};

	const recordedHours = calculateHoursFromDateRange(roundedStart || undefined, roundedEnd || undefined);
	const shiftHours = calculateHoursFromDateRange(
		rosterTime?.extendedApprovedStartTime || rosterTime?.dayStartTime,
		rosterTime?.extendedApprovedEndTime || rosterTime?.dayEndTime
	);

	const showNoteWarning = useMemo(() => {
		if (!roundedStart || !roundedEnd) return false;
		if (!rosterTime?.dayStartTime || !rosterTime?.dayEndTime) return false;
		const recordedMinutes = (new Date(roundedEnd).getTime() - new Date(roundedStart).getTime()) / 60000;
		const shiftMinutes =
			(new Date(rosterTime.dayEndTime).getTime() - new Date(rosterTime.dayStartTime).getTime()) / 60000;
		return recordedMinutes !== shiftMinutes;
	}, [roundedStart, roundedEnd, rosterTime?.dayStartTime, rosterTime?.dayEndTime]);

	const onSubmit = (data: IFingerprintPreviewFormSchema) => {
		const payload: IAllocateTimePayload = {
			employeeId: user?.employee?.id ?? "",
			date: toMidnightDateString(startDate),
			stops: data.stops.map((stop) => ({
				assignmentId: stop.assignmentId,
				didNotWorked: stop.didNotWorked,
				...(stop.didNotWorked ? {} : { startTime: stop.startTime as string, endTime: stop.endTime as string }),
			})),
			pauseTimes: data.hasPause
				? data.pauseTimes.map(({ pauseStartTime, pauseEndTime }) => ({ pauseStartTime, pauseEndTime }))
				: undefined,
			pauseReason: data.hasPause ? data.pauseReason.trim() || undefined : undefined,
		};

		allocateTime.mutate(payload, {
			onSuccess: () => {
				openSuccessToast("Time allocated successfully.");

				setShowFingerprintPreviewModal(false);
				queryClient.invalidateQueries({ queryKey: ["employeeData"] });
				queryClient.invalidateQueries({ queryKey: ["employee-schedule-job-timelogs"] });
				queryClient.invalidateQueries({ queryKey: ["employee-schedule-lock-status"] });
				queryClient.invalidateQueries({ queryKey: ["employee-schedule"] });
				queryClient.invalidateQueries({ queryKey: ["employee-pause"] });
			},
			onError: (error) => {
				openErrorToast({ error });
			},
		});
	};

	if (isJobsLoading || isLogsLoading) return <Spinner />;

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="max-h-[70vh] space-y-6 overflow-y-auto">
				<div>
					<p className="text-xs text-brand-dark60">Date: {toFormattedDate(startDate, DATE_FORMAT.MM_SLASH_DD_YYYY)}</p>
				</div>

				<div className="grid grid-cols-2 gap-4">
					<div className="space-y-1">
						<Label className="text-xs font-normal text-brand-grey">Check In Time</Label>
						<p className="text-sm font-semibold text-brand-dark">
							{roundedStart ? toFormattedDate(roundedStart, DATE_FORMAT.HH_MM_AA_PM) : "--"}
						</p>
						<p className="text-xs font-medium text-brand-greenAccent">Fingerprint verified</p>
					</div>

					<div className="space-y-1">
						<Label className="text-xs font-normal text-brand-grey">Check Out Time</Label>
						<p className="text-sm font-semibold text-brand-dark">
							{roundedEnd ? toFormattedDate(roundedEnd, DATE_FORMAT.HH_MM_AA_PM) : "--"}
						</p>
						<p className="text-xs font-medium text-brand-greenAccent">{roundedEnd ? "Fingerprint verified" : ""}</p>
					</div>
				</div>

				{(adminDayOverrideStartTime || adminDayOverrideEndTime) && (
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-1">
							<Label className="text-xs font-normal text-brand-grey">Admin Override</Label>
							<p className="text-sm font-semibold text-brand-dark">
								{adminDayOverrideStartTime ? toFormattedDate(adminDayOverrideStartTime, DATE_FORMAT.HH_MM_AA_PM) : "--"}
							</p>
						</div>
						<div className="space-y-1">
							<Label className="text-xs font-normal text-brand-grey">Admin Override</Label>
							<p className="text-sm font-semibold text-brand-dark">
								{adminDayOverrideEndTime ? toFormattedDate(adminDayOverrideEndTime, DATE_FORMAT.HH_MM_AA_PM) : "--"}
							</p>
						</div>
					</div>
				)}

				<FingerprintPreviewPauseSection form={form} startDate={startDate} tEmployee={tEmployee} />

				<div className="space-y-4">
					<p className="text-sm font-medium text-brand-dark60">Allocate Your Time</p>

					{jobs?.map((job, index) => {
						const usedIds = getUsedLogIds(stops, job.assignmentId);
						const pairs = buildConsecutivePairs(logs || [], usedIds);
						const currentStop = stops[index];

						return (
							<FingerprintPreviewStopItem
								key={job.assignmentId}
								form={form}
								index={index}
								job={job}
								date={startDate}
								pairs={pairs}
								didNotWorked={currentStop?.didNotWorked}
								onSelectPair={handleSelectPair}
								onDidNotWorkToggle={handleDidNotWorkToggle}
								disabled={disabledAllocation}
							/>
						);
					})}
				</div>

				<div className="grid grid-cols-2 gap-4">
					<div className="space-y-1">
						<p className="text-xs font-normal text-brand-dark60">Recorded Hours</p>
						<p className="text-sm font-semibold text-brand-dark">{recordedHours}</p>
					</div>
					<div className="space-y-1">
						<p className="text-xs font-normal text-brand-dark60">Assigned Hours</p>
						<p className="text-sm font-semibold text-brand-dark">{shiftHours}</p>
					</div>
				</div>

				<div className="space-y-2">
					<p className="text-xs font-medium text-brand-dark60">Add Note</p>
					<Textarea
						value={note}
						onChange={(event) => setNote(event.target.value)}
						placeholder="Type here"
						disabled={!roundedEnd}
					/>
					{showNoteWarning && !note.trim() && (
						<p className="text-xs text-brand-red800">
							Recorded hours differ from assigned roster. Please add a note to explain.
						</p>
					)}
				</div>

				<Button
					type="submit"
					variant="filled"
					disabled={allocateTime.isPending}
					className="w-full rounded-lg bg-black py-3 text-white"
				>
					Update
				</Button>
			</form>
		</Form>
	);
}
