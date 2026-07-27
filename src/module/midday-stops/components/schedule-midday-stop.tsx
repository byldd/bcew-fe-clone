import React from "react";
import { useFormContext } from "react-hook-form";

import { IWeekScheduleResponse } from "@/module/schedule-management/weekly-schedule-management/types/schedule-interface";

import { SelectField } from "@/components/ui/selectField";
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";

import { IAddNewMiddayJobFormSchema } from "../utils/midday-stop-form";
import { MIDDAY_STOP_TYPE } from "../utils/enums";
import { Label } from "@/components/ui/label";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useScheduleJobOptions } from "../hooks/useScheduleJobOptions";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";

const SelectMiddayStop = ({ scheduleJobs }: { scheduleJobs: IWeekScheduleResponse | undefined }) => {
	const tEmployee = useTypedTranslations(NAMESPACE.EMPLOYEE);

	const formContext = useFormContext<IAddNewMiddayJobFormSchema>();

	const { stopType, project, actrec, bcewSchlinExtendedId, bcewSchlinIdnum, qcType, stopNumber } = formContext.watch();

	const { projectOptions, jobOptions, taskOptions, workOrderOptions, specialJobOptions } = useScheduleJobOptions(
		scheduleJobs,
		project,
		actrec
	);

	return (
		<div className="flex flex-col overflow-y-auto px-1">
			<FormField
				control={formContext.control}
				name="stopType"
				render={({ field }) => (
					<FormItem>
						<Label className="font-inter text-sm font-normal text-brand-grey">{tEmployee.selectJobType}</Label>
						<div>
							<RadioGroup
								value={field.value}
								onValueChange={(val) => {
									formContext.reset({
										stopType: val as MIDDAY_STOP_TYPE,
										project: undefined,
										actrec: undefined,
										bcewSchlinExtendedId: null,
										bcewSchlinIdnum: null,
										bcewSrvinvIdnum: null,
										qcType: null,
										specialJobId: null,
										stopNumber,
									});
								}}
								className="flex gap-6"
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
						</div>
					</FormItem>
				)}
			/>

			{stopType === MIDDAY_STOP_TYPE.SPECIAL_JOB && (
				<FormField
					control={formContext.control}
					name="specialJobId"
					render={({ field }) => (
						<FormItem className="mt-3">
							<FormControl>
								<SelectField
									label={tEmployee.specialJob}
									placeholder={tEmployee.selectJob}
									options={specialJobOptions}
									value={field.value || ""}
									onValueChange={(value, option) => {
										field.onChange(value);
										formContext.setValue("project", option?.label || "");
									}}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
			)}

			{stopType === MIDDAY_STOP_TYPE.PROJECT && (
				<>
					<FormField
						control={formContext.control}
						name="project"
						render={({ field }) => (
							<FormItem className="mt-3">
								<FormControl>
									<SelectField
										label={tEmployee.projectRequired}
										required
										placeholder={tEmployee.selectProject}
										options={projectOptions ?? []}
										value={field.value || ""}
										onValueChange={(value) =>
											formContext.reset({
												project: value,
												actrec: undefined,
												bcewSchlinExtendedId: null,
												bcewSchlinIdnum: null,
												bcewSrvinvIdnum: null,
												qcType: null,
												specialJobId: null,
												stopType: MIDDAY_STOP_TYPE.PROJECT,
												stopNumber,
											})
										}
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
								<FormControl>
									<SelectField
										label={tEmployee.jobRequired}
										required
										placeholder={tEmployee.selectJob}
										options={jobOptions}
										value={field.value || ""}
										onValueChange={(value) =>
											formContext.reset({
												project,
												actrec: Number(value),
												bcewSchlinExtendedId: null,
												bcewSchlinIdnum: null,
												bcewSrvinvIdnum: null,
												qcType: null,
												specialJobId: null,
												stopType: MIDDAY_STOP_TYPE.PROJECT,
												stopNumber,
											})
										}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={formContext.control}
						name="qcType"
						render={({ field }) => (
							<FormItem className="mt-3">
								<FormControl>
									<SelectField
										label={tEmployee.phaseRequired}
										required
										placeholder={tEmployee.selectPhase}
										options={taskOptions}
										value={
											qcType
												? taskOptions.find(
														(o) => o.bcewSchlinExtendedId === bcewSchlinExtendedId && o.qcType === qcType
													)?.value || ""
												: bcewSchlinIdnum || ""
										}
										onValueChange={(_, option) => {
											if (!option) return;

											if (option.bcewSchlinIdnum) {
												formContext.setValue("bcewSchlinIdnum", option.bcewSchlinIdnum);
												formContext.setValue("bcewSchlinExtendedId", null);
												formContext.setValue("qcType", null);
												field.onChange(null);
											} else if (option.qcType) {
												formContext.setValue("bcewSchlinExtendedId", option.bcewSchlinExtendedId);
												formContext.setValue("bcewSchlinIdnum", null);
												formContext.setValue("qcType", option.qcType);
												field.onChange(option.qcType);
											}
										}}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</>
			)}

			{stopType === MIDDAY_STOP_TYPE.WORK_ORDER && (
				<FormField
					control={formContext.control}
					name="bcewSrvinvIdnum"
					render={({ field }) => (
						<FormItem className="mt-3">
							<FormControl>
								<SelectField
									label={tEmployee.workOrder}
									placeholder={tEmployee.selectWorkOrder}
									options={workOrderOptions}
									value={field.value || ""}
									onValueChange={(value, option) => {
										field.onChange(value);
										formContext.setValue("project", `${option?.label || ""}`);
									}}
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

export default SelectMiddayStop;
