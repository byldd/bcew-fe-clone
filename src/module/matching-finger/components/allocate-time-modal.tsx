"use client";

import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import TimeInput from "@/components/ui/time-input";
import { Spinner } from "@/components/ui/spinner";
import { openErrorToast, openSuccessToast } from "@/components/toast";
import { dateToUTCString, roundToNearest15Minutes, toFormattedDate, toMidnightDateString } from "@/lib/utils/date";
import { DATE_FORMAT } from "@/types/date";
import { Check } from "lucide-react";
import { useAllocateTime, useGetEmployeeFingerprintLogs } from "../hooks/useAllocateTime";
import { IAllocateTimePayload } from "../types";
import { buildConsecutivePairs, getUsedLogIds } from "../utils/fingerprint-log-pairs";
import { useEmployeeSchedules, useEmployeeTodayRoster } from "@/module/job/hooks/useEmployeeSchedule";
import { allocateTimeFormSchema, IAllocateTimeFormSchema } from "../utils/allocate-time-schema";
import { getRosterTime } from "@/utils/time-logs";
import { useQueryClient } from "@tanstack/react-query";

export function AllocateTimeModal({
	technicianName,
	onClose,
	date,
	employeeId,
}: {
	technicianName?: string;
	onClose?: () => void;
	date: string | Date;
	employeeId: string;
}) {
	const allocateTime = useAllocateTime();

	const { data: jobs, isLoading: isJobsLoading } = useEmployeeSchedules({
		startDate: toMidnightDateString(date),
		employeeId,
	});

	const queryClient = useQueryClient();

	const { data: logs, isLoading: isLogsLoading } = useGetEmployeeFingerprintLogs({
		date: toMidnightDateString(date),
	});

	const firstLog = logs?.[0]?.scanTime;
	const lastLog = logs?.[logs?.length - 1]?.scanTime;

	const { data: roster, isLoading: isRosterLoading } = useEmployeeTodayRoster({ date });

	const { rosterStartTime, rosterEndTime } = getRosterTime(roster);

	const form = useForm<IAllocateTimeFormSchema>({
		resolver: zodResolver(allocateTimeFormSchema),
		defaultValues: { stops: [] },
	});

	useEffect(() => {
		if (!jobs) return;

		form.reset({
			stops: jobs.map((job) => ({
				assignmentId: job.assignmentId,
				startTime: job.startTime ?? null,
				endTime: job.endTime ?? null,
				didNotWorked: !!job.didNotWorked,
				selectedPairId: null,
				startLogId: null,
				endLogId: null,
			})),
		});
	}, [jobs, form]);

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

	const onSubmit = (data: IAllocateTimeFormSchema) => {
		const payload: IAllocateTimePayload = {
			employeeId: employeeId,
			date: toMidnightDateString(date),
			stops: data.stops.map((stop) => ({
				assignmentId: stop.assignmentId,
				didNotWorked: stop.didNotWorked,
				...(stop.didNotWorked ? {} : { startTime: stop.startTime as string, endTime: stop.endTime as string }),
			})),
		};

		allocateTime.mutate(payload, {
			onSuccess: () => {
				openSuccessToast("Time allocated successfully.");
				onClose?.();
				queryClient.invalidateQueries({ queryKey: ["employee-schedule-lock-status"] });
				queryClient.invalidateQueries({ queryKey: ["employee-schedule"] });
			},
			onError: (error) => {
				openErrorToast({ error });
			},
		});
	};

	if (isJobsLoading || isLogsLoading || isRosterLoading) return <Spinner />;

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
				<div className="space-y-1">
					<p className="text-sm font-semibold text-brand-dark">{technicianName} - Clock Out</p>
					<div className="flex justify-between text-xs text-brand-dark60">
						<span>
							Schedule Time: {rosterStartTime ? toFormattedDate(rosterStartTime, DATE_FORMAT.HH_MM_AA_PM) : "--"} to{" "}
							{rosterEndTime ? toFormattedDate(rosterEndTime, DATE_FORMAT.HH_MM_AA_PM) : "--"}
						</span>
						<span>{toFormattedDate(date, DATE_FORMAT.MM_SLASH_DD_YYYY)}</span>
					</div>
					<div className="grid grid-cols-2 gap-4 pt-2">
						<div>
							<Label className="text-xs font-normal text-brand-grey">First Log</Label>
							<p className="text-lg font-semibold text-brand-dark">
								{firstLog ? toFormattedDate(firstLog, DATE_FORMAT.HH_MM_AA_PM) : "--"}
							</p>
						</div>
						<div>
							<Label className="text-xs font-normal text-brand-grey">Last Log</Label>
							<p className="text-lg font-semibold text-brand-dark">
								{lastLog ? toFormattedDate(lastLog, DATE_FORMAT.HH_MM_AA_PM) : "--"}
							</p>
						</div>
					</div>
				</div>

				<div className="space-y-4">
					<p className="text-sm font-medium text-brand-dark60">Allocate Your Time</p>

					{jobs?.map((job, index) => {
						const usedIds = getUsedLogIds(stops, job.assignmentId);
						const pairs = buildConsecutivePairs(logs || [], usedIds);
						const currentStop = stops[index];
						const jobName = `${job.jobDailyRecord.jobnme}${job.jobDailyRecord.tsknme ? ` (${job.jobDailyRecord.tsknme})` : ""}`;

						return (
							<div key={job.assignmentId} className="space-y-3 rounded-[10px] border border-brand-bgLightgrey p-3">
								<div className="flex items-center justify-between">
									<p className="text-sm font-semibold text-brand-dark">
										Stop {index + 1} - {jobName}
									</p>
									<div className="flex items-center gap-2">
										<FormField
											control={form.control}
											name={`stops.${index}.didNotWorked`}
											render={({ field }) => (
												<Checkbox
													id={`dnw-${job.assignmentId}`}
													checked={field.value}
													onCheckedChange={(val) => handleDidNotWorkToggle(index, job.assignmentId, !!val)}
													className="flex h-4 w-4 items-center justify-center rounded border-2 border-[black]"
												>
													{field.value && <Check className="h-3 w-3 text-brand-dark" />}
												</Checkbox>
											)}
										/>
										<Label
											htmlFor={`dnw-${job.assignmentId}`}
											className="cursor-pointer text-xs font-normal text-brand-grey"
										>
											Did Not Work
										</Label>
									</div>
								</div>

								<div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
									<FormField
										control={form.control}
										name={`stops.${index}.startTime`}
										render={({ field }) => (
											<FormItem>
												<FormLabel className="text-xs font-normal text-brand-grey">Start Time*</FormLabel>
												<FormControl>
													<TimeInput
														value={field.value ?? ""}
														date={date}
														disabled={currentStop?.didNotWorked}
														onChange={field.onChange}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name={`stops.${index}.endTime`}
										render={({ field }) => (
											<FormItem>
												<FormLabel className="text-xs font-normal text-brand-grey">End Time*</FormLabel>
												<FormControl>
													<TimeInput
														value={field.value ?? ""}
														date={date}
														disabled={currentStop?.didNotWorked}
														onChange={field.onChange}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name={`stops.${index}.selectedPairId`}
										render={({ field }) => (
											<FormItem className="col-span-2 sm:col-span-1">
												<FormLabel className="text-xs font-normal text-brand-grey">Select Fingerprint Log</FormLabel>
												<FormControl>
													<Select
														value={field.value ?? undefined}
														onValueChange={(value) => handleSelectPair(index, job.assignmentId, value)}
														disabled={currentStop?.didNotWorked}
													>
														<SelectTrigger>
															<SelectValue placeholder="Select a fingerprint log" />
														</SelectTrigger>
														<SelectContent>
															{pairs.map((pair) => (
																<SelectItem key={pair.id} value={pair.id}>
																	{pair.label}
																</SelectItem>
															))}
														</SelectContent>
													</Select>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
							</div>
						);
					})}
				</div>

				<div className="flex gap-3">
					<Button type="button" variant="outline" className="w-full rounded-lg py-3" onClick={onClose}>
						Skip
					</Button>
					<Button
						type="submit"
						variant="filled"
						disabled={allocateTime.isPending}
						className="w-full rounded-lg bg-black py-3 text-white"
					>
						Allocate Time
					</Button>
				</div>
			</form>
		</Form>
	);
}
