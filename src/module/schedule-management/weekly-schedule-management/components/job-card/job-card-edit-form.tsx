import React, { useMemo } from "react";
import { JobCardFormProps } from "@/module/schedule-management/weekly-schedule-management/types/schedule-interface";
import { statusIcons } from "@/module/employee-dashboard/constants/job-status-icons";
import { JobStatus } from "@/module/employee-dashboard/types";
import { AppTooltip } from "@/components/ui/tooltip";
import { legendItems } from "@/module/employee-dashboard/constants/legend-items";
import { IoMdCheckmark } from "react-icons/io";
import { AiOutlineClose } from "react-icons/ai";
import { openErrorToast, openSuccessToast } from "@/components/toast";
import { toMidnightDateString } from "@/lib/utils/date";
import { createDailyJobFromCardFormSchema, ICreateDailyJobFromCardFormSchema } from "../../utils/create-daily-job-form";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUpdateDailyJob } from "@/module/schedule-management/weekly-schedule-management/hooks/useSchedule";
import { Form } from "@/components/ui/form";
import CardEmployeeField from "./card-employee-field";
import { cn } from "@/lib/utils/utils";
import { FORM_MODE } from "@/types";
import JobLabelField from "../job-label-field";
import { Plus } from "lucide-react";
import { useHandleJobOperation } from "../../hooks/useHandleJobOperation";
import { sortJobEmployee } from "../../utils/job-card";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";

const JobCardEditForm = ({ dailyJob, date, bcewJob, setIsEditing, specialJob, rowType }: JobCardFormProps) => {
	const { mutate: updateDailyJobMutation, isPending: isUpdatingDailyJob } = useUpdateDailyJob();
	const queryClient = useQueryClient();
	const tjobCards = useTypedTranslations(NAMESPACE.JOB_CARDS);

	const { onUpdateDailyJob } = useHandleJobOperation();

	const defaultValues = useMemo(() => {
		return {
			date: date,
			labelIds: dailyJob?.jobLabelAssignments?.map((label) => label.labelId) || [],
			jobEmployeeAssignments:
				sortJobEmployee({
					jobEmployees: dailyJob?.jobEmployeeAssignments || [],
					crewLeaderId: dailyJob?.crewLeaderId,
					taskLeaderId: dailyJob?.taskLeaderId,
				})?.map((jobEmployee) => ({
					employeeId: jobEmployee.employeeId,
					stopNumber: jobEmployee.stopNumber,
					employeeName: jobEmployee.employee?.user?.name,
					id: jobEmployee.id,
					overrideStartTime: jobEmployee.overrideStartTime || undefined,
					overrideEndTime: jobEmployee.overrideEndTime || undefined,
				})) || [],
			crewLeaderId: dailyJob?.crewLeaderId,
			taskLeaderId: dailyJob?.taskLeaderId,
			subcontractorId: dailyJob?.subcontractorId,
			specialJobId: specialJob?.id,
		};
	}, [dailyJob, date, specialJob]);

	const form = useForm<ICreateDailyJobFromCardFormSchema>({
		resolver: zodResolver(createDailyJobFromCardFormSchema),
		defaultValues,
	});

	const { labelIds } = form.watch();

	const handleSubmit = (data: ICreateDailyJobFromCardFormSchema) => {
		if (!dailyJob?.id) return;
		const crewLeaderId = data.crewLeaderId || data.jobEmployeeAssignments?.[0]?.employeeId;

		updateDailyJobMutation(
			{
				id: dailyJob?.id,
				payload: {
					jobEmployeeAssignments:
						data.jobEmployeeAssignments?.map((assignment) => ({
							employeeId: assignment.employeeId,
							stopNumber: assignment.stopNumber,
							startTime: "",
							endTime: "",
							id: assignment.id,
							overrideStartTime: assignment.overrideStartTime || undefined,
							overrideEndTime: assignment.overrideEndTime || undefined,
						})) || [],
					date: toMidnightDateString(data.date),
					schlinId: bcewJob?.schlin?.idnum,
					srvinvId: bcewJob?.srvinv?.idnum,
					taskLeaderId: specialJob ? undefined : crewLeaderId,
					crewLeaderId: specialJob ? undefined : crewLeaderId,
					labelIds: data.labelIds,
					subcontractorId: data.subcontractorId,
				},
			},
			{
				onSuccess: (data) => {
					openSuccessToast(tjobCards.dailyJobUpdatedSuccessfully);
					queryClient.invalidateQueries({ queryKey: ["week-schedule"] });
					setIsEditing(false);
					form.reset();
					onUpdateDailyJob({
						updatedJob: data,
						dailyJobId: dailyJob.id,
					});
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
				<div className={cn("flex items-center gap-2", isUpdatingDailyJob && "cursor-not-allowed text-brand-dark30")}>
					<IoMdCheckmark
						onClick={(e) => {
							e.stopPropagation();
							handleSubmit(form.getValues());
						}}
						className="h-4 w-4 cursor-pointer"
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
						<div className="flex items-center justify-end gap-1">
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
									<Plus className="h-4 w-4 cursor-pointer text-brand-dark30" />
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

export default JobCardEditForm;
