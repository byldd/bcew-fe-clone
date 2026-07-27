import React, { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { createDailyJobFormSchema, ICreateDailyJobFormSchema } from "../utils/create-daily-job-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import JobMembersField from "../components/job-members-field";
import { useCreateDailyJob, useScheduleCrews } from "../hooks/useSchedule";
import { openErrorToast, openSuccessToast } from "@/components/toast";
import { IWeekScheduleResponse } from "../types/schedule-interface";
import { useQueryClient } from "@tanstack/react-query";
import { getTodayDate, toMidnightDateString } from "@/lib/utils/date";
import { SelectField } from "@/components/ui/selectField";
import JobLabelField from "../components/job-label-field";
import { InputField } from "@/components/ui/inputField";
import TaskLeaderField from "../components/task-leader-field";
import { legends } from "@/module/employee-dashboard/constants/legend-items";
import SubcontractorField from "../components/subcontractor-field";
import { DatePicker } from "@/components/ui/date-picker";
import { FORM_MODE } from "@/types";
import { useHandleJobOperation } from "../hooks/useHandleJobOperation";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";

export const CreateDailyJobModal = ({
	bcewJob,
	date,
	closeModal,
	specialJob,
}: {
	bcewJob?: IWeekScheduleResponse["bcewJobs"][number];
	date: Date;
	closeModal: () => void;
	specialJob?: IWeekScheduleResponse["specialJobs"][number];
}) => {
	const { mutate: createDailyJobMutation, isPending } = useCreateDailyJob();
	const queryClient = useQueryClient();

	const { data: crews } = useScheduleCrews({});

	const { onCreateDailyJob } = useHandleJobOperation();
	const tschedule = useTypedTranslations(NAMESPACE.SCHEDULE);
	const tjobCards = useTypedTranslations(NAMESPACE.JOB_CARDS);
	const tTimeLogs = useTypedTranslations(NAMESPACE.TIME_LOGS);
	const tCommon = useTypedTranslations(NAMESPACE.COMMON);

	const crewLeaders = useMemo(() => {
		return (
			crews?.items
				.map((crew) => ({
					id: crew.crewLeaderId,
					name: crew.crewLeader?.employeeName,
				}))
				.filter((crew) => crew.id !== null) || []
		);
	}, [crews]);

	const actrec = bcewJob?.schlin?.actrec || bcewJob?.srvinv?.actrec || bcewJob?.schlinExtended?.actrec;

	const form = useForm<ICreateDailyJobFormSchema>({
		resolver: zodResolver(createDailyJobFormSchema),
		defaultValues: {
			jobName: actrec?.jobnme,
			jobRecNum: `#${actrec?.recnum.toString()}`,
			date: date,
			crewLeaderId: "",
			jobEmployeeAssignments: [],
		},
	});

	const { crewLeaderId, labelIds } = form.watch();

	const isSubcontractorJob = useMemo(() => {
		return labelIds?.includes(legends.subContractorJob);
	}, [labelIds]);

	useEffect(() => {
		// when a crew leader is selected, automatically assign his crew members to the job
		// with default hours and stop number 1
		if (crewLeaderId) {
			const crew = crews?.items.find((crew) => crew.crewLeaderId === crewLeaderId);
			if (crew) {
				form.setValue("jobEmployeeAssignments", [
					{
						employeeId: crew.crewLeader.id,
						employeeName: crew.crewLeader?.employeeName,
					},
					...crew.crewEmployees.map((employee) => ({
						employeeId: employee.employee.id,
						employeeName: employee.employee.user.name,
					})),
				]);
			}
		}
	}, [crewLeaderId, crews, form]);

	const onSubmit = (data: ICreateDailyJobFormSchema) => {
		createDailyJobMutation(
			{
				schlinId: bcewJob?.schlin?.idnum,
				srvinvId: bcewJob?.srvinv?.idnum,
				specialJobId: specialJob?.id,
				date: toMidnightDateString(data.date),
				crewLeaderId: data.crewLeaderId,
				labelIds: data.labelIds,
				taskLeaderId: data.taskLeaderId,
				subcontractorId: data.subcontractorId,
				jobEmployeeAssignments: data.jobEmployeeAssignments?.map((assignment) => {
					return {
						employeeId: assignment.employeeId,
						stopNumber: assignment.stopNumber || undefined,
					};
				}),
			},
			{
				onSuccess: async (data) => {
					openSuccessToast(tschedule.dailyJobCreatedSuccessfully);
					void queryClient.invalidateQueries({ queryKey: ["week-schedule"] });
					closeModal();
					onCreateDailyJob(data);
				},
				onError: (error) => {
					openErrorToast({ error });
				},
			}
		);
	};

	return (
		<div className="p-1">
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)}>
					<div className="mb-4 flex justify-between gap-4">
						<FormField
							control={form.control}
							name="jobName"
							render={({ field }) => (
								<FormItem className="w-full">
									<FormControl>
										<InputField label={tCommon.jobId} disabled {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="w-full">
							<InputField
								label={tCommon.phase}
								disabled
								placeholder={tCommon.jobPhase}
								value={bcewJob?.schlin?.tsknme || bcewJob?.srvinv?.ordnum}
							/>
						</div>
					</div>

					<div className="flex justify-between gap-4">
						<FormField
							control={form.control}
							name="date"
							render={({ field }) => (
								<FormItem className="w-full">
									<FormLabel className="!mb-2 !text-xs !font-normal !text-brand-grey md:!text-sm">
										{tCommon.date}
									</FormLabel>
									<FormControl>
										<DatePicker
											onChange={(date) => field.onChange(date)}
											value={new Date(field.value)}
											placeholder={tCommon.selectDate}
											disabledDate={{ before: getTodayDate() }}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<div className="w-full">
							<FormField
								control={form.control}
								name="labelIds"
								render={({ field }) => (
									<FormItem className="w-full">
										<FormLabel className="!mb-2 !text-xs !font-normal !text-brand-grey md:!text-sm">
											{tCommon.status}
										</FormLabel>

										<FormControl>
											<JobLabelField onChange={field.onChange} value={field.value || []} mode={FORM_MODE.CREATE} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
					</div>
					{!isSubcontractorJob && (
						<div className="mt-4 flex justify-between gap-4">
							<FormField
								control={form.control}
								name="crewLeaderId"
								render={({ field }) => (
									<FormItem className="w-full">
										<FormControl>
											<SelectField
												label={tjobCards.crewLeader}
												options={crewLeaders?.map((leader) => ({
													label: leader.name,
													value: leader.id,
												}))}
												onValueChange={field.onChange}
												value={field.value || ""}
												placeholder={tjobCards.selectCrewLeader}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<TaskLeaderField />
						</div>
					)}
					{isSubcontractorJob && <SubcontractorField mode={FORM_MODE.CREATE} />}
					{!isSubcontractorJob && (
						<div className="my-4">
							<JobMembersField mode={FORM_MODE.CREATE} bcewJob={bcewJob} />
						</div>
					)}
					<Button className="w-full" variant={"filled"} type="submit" disabled={isPending} loading={isPending}>
						{tTimeLogs.create}
					</Button>
				</form>
			</Form>
		</div>
	);
};
