import React, { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { IMiddayStopsFormSchema, middayStopsFormSchema } from "../utils/midday-stop-form";
import { Label } from "@radix-ui/react-label";
import { Button } from "@/components/ui/button";
import TimeInput from "@/components/ui/time-input";
import { useEmployeeTodayRoster } from "@/module/job/hooks/useEmployeeSchedule";
import { dateToUTCString, toDate, toFormattedDate, toMidnightDateString } from "@/lib/utils/date";
import BackButton from "@/components/common/back-button";
import { SelectField } from "@/components/ui/selectField";
import AddMiddayStopModal from "../components/add-midday-stop-modal";
import { requestTypeOptions } from "../utils/constants";
import { MIDDAY_STOP_REQUEST_TYPE } from "../utils/enums";
import { useUpdateMiddayStop } from "../hooks/useEmployeeMiddayStop";
import { openErrorToast, openSuccessToast } from "@/components/toast";
import { Textarea } from "@/components/ui/textarea";
import { getFormattedTimeRange } from "@/module/schedule-management/roster-time-configuration/utils";
import { FALLBACK_TIME_RANGE_STRINGS } from "@/utils/enums";
import { defaultRosterTime } from "@/module/job/utils/constants";
import { Separator } from "@/components/ui/separator";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
import { useEmployeeScheduleParams } from "@/module/job/hooks/useEmployeeScheduleParams";

const MiddayStopsTemplate = () => {
	const { getParams } = useEmployeeScheduleParams();
	const { startDate } = getParams();
	const { mutate: createMiddayMutation, isPending } = useUpdateMiddayStop();
	const tEmployee = useTypedTranslations(NAMESPACE.EMPLOYEE);
	const rosterParams = useMemo(
		() => ({
			date: dateToUTCString(startDate),
		}),
		[startDate]
	);
	const { data: rosterTime } = useEmployeeTodayRoster(rosterParams);
	const { dayStartTime, dayEndTime, date, extendedApprovedStartTime, extendedApprovedEndTime } =
		rosterTime || defaultRosterTime;

	const zodSchema = middayStopsFormSchema({
		minStartTime: extendedApprovedStartTime || dayStartTime,
		maxEndTime: extendedApprovedEndTime || dayEndTime,
	});

	const form = useForm<IMiddayStopsFormSchema>({
		resolver: zodResolver(zodSchema),
		defaultValues: {
			requestType: undefined,
			note: "",
			startTime: "",
			endTime: "",
		},
	});

	const { register, watch, handleSubmit } = form;
	const { requestType } = watch();

	const onSubmit = (data: { requestType: string; note?: string; startTime: string; endTime: string }) => {
		createMiddayMutation(
			{
				date: toMidnightDateString(startDate || date),
				note: data.note || "",
				startTime: data.startTime,
				endTime: data.endTime,
				requestType: data.requestType,
			},
			{
				onSuccess: () => {
					openSuccessToast(tEmployee.newJobRequestSentSuccessfully);
					setIsOpen(false);
					form.reset();
				},
				onError: (error) => {
					openErrorToast({ error });
				},
			}
		);
	};

	const [isOpen, setIsOpen] = useState(false);

	useEffect(() => {
		if (requestType === MIDDAY_STOP_REQUEST_TYPE.ADD_NEW_STOP) {
			setIsOpen(true);
		}
	}, [requestType]);

	return (
		<div className="w-full space-y-3 bg-white p-4">
			<div className="ml-[-10px] flex items-center gap-1">
				<BackButton />
				<h3 className="text-xl font-medium">{tEmployee.newJobRequest}</h3>
			</div>
			<div className="space-y-1.5">
				<p className="text-sm text-brand-dark60">{tEmployee.requestOnlyInsideRosterTime}</p>

				<p className="text-sm font-medium text-brand-dark60">
					{tEmployee.date}: <span className="text-brand-dark">{date ? toFormattedDate(date) : ""}</span>
				</p>

				<p className="text-sm font-medium text-brand-dark60">
					{tEmployee.rosterTime}:{" "}
					<span className="text-brand-dark">
						{getFormattedTimeRange(dayStartTime, dayEndTime, FALLBACK_TIME_RANGE_STRINGS.DEFAULT_TIME_RANGE)}
					</span>
				</p>
				{extendedApprovedStartTime && extendedApprovedEndTime && (
					<p className="text-sm font-medium text-brand-dark60">
						{tEmployee.extendedRosterTime} :{" "}
						<span className="text-brand-dark">
							{getFormattedTimeRange(
								extendedApprovedStartTime,
								extendedApprovedEndTime,
								FALLBACK_TIME_RANGE_STRINGS.DEFAULT_TIME_RANGE
							)}
						</span>
					</p>
				)}
			</div>
			<Separator className="my-4" />
			<div className="h-auto space-y-3 overflow-y-auto">
				<div className="space-y-1">
					<Label className="text-sm text-brand-grey">
						{" "}
						{tEmployee.typeOfRequest}
						<span className="text-brand-grey">*</span>
					</Label>

					<Controller
						name="requestType"
						control={form.control}
						render={({ field, fieldState }) => (
							<SelectField
								id="requestType"
								placeholder={tEmployee.selectType}
								options={requestTypeOptions}
								value={field.value}
								onValueChange={field.onChange}
								error={fieldState.error?.message}
							/>
						)}
					/>
				</div>

				{requestType === MIDDAY_STOP_REQUEST_TYPE.ADD_NEW_STOP && (
					<>
						{isOpen && (
							<div>
								<AddMiddayStopModal setIsOpen={setIsOpen} requestType={requestType} rosterTime={rosterTime} />
							</div>
						)}
					</>
				)}

				{requestType !== MIDDAY_STOP_REQUEST_TYPE.ADD_NEW_STOP && (
					<form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
						<div className="grid grid-cols-2 gap-3">
							<div className="space-y-1">
								<Label className="text-sm text-brand-grey">
									{tEmployee.startTime}
									<span className="text-brand-grey">*</span>
								</Label>
								<Controller
									control={form.control}
									name="startTime"
									render={({ field }) => (
										<>
											<TimeInput
												value={field.value}
												date={field.value || toDate(startDate)}
												onChange={field.onChange}
											/>
											{form.formState.errors.startTime && (
												<p className="text-sm text-red-500">{form.formState.errors.startTime.message}</p>
											)}
										</>
									)}
								/>
							</div>

							<div className="space-y-1">
								<Label className="text-sm text-brand-grey">
									{tEmployee.endTime}
									<span className="text-brand-grey">*</span>
								</Label>
								<Controller
									control={form.control}
									name="endTime"
									render={({ field }) => (
										<>
											<TimeInput
												value={field.value}
												date={field.value || toDate(startDate)}
												onChange={field.onChange}
											/>
											{form.formState.errors.endTime && (
												<p className="text-sm text-red-500">{form.formState.errors.endTime.message}</p>
											)}
										</>
									)}
								/>
							</div>
						</div>
						<div className="space-y-1 pb-10">
							<Label className="text-sm text-brand-grey">{tEmployee.addNote}</Label>
							<div className="px-0.5">
								<Textarea
									{...register("note")}
									placeholder={tEmployee.typeHere}
									className="w-full rounded-md border-none px-3 py-2 text-xs"
								/>
							</div>
						</div>
						<div className="fixed bottom-0 left-0 right-0 z-50 flex w-full gap-2 bg-white px-4 py-3 shadow-md">
							<Button type="button" onClick={() => form.reset()} variant={"outline"} className="w-full">
								{tEmployee.reset}
							</Button>
							<Button type="submit" loading={isPending} variant="filled" className="w-full">
								{tEmployee.sendRequest}
							</Button>
						</div>
					</form>
				)}
			</div>
		</div>
	);
};

export default MiddayStopsTemplate;
