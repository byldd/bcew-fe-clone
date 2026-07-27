"use client";

import React from "react";
import { Spinner } from "@/components/ui/spinner";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Form, FormField } from "@/components/ui/form";
import { openErrorToast, openSuccessToast } from "@/components/toast";
import { useQueryClient } from "@tanstack/react-query";
import { Label } from "@/components/ui/label";
import TimeInput from "@/components/ui/time-input";
import { addNewMiddayJobFormSchema, IAddNewMiddayJobFormSchema } from "../utils/midday-stop-form";
import { useUpdateMiddayStop } from "../hooks/useEmployeeMiddayStop";
import { useScheduleJobs } from "@/module/employee-dashboard/hooks/foreman";
import { toMidnightDateString } from "@/lib/utils/date";
import { Textarea } from "@/components/ui/textarea";
import { defaultRosterTime } from "@/module/job/utils/constants";
import { Button } from "@/components/ui/button";
import SelectMiddayStop from "./schedule-midday-stop";
import { MIDDAY_STOP_TYPE } from "../utils/enums";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
import { IRoster } from "@/module/schedule-management/roster-time-configuration/types";
import { useEmployeeScheduleParams } from "@/module/job/hooks/useEmployeeScheduleParams";
import { formatSnakeCase } from "@/lib/utils/value-formatter";

const AddMiddayStopModal = ({
	requestType,
	rosterTime,
}: {
	setIsOpen: (value: boolean) => void;
	requestType: string;
	rosterTime: IRoster | undefined;
}) => {
	const { getParams } = useEmployeeScheduleParams();
	const { startDate } = getParams();
	const { data: scheduleJobs, isLoading } = useScheduleJobs({});
	const tEmployee = useTypedTranslations(NAMESPACE.EMPLOYEE);
	const { mutate: createMiddayMutation, isPending } = useUpdateMiddayStop();
	const queryClient = useQueryClient();
	const { dayStartTime, dayEndTime, extendedApprovedStartTime, extendedApprovedEndTime, date } =
		rosterTime || defaultRosterTime;

	const zodSchema = addNewMiddayJobFormSchema({
		minStartTime: extendedApprovedStartTime || dayStartTime,
		maxEndTime: extendedApprovedEndTime || dayEndTime,
	});

	const form = useForm<IAddNewMiddayJobFormSchema>({
		resolver: zodResolver(zodSchema),
		defaultValues: {
			bcewSchlinExtendedId: null,
			bcewSchlinIdnum: null,
			bcewSrvinvIdnum: null,
			qcType: null,
			specialJobId: null,
			note: "",
			startTime: "",
			endTime: "",
			stopType: MIDDAY_STOP_TYPE.PROJECT,
		},
	});

	const { stopType } = form.watch();

	const onSubmit = (data: IAddNewMiddayJobFormSchema) => {
		createMiddayMutation(
			{
				stopNumber: data.stopNumber || undefined,
				date: toMidnightDateString(startDate || date),
				bcewSchlinExtendedId: data.bcewSchlinExtendedId || undefined,
				bcewSchlinIdnum: data.bcewSchlinIdnum || undefined,
				bcewSrvinvIdnum: data.bcewSrvinvIdnum || undefined,
				specialJobId: data.specialJobId || undefined,
				actrec: data.actrec,
				project: `${data.project} ${data.qcType ? ` ( QC ${formatSnakeCase(data.qcType)})` : ""}`,
				note: data.note || "",
				startTime: data.startTime,
				endTime: data.endTime,
				requestType,
				qcType: data.qcType || undefined,
			},
			{
				onSuccess: () => {
					openSuccessToast(tEmployee.newJobRequestSentSuccessfully);
					void queryClient.invalidateQueries({ queryKey: ["employee-schedule"] });
					form.reset({
						project: undefined,
						stopType: stopType,
					});
				},
				onError: (error) => {
					openErrorToast({ error });
				},
			}
		);
	};

	if (isLoading) {
		return <Spinner />;
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)}>
				<div className="min-w-full space-y-4 overflow-y-auto pb-6">
					<SelectMiddayStop scheduleJobs={scheduleJobs} />

					<div className="mb-4 grid grid-cols-2 gap-3">
						<div className="space-y-1">
							<Label className="text-sm font-normal text-brand-grey">
								{tEmployee.startTime}
								<span className="text-brand-grey">*</span>
							</Label>
							<Controller
								control={form.control}
								name="startTime"
								render={({ field }) => (
									<div>
										<TimeInput value={field.value} date={field.value || date} onChange={field.onChange} />
										{form.formState.errors.startTime && (
											<p className="text-sm text-red-500">{form.formState.errors.startTime.message}</p>
										)}
									</div>
								)}
							/>
						</div>

						<div className="space-y-1">
							<Label className="text-sm font-normal text-brand-grey">
								{tEmployee.endTime}
								<span className="text-brand-grey">*</span>
							</Label>
							<Controller
								control={form.control}
								name="endTime"
								render={({ field }) => (
									<div>
										<TimeInput value={field.value} date={field.value || date} onChange={field.onChange} />
										{form.formState.errors.endTime && (
											<p className="text-sm text-red-500">{form.formState.errors.endTime.message}</p>
										)}
									</div>
								)}
							/>
						</div>
					</div>
					<div className="space-y-1">
						<Label className="text-sm font-normal text-brand-grey">{tEmployee.addNote}</Label>
						<FormField
							control={form.control}
							name="note"
							render={({ field }) => (
								<div className="px-0.5">
									<Textarea
										{...field}
										placeholder={tEmployee.typeHere}
										className="w-full rounded-[8px] border-none px-3 py-2 text-sm"
									/>
								</div>
							)}
						/>
					</div>
					<div className="fixed bottom-0 left-0 right-0 z-50 flex w-full gap-2 bg-white px-4 py-3 shadow-md">
						<Button
							type="button"
							onClick={() => {
								form.reset({
									project: undefined,
									stopType: stopType,
								});
							}}
							variant={"outline"}
							className="w-full"
						>
							{tEmployee.reset}
						</Button>
						<Button variant="filled" className="w-full" type="submit" loading={isPending}>
							{tEmployee.sendRequest}
						</Button>
					</div>
				</div>
			</form>
		</Form>
	);
};

export default AddMiddayStopModal;
