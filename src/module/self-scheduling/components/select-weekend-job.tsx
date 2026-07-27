"use client";

import { useFormContext } from "react-hook-form";
import { SelectField } from "@/components/ui/selectField";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useScheduleJobOptions } from "@/module/midday-stops/hooks/useScheduleJobOptions";
import { MIDDAY_STOP_TYPE } from "@/module/midday-stops/utils/enums";
import { IweekendSelfScheduleSchema } from "../utils/weekend-self-schedule-schema";
import { useScheduleJobs } from "@/module/employee-dashboard/hooks/foreman";
import { Spinner } from "@/components/ui/spinner";
import { dateToUTCString, getTodayDate, toDate, toMidnightDateString } from "@/lib/utils/date";
import TimeInput from "@/components/ui/time-input";
import { Textarea } from "@/components/ui/textarea";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
import { IDayRosterTime } from "@/module/employee/types";
import { useEffect } from "react";

type Props = {
	index: number;
	date: string;
	roster?: Pick<
		IDayRosterTime,
		"dayStartTime" | "dayEndTime" | "extendedApprovedEndTime" | "extendedApprovedStartTime"
	> | null;
};

const SelectWeekendJob = ({ index, date, roster }: Props) => {
	const tEmployee = useTypedTranslations(NAMESPACE.EMPLOYEE);

	const rosterStartTime = roster?.extendedApprovedStartTime || roster?.dayStartTime;
	const rosterEndTime = roster?.extendedApprovedEndTime || roster?.dayEndTime;

	const { data: scheduleJobs, isLoading } = useScheduleJobs({
		startDate: toMidnightDateString(toDate(date)),
		endDate: toMidnightDateString(toDate(date)),
	});

	const formContext = useFormContext<IweekendSelfScheduleSchema>();
	const { jobs } = formContext.watch();
	const job = jobs[index]!;

	const { jobType, project, actrec, bcewSchlinExtendedId, qcType } = job;

	const { projectOptions, workOrderOptions, jobOptions, taskOptions, specialJobOptions } = useScheduleJobOptions(
		scheduleJobs,
		project,
		actrec,
		toDate(date)
	);

	const isPastDate = toDate(date) < getTodayDate();

	useEffect(() => {
		if (rosterStartTime && rosterEndTime && !job.startTime && !job.endTime) {
			formContext.setValue(`jobs.${index}.startTime`, dateToUTCString(rosterStartTime));
			formContext.setValue(`jobs.${index}.endTime`, dateToUTCString(rosterEndTime));
		}
	}, [rosterStartTime, rosterEndTime, formContext, index, job]);

	if (isLoading) return <Spinner />;

	return (
		<div className="space-y-2 p-2">
			{/* Job Type */}
			<FormField
				control={formContext.control}
				name={`jobs.${index}.jobType`}
				render={({ field }) => {
					return (
						<FormItem className="space-y-1">
							<FormLabel className="font-inter text-sm font-normal text-brand-grey">
								{tEmployee.jobTypeQuestion}
							</FormLabel>
							<FormControl>
								<RadioGroup
									value={field.value}
									onValueChange={(val) => {
										formContext.setValue(`jobs.${index}.jobType`, val as MIDDAY_STOP_TYPE);
										formContext.setValue(`jobs.${index}.project`, undefined);
										formContext.setValue(`jobs.${index}.actrec`, undefined);
										formContext.setValue(`jobs.${index}.bcewSchlinExtendedId`, null);
										formContext.setValue(`jobs.${index}.bcewSchlinIdnum`, null);
										formContext.setValue(`jobs.${index}.bcewSrvinvIdnum`, null);
										formContext.setValue(`jobs.${index}.qcType`, null);
										formContext.setValue(`jobs.${index}.specialJobId`, null);
									}}
									className="flex items-center gap-6 py-2"
								>
									<div className="flex items-center gap-2">
										<RadioGroupItem value={MIDDAY_STOP_TYPE.PROJECT} />
										<Label className="text-sm text-brand-dark">{tEmployee.project}</Label>
									</div>

									<div className="flex items-center gap-2">
										<RadioGroupItem value={MIDDAY_STOP_TYPE.SPECIAL_JOB} />
										<Label className="text-sm text-brand-dark">{tEmployee.specialJob}</Label>
									</div>
									<div className="flex items-center gap-2">
										<RadioGroupItem value={MIDDAY_STOP_TYPE.WORK_ORDER} />
										<Label className="text-sm text-brand-dark">{tEmployee.workOrder}</Label>
									</div>
								</RadioGroup>
							</FormControl>
							<FormMessage />
						</FormItem>
					);
				}}
			/>

			{/* SPECIAL JOB */}
			{jobType === MIDDAY_STOP_TYPE.SPECIAL_JOB && (
				<FormField
					control={formContext.control}
					name={`jobs.${index}.specialJobId`}
					render={({ field }) => (
						<FormItem>
							<FormControl>
								<SelectField
									label={tEmployee.specialJob}
									placeholder={tEmployee.selectJob}
									options={specialJobOptions}
									value={field.value || ""}
									onValueChange={field.onChange}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
			)}

			{/* PROJECT FLOW */}
			{jobType === MIDDAY_STOP_TYPE.PROJECT && (
				<>
					<FormField
						control={formContext.control}
						name={`jobs.${index}.project`}
						render={({ field }) => (
							<FormItem>
								<FormControl>
									<SelectField
										label={tEmployee.project}
										placeholder={tEmployee.selectProject}
										options={projectOptions || []}
										value={field.value || ""}
										onValueChange={(value) => {
											formContext.setValue(`jobs.${index}.project`, value);
											formContext.setValue(`jobs.${index}.actrec`, undefined);
											formContext.setValue(`jobs.${index}.bcewSchlinExtendedId`, null);
											formContext.setValue(`jobs.${index}.bcewSchlinIdnum`, null);
											formContext.setValue(`jobs.${index}.bcewSrvinvIdnum`, null);
											formContext.setValue(`jobs.${index}.qcType`, null);
										}}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={formContext.control}
						name={`jobs.${index}.actrec`}
						render={({ field }) => (
							<FormItem>
								<FormControl>
									<SelectField
										label={tEmployee.job}
										placeholder={tEmployee.selectJob}
										options={jobOptions || []}
										value={field.value || ""}
										onValueChange={(value) => formContext.setValue(`jobs.${index}.actrec`, Number(value))}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					{
						<FormField
							control={formContext.control}
							name={`jobs.${index}.bcewSchlinIdnum`}
							render={() => {
								let value = job.bcewSchlinIdnum || "";

								if (job.qcType) {
									const selectedQc = taskOptions.find(
										(option) => option.bcewSchlinExtendedId === bcewSchlinExtendedId && option.qcType === qcType
									);
									value = selectedQc?.value || "";
								}

								return (
									<FormItem>
										<FormControl>
											<SelectField
												label={tEmployee.phase}
												placeholder={tEmployee.selectPhase}
												options={taskOptions}
												value={value || ""}
												onValueChange={(_, option) => {
													if (!option) return;

													if (option.bcewSchlinIdnum) {
														formContext.setValue(`jobs.${index}.bcewSchlinIdnum`, option.bcewSchlinIdnum);
														formContext.setValue(`jobs.${index}.bcewSchlinExtendedId`, null);
														formContext.setValue(`jobs.${index}.qcType`, null);
													} else {
														formContext.setValue(`jobs.${index}.bcewSchlinExtendedId`, option.bcewSchlinExtendedId);
														formContext.setValue(`jobs.${index}.bcewSchlinIdnum`, null);
														formContext.setValue(`jobs.${index}.qcType`, option.qcType);
													}
												}}
											/>
										</FormControl>
									</FormItem>
								);
							}}
						/>
					}
				</>
			)}

			{jobType === MIDDAY_STOP_TYPE.WORK_ORDER && (
				<FormField
					control={formContext.control}
					name={`jobs.${index}.bcewSrvinvIdnum`}
					render={({ field }) => (
						<FormItem className="mt-3 w-full flex-1">
							<FormControl className="space-y-1">
								<SelectField
									placeholder={tEmployee.selectWorkOrder}
									label={tEmployee.workOrder}
									options={workOrderOptions}
									value={field.value || ""}
									onValueChange={(value, option) => {
										field.onChange(value);
										formContext.setValue(`jobs.${index}.project`, option?.label || "");
									}}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
			)}

			{isPastDate && (
				<div className="grid grid-cols-2 gap-3">
					<FormField
						control={formContext.control}
						name={`jobs.${index}.startTime`}
						render={({ field }) => (
							<FormItem>
								<FormLabel className="mt-1 text-sm font-normal text-brand-grey">{tEmployee.startTime}</FormLabel>
								<FormControl>
									<TimeInput value={field.value || undefined} date={toDate(date)} onChange={field.onChange} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={formContext.control}
						name={`jobs.${index}.endTime`}
						render={({ field }) => (
							<FormItem>
								<FormLabel className="mt-1 text-sm font-normal text-brand-grey">{tEmployee.endTime}</FormLabel>
								<FormControl>
									<TimeInput value={field.value || undefined} date={toDate(date)} onChange={field.onChange} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>
			)}

			<FormField
				control={formContext.control}
				name={`jobs.${index}.note`}
				render={({ field }) => (
					<FormItem className="space-y-1">
						<FormLabel className="te text-sm text-brand-grey">{tEmployee.note}</FormLabel>
						<FormControl>
							<Textarea
								{...field}
								value={field.value || ""}
								placeholder={tEmployee.typeHere}
								className="w-full rounded-[8px] px-3 py-2 text-sm"
							/>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>
		</div>
	);
};

export default SelectWeekendJob;
