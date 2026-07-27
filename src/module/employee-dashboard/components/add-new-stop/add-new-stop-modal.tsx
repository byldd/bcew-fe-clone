import { Button } from "@/components/ui/button";
import React from "react";
import { useForemanAddNewJob, useScheduleJobs } from "../../hooks/foreman";
import { Spinner } from "@/components/ui/spinner";
import { SelectField } from "@/components/ui/selectField";
import { stopNumbers } from "@/module/schedule-management/weekly-schedule-management/constants/week-schedule";
import { foremanAddJobFormSchema, IForemanAddJobFormSchema } from "../../utils/foreman-add-job-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { openErrorToast, openSuccessToast } from "@/components/toast";
import { getTodayDate, toMidnightDateString } from "@/lib/utils/date";
import { QC_JOB_TYPE } from "@/module/schedule-management/weekly-schedule-management/types/schedule-interface";
import { useQueryClient } from "@tanstack/react-query";
import SelectJob from "./select-job";
import RadioGroupField from "@/components/ui/radio-group-field";
import { MIDDAY_STOP_TYPE } from "@/module/midday-stops/utils/enums";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";

const AddNewStopModal = ({ setIsOpen, newStop }: { setIsOpen: (value: boolean) => void; newStop: number }) => {
	const { data: scheduleJobs, isLoading } = useScheduleJobs({});
	const { mutate: createJobMutation, isPending: isCreateJobPending } = useForemanAddNewJob();
	const queryClient = useQueryClient();
	const tEmployee = useTypedTranslations(NAMESPACE.EMPLOYEE);

	const form = useForm<IForemanAddJobFormSchema>({
		resolver: zodResolver(foremanAddJobFormSchema),
		defaultValues: {
			stopNumber: newStop,
			bcewSchlinExtendedId: null,
			bcewSchlinIdnum: null,
			bcewSrvinvIdnum: null,
			qcType: null,
			specialJobId: null,
			jobType: MIDDAY_STOP_TYPE.PROJECT,
		},
	});

	const onSubmit = (data: IForemanAddJobFormSchema) => {
		createJobMutation(
			{
				stopNumber: data.stopNumber || undefined,
				date: toMidnightDateString(getTodayDate()),
				bcewSchlinExtendedId: data.bcewSchlinExtendedId || undefined,
				bcewSchlinIdnum: data.bcewSchlinIdnum || undefined,
				bcewSrvinvIdnum: data.bcewSrvinvIdnum || undefined,
				qcType: data.qcType as QC_JOB_TYPE | undefined,
				specialJobId: data.specialJobId || undefined,
			},
			{
				onSuccess: () => {
					openSuccessToast(tEmployee.jobCreatedSuccessfully);
					setIsOpen(false);
					void queryClient.invalidateQueries({ queryKey: ["employee-schedule"] });
					form.reset();
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
		<div className="px-2">
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)}>
					<div className="space-y-4">
						<FormField
							control={form.control}
							name="stopNumber"
							render={({ field }) => (
								<FormItem className="">
									<FormControl className="">
										<SelectField
											disabled={true}
											placeholder={tEmployee.selectStop}
											value={field.value ? field.value.toString() : ""}
											label={tEmployee.stopNo}
											options={stopNumbers.map((stop) => ({ label: stop.toString(), value: stop.toString() }))}
											onValueChange={(value) => field.onChange(Number(value))}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="jobType"
							render={({ field }) => (
								<FormItem className="">
									<FormControl className="">
										<RadioGroupField
											options={[
												{ label: "Project", value: MIDDAY_STOP_TYPE.PROJECT },
												{ label: "Work Order", value: MIDDAY_STOP_TYPE.WORK_ORDER },
											]}
											value={field.value}
											onChange={(value) => {
												form.reset({
													actrec: undefined,
													bcewSchlinExtendedId: undefined,
													bcewSchlinIdnum: undefined,
													bcewSrvinvIdnum: undefined,
													qcType: undefined,
													specialJobId: undefined,
													project: undefined,
													jobType: value as MIDDAY_STOP_TYPE,
												});
											}}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<SelectJob scheduleJobs={scheduleJobs} />

						<div className="flex gap-2">
							<Button variant="outline" className="w-full" onClick={() => setIsOpen(false)}>
								{tEmployee.reset}
							</Button>
							<Button variant="filled" className="w-full" type="submit" loading={isCreateJobPending}>
								{tEmployee.save}
							</Button>
						</div>
					</div>
				</form>
			</Form>
		</div>
	);
};

export default AddNewStopModal;
