"use client";

import { Button } from "@/components/ui/button";
import React, { useEffect } from "react";
import { IRoleTiming, IRoster, ITeamTiming } from "../types";
import { useCreateOrUpdateRosterSyncedTime } from "../hooks/useRoster";
import { openErrorToast, openSuccessToast } from "@/components/toast";
import { useQueryClient } from "@tanstack/react-query";
import { TimeSource } from "../enums";
import TimeInput from "@/components/ui/time-input";
import { dateToUTCString } from "@/lib/utils/date";

import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

import { rosterDays, TIME_SOURCE_DISPLAY_MAP } from "../constants";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RosterSyncFormValues, rosterSyncSchema } from "../utils/roster-day-schema";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
interface RosterSyncModalProps {
	onClose: () => void;
	userId: string;
	userName: string;
	userWeeklyRosterSchedule: IRoster[];
	team: ITeamTiming;
	role: IRoleTiming;
}

const RosterSyncModal: React.FC<RosterSyncModalProps> = ({
	onClose,
	userId,
	userName,
	userWeeklyRosterSchedule,
	team,
	role,
}) => {
	const createOrUpdateUserRosterSyncTimeMutation = useCreateOrUpdateRosterSyncedTime(userId);
	const queryClient = useQueryClient();

	const form = useForm<RosterSyncFormValues>({
		resolver: zodResolver(rosterSyncSchema),
		defaultValues: { days: [] },
	});

	useEffect(() => {
		if (userWeeklyRosterSchedule) {
			form.reset({
				days: userWeeklyRosterSchedule.map((d) => ({
					id: d.id,
					dayStartTime: d.dayStartTime,
					dayEndTime: d.dayEndTime,
					timeSource: d.timeSource as TimeSource,
				})),
			});
		}
	}, [userWeeklyRosterSchedule, form]);

	const autoFillByType = (index: number, newType: TimeSource) => {
		if (newType === TimeSource.TEAM) {
			form.setValue(`days.${index}.dayStartTime`, team.dayStartTime);
			form.setValue(`days.${index}.dayEndTime`, team.dayEndTime);
		} else if (newType === TimeSource.ROLE) {
			form.setValue(`days.${index}.dayStartTime`, role.dayStartTime);
			form.setValue(`days.${index}.dayEndTime`, role.dayEndTime);
		}
	};

	const handleSave = (values: RosterSyncFormValues) => {
		const merged = userWeeklyRosterSchedule.map((d, i) => {
			const day = values.days[i];
			if (!day) return d;

			return {
				...d,
				dayStartTime: day.dayStartTime,
				dayEndTime: day.dayEndTime,
				timeSource: day.timeSource,
			};
		});

		createOrUpdateUserRosterSyncTimeMutation.mutate(merged, {
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["userRosterForWeek"] });
				openSuccessToast("Time synced successfully.");
				onClose();
			},
			onError: (error) => openErrorToast({ error }),
		});
	};
	const tEmployee = useTypedTranslations(NAMESPACE.EMPLOYEE_ROSTER);
	const tCommon = useTypedTranslations(NAMESPACE.COMMON);

	return (
		<div>
			<p className="mb-6 text-lg font-medium text-brand-dark50">
				{tEmployee.adjustTimingBeforeSyncingWeeklyScheduleFor}{" "}
				<span className="font-medium text-brand-dark">{userName}</span>
			</p>

			<form onSubmit={form.handleSubmit(handleSave)} className="px-2">
				{/* Header — Day | Type on mobile; Day | Start | End | Type on desktop */}
				<div className="mb-2 grid grid-cols-2 gap-x-2 gap-y-1 border-b pb-2 text-sm font-normal sm:grid-cols-4 sm:gap-3">
					<div className="order-1 sm:order-1">{tEmployee.day}</div>
					<div className="order-2 sm:order-4">{tEmployee.type}</div>
					<div className="order-3 sm:order-2">{tCommon.startTime}</div>
					<div className="order-4 sm:order-3">{tCommon.endTime}</div>
				</div>

				{form.watch("days").map((day, index) => {
					const isCustom = day.timeSource === TimeSource.CUSTOM;
					const isOff = day.timeSource === TimeSource.NOT_WORKING;

					return (
						<div
							key={day.id}
							className="grid grid-cols-2 items-start gap-x-2 gap-y-2 border-b py-2 sm:grid-cols-4 sm:items-center sm:gap-3"
						>
							{/* DAY NAME — order 1 on mobile, col 1 on desktop */}
							<div className="order-1 self-center font-medium sm:order-1">{rosterDays[index]}</div>

							{/* TIME SOURCE SELECT — order 2 on mobile (top-right), col 4 on desktop */}
							<Controller
								control={form.control}
								name={`days.${index}.timeSource`}
								render={({ field }) => (
									<div className="order-2 sm:order-4">
										<Select
											value={field.value}
											onValueChange={(newType: TimeSource) => {
												field.onChange(newType);
												autoFillByType(index, newType);
											}}
										>
											<SelectTrigger className="w-full">
												<SelectValue placeholder="Select type" />
											</SelectTrigger>

											<SelectContent>
												{Object.values(TimeSource).map((timeSource) => (
													<SelectItem key={timeSource} value={timeSource}>
														{TIME_SOURCE_DISPLAY_MAP[timeSource]}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>
								)}
							/>

							{/* START TIME — order 3 on mobile (bottom-left), col 2 on desktop */}
							<Controller
								control={form.control}
								name={`days.${index}.dayStartTime`}
								render={({ field }) => (
									<div className="order-3 sm:order-2">
										{!isOff && (
											<TimeInput
												value={dateToUTCString(field.value)}
												date={field.value}
												onChange={(v) => field.onChange(dateToUTCString(v))}
												disabled={!isCustom}
											/>
										)}
										{form.formState.errors.days?.[index]?.dayStartTime && (
											<p className="text-sm text-red-500">{form.formState.errors.days[index]?.dayStartTime?.message}</p>
										)}
									</div>
								)}
							/>

							{/* END TIME — order 4 on mobile (bottom-right), col 3 on desktop */}
							<Controller
								control={form.control}
								name={`days.${index}.dayEndTime`}
								render={({ field }) => (
									<div className="order-4 sm:order-3">
										{!isOff && (
											<TimeInput
												value={dateToUTCString(field.value)}
												date={field.value}
												onChange={(v) => field.onChange(dateToUTCString(v))}
												disabled={!isCustom}
											/>
										)}
										{form.formState.errors.days?.[index]?.dayEndTime && (
											<p className="text-sm text-red-500">{form.formState.errors.days[index]?.dayEndTime?.message}</p>
										)}
									</div>
								)}
							/>
						</div>
					);
				})}

				{/* FOOTER BUTTONS */}
				<div className="mt-4 flex justify-between gap-2">
					<Button className="w-full" variant="outline" onClick={onClose}>
						{tCommon.cancel}
					</Button>

					<Button
						type="submit"
						className="w-full"
						variant="filled"
						disabled={createOrUpdateUserRosterSyncTimeMutation.isPending}
					>
						{tCommon.save}
					</Button>
				</div>
			</form>
		</div>
	);
};

export default RosterSyncModal;
