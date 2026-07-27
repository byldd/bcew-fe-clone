import React, { useEffect } from "react";
import { ISpecialJobModalProps } from "@/module/schedule-management/weekly-schedule-management/types/daily-job";
import {
	useCreateDailyJob,
	useGetDailyJob,
	useUpdateDailyJob,
} from "@/module/schedule-management/weekly-schedule-management/hooks/useSchedule";
import {
	ISpecialJobFormSchema,
	specialJobFormSchema,
} from "@/module/schedule-management/weekly-schedule-management/utils/special-job-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { FORM_MODE } from "@/types";
import { DatePicker } from "@/components/ui/date-picker";
import { Button } from "@/components/ui/button";
import JobMembersField from "../../components/job-members-field";
import { getTodayDate, toMidnightDateString } from "@/lib/utils/date";
import { openErrorToast, openSuccessToast } from "@/components/toast";
import { useQueryClient } from "@tanstack/react-query";
import { Spinner } from "@/components/ui/spinner";
import { useModal } from "@/hooks/useModal";
import DeleteJobModal from "../delete-job-modal";
import NotesFiled from "../notes-filed";
import SendJobAlertButton from "../../components/send-job-alert-button";
import { useHandleJobOperation } from "../../hooks/useHandleJobOperation";
import { useScheduleContext } from "../../context/schedule-context";
import { SendJobAlertModal } from "../send-job-alert-modal";
import { sortJobEmployee } from "../../utils/job-card";
import { NAMESPACE } from "@/i18n/type";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import PublishAJob from "../../components/job-card/publish-a-job";
import { SelectField } from "@/components/ui/selectField";

const SpcialJobModal = ({ closeModal, specialJob, ...props }: ISpecialJobModalProps) => {
	const formMode = props.mode;
	const { openModal, closeModal: closeDeleteModal, Modal } = useModal();
	const { isAllowedToModifyPastDates } = useScheduleContext();
	const { data: { dailyJob } = {}, isFetching: isLoadingDailyJob } = useGetDailyJob(
		props.mode === FORM_MODE.EDIT ? props.dailyJobId : "",
		props.mode === FORM_MODE.EDIT
	);

	const { mutate: createDailyJobMutation, isPending: isCreateDailyJobPending } = useCreateDailyJob();
	const { mutate: updateDailyJobMutation, isPending: isUpdateDailyJobPending } = useUpdateDailyJob();
	const tschedule = useTypedTranslations(NAMESPACE.SCHEDULE);
	const tCommon = useTypedTranslations(NAMESPACE.COMMON);
	const tTimeLogs = useTypedTranslations(NAMESPACE.TIME_LOGS);

	const queryClient = useQueryClient();

	const { onUpdateDailyJob, onCreateDailyJob } = useHandleJobOperation();

	const zoneOptions = specialJob?.specialJobZones?.map((zone) => ({
		value: zone.zoneGeoTabId,
		label: zone.zone?.name || "",
	}));

	const readOnly =
		formMode === FORM_MODE.EDIT &&
		dailyJob?.date &&
		new Date(dailyJob?.date) < getTodayDate() &&
		!isAllowedToModifyPastDates;

	const form = useForm<ISpecialJobFormSchema>({
		resolver: zodResolver(specialJobFormSchema),
		defaultValues: {
			date: formMode === FORM_MODE.CREATE ? new Date(props.date) : undefined,
			labelIds: [],
			jobEmployeeAssignments: [],
		},
	});

	useEffect(() => {
		if (formMode === FORM_MODE.EDIT) {
			form.reset({
				date: dailyJob?.date ? new Date(dailyJob?.date) : undefined,
				labelIds: dailyJob?.jobLabelAssignments?.map((label) => label.labelId),
				zoneGeoTabId: dailyJob?.zone?.geoTabId || undefined,
				jobEmployeeAssignments: sortJobEmployee({
					jobEmployees: dailyJob?.jobEmployeeAssignments || [],
					crewLeaderId: dailyJob?.crewLeaderId,
					taskLeaderId: dailyJob?.taskLeaderId,
				})?.map((assignment) => ({
					employeeId: assignment.employeeId,
					stopNumber: assignment.stopNumber ? Number(assignment.stopNumber) : undefined,
					hours: assignment.hours ? Number(assignment.hours) : undefined,
					startTime: assignment.startTime || undefined,
					endTime: assignment.endTime || undefined,
					overTimeHours: assignment.overTimeHours || undefined,
					overTimeMinutes: assignment.overTimeMinutes || undefined,
					overTimeReason: assignment.overTimeReason || undefined,
					isOverTimeApproved: assignment.isOverTimeApproved || undefined,
					employeeName: assignment.employee?.user?.name || undefined,
					id: assignment.id,
				})),
			});
		}
	}, [form, formMode, dailyJob]);

	const onSubmit = (data: ISpecialJobFormSchema) => {
		if (data.jobEmployeeAssignments.length === 0) {
			openErrorToast({ message: tschedule.pleaseSelectAtLeastOneEmployee });
			return;
		}

		if (formMode === FORM_MODE.CREATE && specialJob?.id) {
			createDailyJobMutation(
				{
					date: toMidnightDateString(data.date),
					labelIds: data.labelIds,
					jobEmployeeAssignments: data.jobEmployeeAssignments.map((assignment) => ({
						employeeId: assignment.employeeId,
						stopNumber: assignment.stopNumber || undefined,
						id: assignment.id,
						overrideStartTime: assignment.overrideStartTime || undefined,
						overrideEndTime: assignment.overrideEndTime || undefined,
					})),
					specialJobId: specialJob?.id,
					zoneGeoTabId: data.zoneGeoTabId || undefined,
				},
				{
					onSuccess: (data) => {
						onCreateDailyJob(data);
						void queryClient.invalidateQueries({ queryKey: ["week-schedule"] });
						openSuccessToast(tschedule.specialJobCreatedSuccessfully);
						closeModal();
					},
					onError: (error) => {
						openErrorToast({ error });
					},
				}
			);

			return;
		} else if (formMode === FORM_MODE.EDIT && specialJob?.id) {
			updateDailyJobMutation(
				{
					id: props.dailyJobId,
					payload: {
						date: toMidnightDateString(data.date),
						zoneGeoTabId: data.zoneGeoTabId || undefined,
						jobEmployeeAssignments: data.jobEmployeeAssignments.map((assignment) => ({
							employeeId: assignment.employeeId,
							stopNumber: assignment.stopNumber,
							id: assignment.id,
							startTime: undefined,
							endTime: undefined,
							overrideStartTime: assignment.overrideStartTime || undefined,
							overrideEndTime: assignment.overrideEndTime || undefined,
						})),
						labelIds: data.labelIds,
					},
				},
				{
					onSuccess: (data) => {
						onUpdateDailyJob({
							updatedJob: data,
							dailyJobId: props.dailyJobId,
						});
						void queryClient.invalidateQueries({ queryKey: ["week-schedule"] });
						openSuccessToast(tschedule.specialJobUpdatedSuccessfully);
						closeModal();
					},
					onError: (error) => {
						openErrorToast({ error });
					},
				}
			);
		}
	};

	const onDeleteClick = () => {
		if (!dailyJob) return;
		openModal({
			modalView: <DeleteJobModal dailyJobId={dailyJob.id} onClose={closeDeleteModal} onDeleteSuccess={closeModal} />,
			modalTitle: <p> Delete {specialJob?.name} Job</p>,
		});
	};

	const onSendAlerts = () => {
		if (!dailyJob?.id) return;
		openModal({
			modalView: <SendJobAlertModal onClose={closeModal} dailyJobId={dailyJob?.id} />,
		});
	};

	if (isLoadingDailyJob) {
		return <Spinner />;
	}

	if (formMode === FORM_MODE.EDIT && !dailyJob) {
		return <div>{tschedule.jobNotFound}</div>;
	}

	return (
		<div className="p-1">
			<Modal />
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)}>
					<div className="flex justify-between gap-4">
						<FormField
							control={form.control}
							name="date"
							render={({ field }) => (
								<FormItem className="w-full">
									<FormLabel className="!mb-2 !text-xs !font-normal !text-brand-grey md:!text-sm">
										{tschedule.date}
									</FormLabel>
									<FormControl>
										<DatePicker
											onChange={(date) => field.onChange(date)}
											value={field.value ? new Date(field.value) : undefined}
											placeholder={tschedule.selectDate}
											disabledDate={{ before: getTodayDate() }}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>

					<div>
						<FormField
							control={form.control}
							name="zoneGeoTabId"
							render={({ field }) => (
								<FormItem className="w-full">
									<FormLabel className="!mb-2 !text-xs !font-normal !text-brand-grey md:!text-sm">Zone</FormLabel>
									<FormControl>
										<SelectField
											options={zoneOptions || []}
											value={field.value || undefined}
											onValueChange={field.onChange}
											placeholder={"Select Zone"}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>

					<div className="my-4">
						<JobMembersField mode={props.mode} specialJob={specialJob} readOnly={readOnly} />
					</div>

					{formMode === FORM_MODE.EDIT && (
						<>
							<NotesFiled notes={dailyJob?.notes || []} />
							{/* TODO: Overtime field is not in use, will keep it for future use */}
							{/* <OverTimeField /> */}
						</>
					)}

					<div className="mt-4 flex w-full flex-col items-center justify-between gap-2">
						{formMode === FORM_MODE.EDIT && !readOnly && (
							<Button
								key="delete-job-button"
								type="button"
								variant="ghost"
								className="w-full text-red-500"
								onClick={onDeleteClick}
							>
								{tschedule.deleteJob}
							</Button>
						)}
						{!readOnly && (
							<div className="flex w-full items-center gap-2">
								{formMode === FORM_MODE.EDIT && (
									<SendJobAlertButton
										onSendAlerts={onSendAlerts}
										isPending={isCreateDailyJobPending || isUpdateDailyJobPending}
										isPublish={!!dailyJob?.isPublished}
									/>
								)}
								<Button
									className="w-full"
									variant={"filled"}
									type="submit"
									disabled={isCreateDailyJobPending || isUpdateDailyJobPending || readOnly}
								>
									{formMode === FORM_MODE.CREATE ? tTimeLogs.create : tCommon.save}
								</Button>

								{dailyJob && !dailyJob?.isPublished && <PublishAJob dailyJobId={dailyJob.id} />}
							</div>
						)}
					</div>
				</form>
			</Form>
		</div>
	);
};

export default SpcialJobModal;
