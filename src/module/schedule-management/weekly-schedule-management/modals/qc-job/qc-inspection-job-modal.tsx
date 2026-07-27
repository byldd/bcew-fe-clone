import React, { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
	useCreateQcJob,
	useGetDailyJob,
	useUpdateQcInspectionJob,
} from "@/module/schedule-management/weekly-schedule-management/hooks/useSchedule";
import { openErrorToast, openSuccessToast } from "@/components/toast";
import { QC_JOB_TYPE } from "@/module/schedule-management/weekly-schedule-management/types/schedule-interface";
import { useQueryClient } from "@tanstack/react-query";
import { dateToUTCString, getTodayDate, toMidnightDateString } from "@/lib/utils/date";
import { JOB_PHASE_LABEL } from "@/module/schedule-management/weekly-schedule-management/constants/week-schedule";
import JobLabelField from "@/module/schedule-management/weekly-schedule-management/components/job-label-field";
import { InputField } from "@/components/ui/inputField";
import { legends } from "@/module/employee-dashboard/constants/legend-items";
import QCInspectionJobMembersField from "./qc-inspection-members-field";
import { FORM_MODE } from "@/types";
import { IQcInspectionJobModalProps } from "../../types/qc-job";
import { Spinner } from "@/components/ui/spinner";
import { DatePicker } from "@/components/ui/date-picker";
import { IQcInspectionJobFormSchema, qcInspectionJobFormSchema } from "../../utils/qc-job-form-schema";
import JobUpdatesField from "../../components/job-updates-field";
import { isBoolean } from "@/module/job/utils";
import DeleteJobModal from "../delete-job-modal";
import { SendJobAlertModal } from "../send-job-alert-modal";
import { useModal } from "@/hooks/useModal";
import SendJobAlertButton from "../../components/send-job-alert-button";
import { useHandleJobOperation } from "../../hooks/useHandleJobOperation";
import { useScheduleContext } from "../../context/schedule-context";

export const QcInspectionJobModal = ({ closeModal, ...props }: IQcInspectionJobModalProps) => {
	const { data: { dailyJob, bcewJob: fetchedBcewJob } = {}, isFetching: isLoadingDailyJob } = useGetDailyJob(
		props.mode === FORM_MODE.EDIT ? props.dailyJobId : "",
		props.mode === FORM_MODE.EDIT
	);
	const { mutate: createQcJobMutation, isPending: isCreateQcJobPending } = useCreateQcJob();
	const { mutate: updateQcJobMutation, isPending: isUpdateQcJobPending } = useUpdateQcInspectionJob();
	const { openModal, closeModal: closeDeleteModal, Modal } = useModal();
	const { onUpdateDailyJob, onCreateDailyJob } = useHandleJobOperation();
	const { isAllowedToModifyPastDates } = useScheduleContext();
	const bcewJob = props.mode === FORM_MODE.EDIT ? fetchedBcewJob : props.bcewJob;

	const readOnly =
		props.mode === FORM_MODE.EDIT &&
		dailyJob?.date &&
		new Date(dailyJob?.date) < getTodayDate() &&
		!isAllowedToModifyPastDates;

	const defaultLabelIds =
		props.mode === FORM_MODE.EDIT
			? [] //when it is in edit we assign label in useEffect
			: [...(props.isTodayToBeStarted ? [legends.qcJob, legends.newStart] : [legends.qcJob])];

	const queryClient = useQueryClient();

	const actrec = bcewJob?.schlin?.actrec || bcewJob?.srvinv?.actrec || bcewJob?.schlinExtended?.actrec;

	const form = useForm<IQcInspectionJobFormSchema>({
		resolver: zodResolver(qcInspectionJobFormSchema),
		defaultValues: {
			jobName: actrec?.jobnme,
			date: props.mode === FORM_MODE.CREATE ? new Date(props.date) : undefined,
			labelIds: defaultLabelIds,
		},
	});

	const { labelIds } = form.watch();

	const isSubcontractorJob = useMemo(() => {
		return labelIds?.includes(legends.subContractorJob);
	}, [labelIds]);

	useEffect(() => {
		if (props.mode === FORM_MODE.EDIT) {
			form.reset({
				jobName: actrec?.jobnme,
				date: dailyJob?.date ? new Date(dailyJob?.date) : undefined,
				labelIds: dailyJob?.jobLabelAssignments?.map((label) => label.labelId),
				jobEmployeeAssignments: dailyJob?.jobEmployeeAssignments.map((assignment) => {
					return {
						id: assignment.id,
						employeeId: assignment.employeeId,
						stopNumber: assignment.stopNumber ? Number(assignment.stopNumber) : undefined,
						hours: assignment.hours ? Number(assignment.hours) : undefined,
						overrideStartTime: assignment.overrideStartTime ? dateToUTCString(assignment.overrideStartTime) : undefined,
						overrideEndTime: assignment.overrideEndTime ? dateToUTCString(assignment.overrideEndTime) : undefined,
						employeeName: assignment.employee?.user?.name,
					};
				}),
				forecastTime: dailyJob?.forecastTime || undefined,
				isJobFinishToday: isBoolean(dailyJob?.isJobFinishToday) ? !!dailyJob?.isJobFinishToday : undefined,
				isJobFinishTomorrow: isBoolean(dailyJob?.isJobFinishTomorrow) ? !!dailyJob?.isJobFinishTomorrow : undefined,
			});
		}
	}, [dailyJob, props.mode, form, actrec]);

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
						id: assignment.id,
						employeeId: assignment.employeeId,
						stopNumber: assignment.stopNumber,
						overrideStartTime: assignment.overrideStartTime ? dateToUTCString(assignment.overrideStartTime) : undefined,
						overrideEndTime: assignment.overrideEndTime ? dateToUTCString(assignment.overrideEndTime) : undefined,
					};
				}) || [],
		};

		if (props.mode === FORM_MODE.EDIT && dailyJob?.id) {
			updateQcJobMutation(
				{
					id: dailyJob.id,
					payload: {
						...payload,
						forecastTime: data.forecastTime || undefined,
						isJobFinishToday: isBoolean(data.isJobFinishToday) ? !!data.isJobFinishToday : undefined,
						isJobFinishTomorrow: isBoolean(data.isJobFinishTomorrow) ? !!data.isJobFinishTomorrow : undefined,
					},
				},
				{
					onSuccess: async (data) => {
						openSuccessToast("QC Inspection Job updated successfully.");
						void queryClient.invalidateQueries({ queryKey: ["week-schedule"] });
						closeModal();
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
			return;
		}

		createQcJobMutation(payload, {
			onSuccess: async (data) => {
				openSuccessToast("QC Inspection Job created successfully.");
				void queryClient.invalidateQueries({ queryKey: ["week-schedule"] });
				closeModal();
				onCreateDailyJob(data);
			},
			onError: (error) => {
				openErrorToast({ error });
			},
		});
	};

	const onDeleteClick = () => {
		if (!dailyJob || !fetchedBcewJob) return;
		openModal({
			modalView: <DeleteJobModal dailyJobId={dailyJob.id} onClose={closeDeleteModal} onDeleteSuccess={closeModal} />,
			modalTitle: (
				<p>
					Delete Job {fetchedBcewJob?.schlinExtended?.actrec?.jobnme} (
					{JOB_PHASE_LABEL[fetchedBcewJob?.schlinExtended?.tsknum as keyof typeof JOB_PHASE_LABEL]} QC Inspection)
				</p>
			),
			variant: "medium",
		});
	};

	const onSendAlerts = () => {
		if (!dailyJob?.id) return;
		openModal({
			modalView: <SendJobAlertModal onClose={closeModal} dailyJobId={dailyJob?.id} />,
			modalTitle: "Send Alerts",
		});
	};

	if (isLoadingDailyJob) return <Spinner />;

	if (props.mode === FORM_MODE.EDIT && !dailyJob) {
		return <div>Job not found</div>;
	}

	return (
		<div className="p-1">
			<Modal />
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)}>
					<div className="mb-4 flex justify-between gap-4">
						<FormField
							control={form.control}
							name="jobName"
							render={({ field }) => (
								<FormItem className="w-full">
									<FormControl>
										<InputField label="Job Name" disabled {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<div className="w-full">
							<InputField
								label="Phase"
								disabled
								placeholder="Job Phase"
								value={bcewJob?.schlinExtended?.tsknum ? JOB_PHASE_LABEL[bcewJob?.schlinExtended?.tsknum] : ""}
							/>
						</div>
					</div>

					<div className="flex justify-between gap-4">
						<FormField
							control={form.control}
							name="date"
							render={({ field }) => (
								<FormItem className="w-full">
									<FormLabel className="!mb-2 !text-xs !font-normal !text-brand-grey md:!text-sm">Date</FormLabel>
									<FormControl>
										<DatePicker
											onChange={(date) => {
												field.onChange(date);
											}}
											value={field.value ? new Date(field.value) : undefined}
											placeholder="Select Date"
											disabled={readOnly}
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
										<FormLabel className="!mb-2 !text-xs !font-normal !text-brand-grey md:!text-sm">Status</FormLabel>

										<FormControl>
											<JobLabelField onChange={field.onChange} value={field.value || []} disabled />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
					</div>

					<div className="my-4">
						<QCInspectionJobMembersField mode={props.mode} readOnly={readOnly} />
					</div>

					{props.mode === FORM_MODE.EDIT && (
						<JobUpdatesField isSubcontractorJob={!!isSubcontractorJob} readOnly={readOnly} />
					)}

					{!readOnly && (
						<div className="mt-4 flex w-full flex-col items-center justify-between gap-2">
							{props.mode === FORM_MODE.EDIT && (
								<Button
									key="delete-job-button"
									type="button"
									variant="ghost"
									className="w-full text-red-500"
									onClick={onDeleteClick}
								>
									Delete Job
								</Button>
							)}
							<div className="flex w-full items-center gap-2">
								{props.mode === FORM_MODE.EDIT && (
									<SendJobAlertButton
										onSendAlerts={onSendAlerts}
										isPending={isUpdateQcJobPending}
										isPublish={!!dailyJob?.isPublished}
									/>
								)}
								<Button
									className="w-full"
									variant={"filled"}
									type="submit"
									disabled={isCreateQcJobPending || isUpdateQcJobPending}
									loading={isCreateQcJobPending || isUpdateQcJobPending}
								>
									{props.mode === FORM_MODE.EDIT ? "Update" : "Create"}
								</Button>
							</div>
						</div>
					)}
				</form>
			</Form>
		</div>
	);
};
