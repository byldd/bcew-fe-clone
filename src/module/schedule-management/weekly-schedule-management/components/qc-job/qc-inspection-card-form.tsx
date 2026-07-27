import React from "react";
import { useCreateQcJob, useUpdateQcInspectionJob } from "../../hooks/useSchedule";
import { useQueryClient } from "@tanstack/react-query";
import { IQCInspectionCardFormProps } from "../../types/qc-job";
import { FORM_MODE } from "@/types";
import { legendItems, legends } from "@/module/employee-dashboard/constants/legend-items";
import { IQcInspectionJobFormSchema, qcInspectionJobFormSchema } from "../../utils/qc-job-form-schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { IoMdCheckmark } from "react-icons/io";
import { AiOutlineClose } from "react-icons/ai";
import { cn } from "@/lib/utils/utils";
import JobLabelField from "../job-label-field";
import { statusIcons } from "@/module/employee-dashboard/constants/job-status-icons";
import { AppTooltip } from "@/components/ui/tooltip";
import { GoDotFill } from "react-icons/go";
import { JobStatus } from "@/module/employee-dashboard/types";
import ForemanDropdown from "./foreman-dropdown";
import { Form } from "@/components/ui/form";
import { Trash2 } from "lucide-react";
import { QC_JOB_TYPE } from "../../types/schedule-interface";
import { openErrorToast, openSuccessToast } from "@/components/toast";
import { toMidnightDateString } from "@/lib/utils/date";
import StopNumberInput from "@/components/ui/stop-number-input";
import { useHandleJobOperation } from "../../hooks/useHandleJobOperation";

const QcInspectionCardForm = ({ bcewJob, date, setIsEditing, ...props }: IQCInspectionCardFormProps) => {
	const { mutate: createQcJobMutation, isPending: isCreateQcJob } = useCreateQcJob();
	const { mutate: updateQcJobMutation, isPending: isUpdateQcJob } = useUpdateQcInspectionJob();
	const queryClient = useQueryClient();
	const { onUpdateDailyJob, onCreateDailyJob } = useHandleJobOperation();
	const defaultLabelIds =
		props.mode === FORM_MODE.EDIT
			? props.dailyJobWithEmployee.jobLabelAssignments?.map((label) => label.labelId)
			: [...(props.isTodayToBeStarted ? [legends.qcJob, legends.newStart] : [legends.qcJob])];

	const form = useForm<IQcInspectionJobFormSchema>({
		resolver: zodResolver(qcInspectionJobFormSchema),
		defaultValues: {
			date: date,
			labelIds: defaultLabelIds,
			jobEmployeeAssignments:
				props.mode === FORM_MODE.EDIT
					? props.dailyJobWithEmployee.jobEmployeeAssignments.map((assignment) => {
							return {
								employeeId: assignment.employeeId,
								stopNumber: assignment.stopNumber,
								employeeName: assignment.employee?.user?.name,
								overrideStartTime: assignment.overrideStartTime || undefined,
								overrideEndTime: assignment.overrideEndTime || undefined,
								id: assignment.id,
							};
						})
					: [],
		},
	});

	const { labelIds, jobEmployeeAssignments } = form.watch();

	const onSubmit = (data: IQcInspectionJobFormSchema) => {
		if (!bcewJob?.schlinExtended) return;
		const payload = {
			date: toMidnightDateString(data.date),
			qcJobType: QC_JOB_TYPE.INSPECTION,
			bcewSchlinExtendedId: bcewJob.schlinExtended.id,
			labelIds: data.labelIds,
			jobEmployeeAssignments:
				data.jobEmployeeAssignments?.map((assignment) => {
					return {
						employeeId: assignment.employeeId,
						stopNumber: assignment.stopNumber,
						overrideStartTime: assignment.overrideStartTime || undefined,
						overrideEndTime: assignment.overrideEndTime || undefined,
						id: assignment.id,
					};
				}) || [],
		};

		if (props.mode === FORM_MODE.EDIT && props.dailyJobWithEmployee?.id) {
			updateQcJobMutation(
				{
					id: props.dailyJobWithEmployee?.id,
					payload,
				},
				{
					onSuccess: async (data) => {
						openSuccessToast("QC Inspection Job updated successfully.");
						void queryClient.invalidateQueries({ queryKey: ["week-schedule"] });
						onUpdateDailyJob({
							updatedJob: data,
							dailyJobId: props.dailyJobWithEmployee.id,
						});
						setIsEditing(false);
						form.reset();
					},
					onError: (error) => {
						openErrorToast({ error });
					},
				}
			);
			return;
		}

		createQcJobMutation(payload, {
			onSuccess: async (data) => {
				openSuccessToast("QC Inspection Job created successfully.");
				void queryClient.invalidateQueries({ queryKey: ["week-schedule"] });
				onCreateDailyJob(data);
				setIsEditing(false);
				form.reset();
			},
			onError: (error) => {
				openErrorToast({ error });
			},
		});
	};

	const onSelectStopNumber = (stopNumber: number | null, index: number) => {
		const assignment = jobEmployeeAssignments?.[index];
		if (!assignment) return;
		form.setValue(`jobEmployeeAssignments.${index}.stopNumber`, stopNumber);
	};

	const onRemoveEmployee = (index: number) => {
		form.setValue("jobEmployeeAssignments", jobEmployeeAssignments?.filter((_, i) => i !== index) || []);
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
				<div className="mt-2 w-full">
					<div>
						{jobEmployeeAssignments?.map((assignment, index) => (
							<div key={`${assignment.employeeId}-${index}`} className="flex justify-between">
								<p className="text-xs">{assignment.employeeName}</p>
								<div className="flex items-center gap-2">
									<StopNumberInput
										value={assignment.stopNumber ?? undefined}
										onChange={(stopNumber) => onSelectStopNumber(stopNumber, index)}
									/>
									<Trash2
										size={16}
										className="cursor-pointer text-brand-dark50"
										onClick={() => onRemoveEmployee(index)}
									/>
								</div>
							</div>
						))}
					</div>
					<div className="flex w-full flex-col">
						<ForemanDropdown />
					</div>
				</div>
			</Form>
		</>
	);
};

export default QcInspectionCardForm;
