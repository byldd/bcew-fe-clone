import React from "react";
import DaySelect from "./day-select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { IweekendSelfScheduleSchema, weekendSelfScheduleSchema } from "../utils/weekend-self-schedule-schema";
import { useEmployeeSelfSchedule, useEmployeeRosters } from "../hooks/useSelfSchedule";
import { MIDDAY_STOP_TYPE } from "@/module/midday-stops/utils/enums";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import SelectWeekendJob from "./select-weekend-job";
import { openErrorToast } from "@/components/toast";
import { IForemanCreateJobPayload } from "@/module/employee-dashboard/types";
import { useSelfScheduleToast } from "../hooks/useSelfScheduleToast";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
import { FaRegSquarePlus } from "react-icons/fa6";
import { getWeekendDatesForSelfSchedule } from "../utils/helpers";
import { isSameDate, toMidnightDateString } from "@/lib/utils/date";

const SelfScheduleForm = () => {
	const schema = weekendSelfScheduleSchema();
	const tEmployee = useTypedTranslations(NAMESPACE.EMPLOYEE);

	const { handleToast } = useSelfScheduleToast();
	const { mutateAsync: createJobMutation, isPending } = useEmployeeSelfSchedule();
	const { saturdays, sundays } = getWeekendDatesForSelfSchedule(new Date());

	const { data: employeeRosters } = useEmployeeRosters({
		startDate: toMidnightDateString(saturdays[0]!),
		endDate: toMidnightDateString(sundays[sundays.length - 1]!),
	});

	const form = useForm<IweekendSelfScheduleSchema>({
		resolver: zodResolver(schema),
		defaultValues: {
			jobs: [
				{
					jobType: MIDDAY_STOP_TYPE.PROJECT,
				},
			],
		},
		mode: "onChange",
	});

	const { jobs } = form.watch();

	const onAddNewJob = () => {
		form.setValue("jobs", [
			...jobs,
			{
				jobType: MIDDAY_STOP_TYPE.PROJECT,
			},
		]);
	};

	const onRemoveJob = (index: number) => {
		const newJobs = [...jobs];
		newJobs.splice(index, 1);
		form.setValue("jobs", newJobs);
	};

	const onSubmit = (data: IweekendSelfScheduleSchema) => {
		const payload: IForemanCreateJobPayload[] = data.jobs?.map((job) => {
			return {
				projectName: job.project,
				date: job.date!,
				bcewSchlinExtendedId: job.bcewSchlinExtendedId || undefined,
				bcewSchlinIdnum: job.bcewSchlinIdnum || undefined,
				bcewSrvinvIdnum: job.bcewSrvinvIdnum || undefined,
				qcType: job.qcType || undefined,
				startTime: job.startTime || undefined,
				endTime: job.endTime || undefined,
				note: job.note || undefined,
				specialJobId: job.specialJobId || undefined,
			};
		});

		createJobMutation(payload, {
			onSuccess: (responseData) => {
				form.reset();
				handleToast(responseData);
			},
			onError: (error) => {
				openErrorToast({ error });
			},
		});
	};

	return (
		<div>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)}>
					<div>
						<div className="space-y-4">
							{jobs?.map((job, index) => {
								const roster = job.date
									? employeeRosters?.find((r) => job.date && isSameDate(r.date, job.date))
									: undefined;

								return (
									<div key={index}>
										{
											<FormField
												control={form.control}
												name={`jobs.${index}.date`}
												render={({ field }) => (
													<FormItem>
														<FormLabel className="text-sm">{tEmployee.date}</FormLabel>
														<FormControl>
															<DaySelect
																selectedDate={field.value || null}
																onSelectDate={(date) => {
																	field.onChange(date);
																	form.setValue(`jobs.${index}`, {
																		jobType: MIDDAY_STOP_TYPE.PROJECT,
																		project: undefined,
																		actrec: undefined,
																		bcewSchlinExtendedId: null,
																		bcewSchlinIdnum: null,
																		bcewSrvinvIdnum: null,
																		qcType: null,
																		specialJobId: null,
																		note: undefined,
																		startTime: undefined,
																		endTime: undefined,
																		date,
																	});
																}}
																onRemoveRow={() => {
																	onRemoveJob(index);
																}}
																index={index}
															/>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
										}

										{job.date && <SelectWeekendJob index={index} date={job.date} roster={roster} />}
									</div>
								);
							})}
						</div>

						<Button
							type="button"
							key={"add-job-button"}
							className="my-4"
							variant={"filled"}
							size={"sm"}
							onClick={onAddNewJob}
						>
							<FaRegSquarePlus size={20} />
							{tEmployee.addNewJob}
						</Button>

						<div className="mt-6 flex items-center justify-between gap-2">
							<Button
								disabled={isPending}
								type="button"
								onClick={() => form.reset()}
								className="w-full"
								variant={"outline"}
							>
								{tEmployee.reset}
							</Button>
							<Button disabled={isPending} className="w-full" variant={"filled"} type="submit">
								{tEmployee.save}
							</Button>
						</div>
					</div>
				</form>
			</Form>
		</div>
	);
};

export default SelfScheduleForm;
