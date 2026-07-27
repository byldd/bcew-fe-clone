"use client";

import { Button } from "@/components/ui/button";
import TimeInput from "@/components/ui/time-input";
import { openErrorToast, openSuccessToast } from "@/components/toast";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFingerprintActionRequest } from "../hooks/useFingerprintActionRequest";
import { useEmployeeTodayRoster } from "@/module/job/hooks/useEmployeeSchedule";
import { getFormattedTimeRange } from "@/module/schedule-management/roster-time-configuration/utils";
import { FALLBACK_TIME_RANGE_STRINGS } from "@/utils/enums";
import { dateToUTCString, toFormattedDate } from "@/lib/utils/date";
import { DATE_FORMAT } from "@/types/date";
import { FormLabelRequired } from "@/components/ui/formLabelrequired";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { getAttendanceReasonContext, validateRosterTime } from "../utils";
import { AttendanceReasonPrefix } from "../utils/enums";
import { fingerprintRequestSchema, IFingerprintRequestFormSchema } from "../utils/fingerprint-request-form";
import ReasonField from "./reason-field";
import { useQueryClient } from "@tanstack/react-query";

interface FingerprintActionRequestModalProps {
	date: string;
	onSuccess: () => void;
}

export default function FingerprintActionRequestModal({ date, onSuccess }: FingerprintActionRequestModalProps) {
	const { data: rosterTime } = useEmployeeTodayRoster({ date });
	const { mutate: sendRequest, isPending } = useFingerprintActionRequest();

	const form = useForm<IFingerprintRequestFormSchema>({
		resolver: zodResolver(fingerprintRequestSchema),
		defaultValues: {
			startTime: dateToUTCString(date),
			endTime: dateToUTCString(date),
			lateReason: "",
			earlyReason: "",
			note: "",
			isLateStart: false,
			isEarlyQuit: false,
		},
	});

	const queryClient = useQueryClient();

	useEffect(() => {
		if (rosterTime?.dayStartTime) form.setValue("startTime", dateToUTCString(rosterTime.dayStartTime));
		if (rosterTime?.dayEndTime) form.setValue("endTime", dateToUTCString(rosterTime.dayEndTime));
	}, [rosterTime, form]);

	const startTime = form.watch("startTime");
	const endTime = form.watch("endTime");

	const { isLateStart, isEarlyQuit } = useMemo(
		() => getAttendanceReasonContext(rosterTime?.dayStartTime, rosterTime?.dayEndTime, startTime, endTime),
		[rosterTime, startTime, endTime]
	);

	useEffect(() => {
		form.setValue("isLateStart", isLateStart);
		form.setValue("isEarlyQuit", isEarlyQuit);
	}, [isLateStart, isEarlyQuit, form]);

	const onSubmit = (data: IFingerprintRequestFormSchema) => {
		const formattedStart = toFormattedDate(data.startTime, DATE_FORMAT.HH_MM);
		const formattedEnd = toFormattedDate(data.endTime, DATE_FORMAT.HH_MM);

		if (
			!validateRosterTime(
				{ dayStartTime: rosterTime?.dayStartTime, dayEndTime: rosterTime?.dayEndTime },
				formattedStart,
				formattedEnd
			)
		) {
			return;
		}

		sendRequest(
			{
				date,
				startTime: data.startTime,
				endTime: data.endTime,
				note: !isLateStart && !isEarlyQuit ? data.note?.trim() : undefined,
				lateReason: isLateStart ? data.lateReason?.trim() : undefined,
				earlyReason: isEarlyQuit ? data.earlyReason?.trim() : undefined,
			},
			{
				onSuccess: () => {
					queryClient.invalidateQueries({ queryKey: ["employee-schedule-lock-status"] });
					openSuccessToast("Request sent to admin successfully.");
					onSuccess();
				},
				onError: () => {
					openErrorToast({ message: "Failed to send request. Please try again." });
				},
			}
		);
	};

	return (
		<div className="w-full space-y-4 border-t px-0">
			<div>
				<h2 className="border-brand-lightgrey py-3 font-inter text-sm font-medium text-brand-grey">
					Date:{" "}
					<span className="text-xs font-medium text-brand-dark">
						{date ? toFormattedDate(date, DATE_FORMAT.MM_SLASH_DD_YYYY) : "--"}
					</span>
				</h2>

				<h2 className="mb-4 border-b pb-2 font-inter text-sm font-medium text-brand-dark60">
					Roster Time:{" "}
					<span className="text-xs font-medium text-brand-dark">
						{getFormattedTimeRange(
							rosterTime?.dayStartTime ?? null,
							rosterTime?.dayEndTime ?? null,
							FALLBACK_TIME_RANGE_STRINGS.DEFAULT_TIME_RANGE
						)}
					</span>
				</h2>
			</div>

			<p className="font-inter text-sm font-medium text-brand-dark60">Enter your start and end time</p>

			<Form {...form}>
				<form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
					<div className="flex min-w-full gap-2">
						<FormField
							control={form.control}
							name="startTime"
							render={({ field }) => (
								<FormItem className="w-full flex-1">
									<FormLabelRequired label="Start Time" required />
									<TimeInput date={field.value} value={field.value} onChange={field.onChange} />
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="endTime"
							render={({ field }) => (
								<FormItem className="w-full flex-1">
									<FormLabelRequired label="End Time" required />
									<TimeInput date={field.value} value={field.value} onChange={field.onChange} />
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>

					{isLateStart && (
						<FormField
							control={form.control}
							name="lateReason"
							render={({ field }) => (
								<ReasonField
									label={AttendanceReasonPrefix.LATE_START}
									value={field.value ?? ""}
									onChange={field.onChange}
								/>
							)}
						/>
					)}

					{isEarlyQuit && (
						<FormField
							control={form.control}
							name="earlyReason"
							render={({ field }) => (
								<ReasonField
									label={AttendanceReasonPrefix.EARLY_QUIT}
									value={field.value ?? ""}
									onChange={field.onChange}
								/>
							)}
						/>
					)}

					{!isLateStart && !isEarlyQuit && (
						<FormField
							control={form.control}
							name="note"
							render={({ field }) => (
								<ReasonField label="Reason/Note" value={field.value ?? ""} onChange={field.onChange} />
							)}
						/>
					)}

					<Button disabled={isPending} type="submit" variant="filled" className="mt-4 w-full">
						{isPending ? "Sending..." : "Send Request"}
					</Button>
				</form>
			</Form>
		</div>
	);
}
