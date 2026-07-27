import React from "react";
import { useForm } from "react-hook-form";
import { IQcRepairJobFormSchema, qcRepairJobFormSchema } from "../../utils/qc-job-form-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { IQCRepairCardFormProps } from "../../types/qc-job";
import { useCreateQcJob, useUpdateQcRepairJob } from "../../hooks/useSchedule";
import { openErrorToast, openSuccessToast } from "@/components/toast";
import { FORM_MODE } from "@/types";
import { Form } from "@/components/ui/form";
import { AppTooltip } from "@/components/ui/tooltip";
import { legendItems, legends } from "@/module/employee-dashboard/constants/legend-items";
import { GoDotFill } from "react-icons/go";
import JobLabelField from "../job-label-field";
import { cn } from "@/lib/utils/utils";
import { IoMdCheckmark } from "react-icons/io";
import { AiOutlineClose } from "react-icons/ai";
import CardEmployeeField from "../job-card/card-employee-field";
import { statusIcons } from "@/module/employee-dashboard/constants/job-status-icons";
import { JobStatus } from "@/module/employee-dashboard/types";
import { toMidnightDateString } from "@/lib/utils/date";
import { QC_JOB_TYPE } from "../../types/schedule-interface";
import { useQueryClient } from "@tanstack/react-query";
import { useHandleJobOperation } from "../../hooks/useHandleJobOperation";

const QCRepairCardForm = ({ bcewJob, rowType, date, setIsEditing, ...props }: IQCRepairCardFormProps) => {
	const { mutate: createQcJobMutation, isPending: isCreateQcJob } = useCreateQcJob();
	const { mutate: updateQcJobMutation, isPending: isUpdateQcJob } = useUpdateQcRepairJob();

	const { onUpdateDailyJob, onCreateDailyJob } = useHandleJobOperation();
	const queryClient = useQueryClient();

	const defaultLabelIds =
		props.mode === FORM_MODE.EDIT
			? props.dailyJobWithEmployee.jobLabelAssignments?.map((label) => label.labelId)
			: [...(props.isTodayToBeStarted ? [legends.qcJob, legends.newStart] : [legends.qcJob])];

	const form = useForm<IQcRepairJobFormSchema>({
		resolver: zodResolver(qcRepairJobFormSchema),
		defaultValues: {
			date: date,
			labelIds: defaultLabelIds,
			jobEmployeeAssignments:
				props.mode === FORM_MODE.EDIT
					? props.dailyJobWithEmployee.jobEmployeeAssignments.map((assignment) => {
							return {
								employeeId: assignment.employeeId,
								stopNumber: Number(assignment.stopNumber),
								hours: Number(assignment.hours),
								employeeName: assignment.employee?.user?.name,
								id: assignment.id,
								overrideStartTime: assignment.overrideStartTime || undefined,
								overrideEndTime: assignment.overrideEndTime || undefined,
							};
						})
					: [],
		},
	});
	const { labelIds } = form.watch();

	const onSubmit = (data: IQcRepairJobFormSchema) => {
		if (!bcewJob?.schlinExtended) return;

		const payload = {
			date: toMidnightDateString(data.date),
			labelIds: data.labelIds,
			subcontractorId: data.subcontractorId,
			qcJobType: QC_JOB_TYPE.REPAIR,
			bcewSchlinExtendedId: bcewJob?.schlinExtended?.id,
			jobEmployeeAssignments:
				data.jobEmployeeAssignments?.map((assignment) => {
					return {
						employeeId: assignment.employeeId,
						stopNumber: assignment.stopNumber || undefined,
						hours: assignment.hours || undefined,
						id: assignment.id,
						overrideStartTime: assignment.overrideStartTime || undefined,
						overrideEndTime: assignment.overrideEndTime || undefined,
					};
				}) || [],
		};

		if (props.mode === FORM_MODE.EDIT && props?.dailyJobWithEmployee.id) {
			updateQcJobMutation(
				{
					id: props?.dailyJobWithEmployee.id,
					payload,
				},
				{
					onSuccess: async (data) => {
						openSuccessToast("QC Repair updated successfully.");
						void queryClient.invalidateQueries({ queryKey: ["week-schedule"] });
						onUpdateDailyJob({
							updatedJob: data,
							dailyJobId: props.dailyJobWithEmployee.id,
						});
						form.reset();
						setIsEditing(false);
					},
					onError: (error) => {
						openErrorToast({ error });
					},
				}
			);
			return;
		} else {
			createQcJobMutation(payload, {
				onSuccess: async (data) => {
					openSuccessToast("QC Repair created successfully.");
					void queryClient.invalidateQueries({ queryKey: ["week-schedule"] });
					setIsEditing(false);
					form.reset();
					onCreateDailyJob(data);
				},
				onError: (error) => {
					openErrorToast({ error });
				},
			});
		}
	};

	return (
		<>
			<div className="flex w-full items-center justify-between p-0">
				<div
					className={cn(
						"flex items-center gap-2 text-brand-dark80",
						(isCreateQcJob || isUpdateQcJob) && "cursor-not-allowed text-brand-dark30"
					)}
				>
					<IoMdCheckmark
						onClick={(e) => {
							if (isCreateQcJob) return;
							e.stopPropagation();
							onSubmit(form.getValues());
						}}
						className={cn("h-4 w-4 cursor-pointer", (isCreateQcJob || isUpdateQcJob) && "cursor-not-allowed")}
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
				<CardEmployeeField rowType={rowType} date={date} bcewJob={bcewJob} />
			</Form>
		</>
	);
};

export default QCRepairCardForm;
