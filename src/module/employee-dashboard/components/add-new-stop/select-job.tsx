"use client";

import { IWeekScheduleResponse } from "@/module/schedule-management/weekly-schedule-management/types/schedule-interface";
import { useFormContext } from "react-hook-form";
import { IForemanAddJobFormSchema } from "../../utils/foreman-add-job-form";
import { SelectField } from "@/components/ui/selectField";
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useScheduleJobOptions } from "@/module/midday-stops/hooks/useScheduleJobOptions";
import { MIDDAY_STOP_TYPE } from "@/module/midday-stops/utils/enums";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";

const SelectJob = ({ scheduleJobs }: { scheduleJobs: IWeekScheduleResponse | undefined }) => {
	const formContext = useFormContext<IForemanAddJobFormSchema>();
	const tEmployee = useTypedTranslations(NAMESPACE.EMPLOYEE);
	const { bcewSchlinExtendedId, bcewSchlinIdnum, actrec, project, qcType, stopNumber, jobType } = formContext.watch();

	const { projectOptions, jobOptions, taskOptions, workOrderOptions } = useScheduleJobOptions(
		scheduleJobs,
		project,
		actrec
	);

	return (
		<div>
			{jobType == MIDDAY_STOP_TYPE.PROJECT && (
				<>
					<FormField
						control={formContext.control}
						name="project"
						render={({ field }) => (
							<FormItem className="mt-3">
								<FormControl className="space-y-1">
									<SelectField
										placeholder={tEmployee.selectProject}
										label={tEmployee.projectRequired}
										required
										options={projectOptions || []}
										value={field.value || ""}
										onValueChange={(value) => {
											formContext.reset({
												bcewSchlinExtendedId: null,
												bcewSchlinIdnum: null,
												bcewSrvinvIdnum: null,
												qcType: null,
												specialJobId: null,
												actrec: undefined,
												project: value,
												stopNumber: stopNumber,
											});
										}}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={formContext.control}
						name="actrec"
						render={({ field }) => (
							<FormItem className="mt-3">
								<FormControl className="space-y-1">
									<SelectField
										placeholder={tEmployee.selectJob}
										label={tEmployee.jobRequired}
										required
										options={jobOptions || []}
										value={field.value || ""}
										onValueChange={(value) => {
											formContext.reset({
												bcewSchlinExtendedId: null,
												bcewSchlinIdnum: null,
												bcewSrvinvIdnum: null,
												qcType: null,
												specialJobId: null,
												actrec: Number(value),
												stopNumber: stopNumber,
												project: project,
											});
										}}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={formContext.control}
						name="bcewSchlinIdnum"
						render={() => {
							let value = bcewSchlinIdnum || "";

							if (qcType) {
								const selectedQc = taskOptions.find(
									(option) => option.bcewSchlinExtendedId === bcewSchlinExtendedId && option?.qcType === qcType
								);
								value = selectedQc?.value || "";
							}

							return (
								<FormItem className="mt-3">
									<FormControl className="space-y-1">
										<SelectField
											placeholder={tEmployee.selectPhase}
											label={tEmployee.phaseRequired}
											required
											options={taskOptions}
											value={value}
											onValueChange={(_, option) => {
												if (!option) return;

												if (option.bcewSchlinIdnum) {
													formContext.setValue("bcewSchlinIdnum", option.bcewSchlinIdnum);
													formContext.setValue("bcewSchlinExtendedId", null);
													formContext.setValue("qcType", null);
												} else {
													formContext.setValue("bcewSchlinExtendedId", option.bcewSchlinExtendedId);
													formContext.setValue("bcewSchlinIdnum", null);
													if (option.qcType) {
														formContext.setValue("qcType", option.qcType);
													}
												}
											}}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							);
						}}
					/>
				</>
			)}

			{jobType == MIDDAY_STOP_TYPE.WORK_ORDER && (
				<FormField
					control={formContext.control}
					name="bcewSrvinvIdnum"
					render={({ field }) => (
						<FormItem className="mt-3">
							<FormControl className="space-y-1">
								<SelectField
									placeholder={tEmployee.selectWorkOrder}
									label={tEmployee.workOrder}
									options={workOrderOptions}
									value={field.value || ""}
									onValueChange={(value) => field.onChange(value)}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
			)}
		</div>
	);
};

export default SelectJob;
