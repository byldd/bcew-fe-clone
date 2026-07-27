import React, { useEffect } from "react";
import CardEmployeeField from "@/module/schedule-management/weekly-schedule-management/components/job-card/card-employee-field";
import { Form } from "@/components/ui/form";

import { IoMdCheckmark } from "react-icons/io";
import { AiOutlineClose } from "react-icons/ai";
import { cn } from "@/lib/utils/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createDailyJobFromCardFormSchema, ICreateDailyJobFromCardFormSchema } from "../../utils/create-daily-job-form";
import { FORM_MODE } from "@/types";
import JobLabelField from "../job-label-field";
import { GoDotFill } from "react-icons/go";
import { useCreateDailyJob } from "@/module/schedule-management/weekly-schedule-management/hooks/useSchedule";

import { toMidnightDateString } from "@/lib/utils/date";
import { openErrorToast, openSuccessToast } from "@/components/toast";
import { useQueryClient } from "@tanstack/react-query";
import { statusIcons } from "@/module/employee-dashboard/constants/job-status-icons";
import { AppTooltip } from "@/components/ui/tooltip";
import { JobStatus } from "@/module/employee-dashboard/types";
import { legendItems } from "@/module/employee-dashboard/constants/legend-items";
import { INoScheduleFormProps } from "../../types/card-props";
import { useHandleJobOperation } from "../../hooks/useHandleJobOperation";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";

const NoScheduleForm = ({ date, setIsEditing, bcewJob, specialJob, rowType }: INoScheduleFormProps) => {
	const form = useForm<ICreateDailyJobFromCardFormSchema>({
		resolver: zodResolver(createDailyJobFromCardFormSchema),
	});

	useEffect(() => {
		form.reset({
			date: date,
			jobEmployeeAssignments: [],
			specialJobId: specialJob?.id,
		});
	}, [specialJob, date, form]);

	const { onCreateDailyJob } = useHandleJobOperation();

	const { labelIds } = form.watch();
	const tschedule = useTypedTranslations(NAMESPACE.SCHEDULE);

	const queryClient = useQueryClient();

	const { mutate: createDailyJobMutation, isPending: isCreatingDailyJob } = useCreateDailyJob();

	const onSubmit = (data: ICreateDailyJobFromCardFormSchema) => {
		if (!data.jobEmployeeAssignments?.length && !data.subcontractorId) return;

		const crewLeaderId = data.crewLeaderId || data.jobEmployeeAssignments?.[0]?.employeeId;
		createDailyJobMutation(
			{
				schlinId: bcewJob?.schlin?.idnum,
				srvinvId: bcewJob?.srvinv?.idnum,
				specialJobId: specialJob?.id,
				date: toMidnightDateString(data.date),
				crewLeaderId: crewLeaderId,
				taskLeaderId: crewLeaderId,
				jobEmployeeAssignments:
					data?.jobEmployeeAssignments?.map((assignment) => {
						return {
							employeeId: assignment.employeeId,
							stopNumber: assignment.stopNumber ?? undefined,
						};
					}) || [],
				labelIds: data.labelIds,
				subcontractorId: data.subcontractorId,
			},
			{
				onSuccess: async (data) => {
					openSuccessToast(tschedule.dailyJobCreatedSuccessfully);
					void queryClient.invalidateQueries({ queryKey: ["week-schedule"] });
					setIsEditing(false);

					form.reset();
					onCreateDailyJob(data);
				},
				onError: (error) => {
					openErrorToast({ error });
				},
			}
		);
	};
	return (
		<>
			<div className="flex w-full items-center justify-between p-0">
				<div
					className={cn(
						"flex items-center gap-2 text-brand-dark80",
						isCreatingDailyJob && "cursor-not-allowed text-brand-dark30"
					)}
				>
					<IoMdCheckmark
						onClick={(e) => {
							if (isCreatingDailyJob) return;
							e.stopPropagation();
							onSubmit(form.getValues());
						}}
						className={cn("h-4 w-4 cursor-pointer", isCreatingDailyJob && "cursor-not-allowed")}
					/>
					<AiOutlineClose
						onClick={(e) => {
							e.stopPropagation();
							setIsEditing(false);
							form.reset();
						}}
						className="h-4 w-4 cursor-pointer"
					/>
				</div>

				<JobLabelField
					onChange={(value) => form.setValue("labelIds", value)}
					value={labelIds || []}
					mode={FORM_MODE.EDIT}
					trigger={
						<div className="flex items-center justify-between gap-2">
							{labelIds?.length ? (
								<>
									{labelIds?.map((labelId) => {
										const Icon = statusIcons[labelId as JobStatus];
										const legend = legendItems.find((item) => item.status === labelId);
										const tooltipText = legend?.description ?? legend?.label ?? "";
										return (
											<AppTooltip
												key={labelId}
												text={tooltipText}
												trigger={
													<div key={labelId} className="flex items-center gap-1">
														{Icon}
													</div>
												}
											/>
										);
									})}
								</>
							) : (
								<>
									<GoDotFill className="h-4 w-4 cursor-pointer text-brand-dark30" />
								</>
							)}
						</div>
					}
				/>
			</div>
			<Form {...form}>
				<CardEmployeeField specialJob={specialJob} rowType={rowType} date={date} bcewJob={bcewJob} />
			</Form>
		</>
	);
};

export default NoScheduleForm;
