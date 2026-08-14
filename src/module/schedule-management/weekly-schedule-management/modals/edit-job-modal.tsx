import React, { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { IUpdateDailyJobFormSchema, updateDailyJobFormSchema } from "../utils/create-daily-job-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import JobMembersField from "../components/job-members-field";
import { useGetDailyJob, useScheduleCrews, useUpdateDailyJob } from "../hooks/useSchedule";
import { openErrorToast, openSuccessToast } from "@/components/toast";
import { useQueryClient } from "@tanstack/react-query";
import { dateToUTCString, getTodayDate, toDate, toMidnightDateString } from "@/lib/utils/date";
import { SelectField } from "@/components/ui/selectField";
import { useModal } from "@/hooks/useModal";
import DeleteJobModal from "./delete-job-modal";
import { InputField } from "@/components/ui/inputField";
import JobLabelField from "../components/job-label-field";
import TaskLeaderField from "../components/task-leader-field";
import { legends } from "@/module/employee-dashboard/constants/legend-items";
import SubcontractorField from "../components/subcontractor-field";
import { DatePicker } from "@/components/ui/date-picker";
import NotReadyFields from "../components/not-ready-fields";
import { FORM_MODE } from "@/types";
import JobUpdatesField from "../components/job-updates-field";
import { Spinner } from "@/components/ui/spinner";
import { useHandleFileUpload } from "@/hooks/useFile";
import { useScheduleContext } from "../context/schedule-context";
import NotesFiled from "./notes-filed";
import { isBoolean } from "@/module/job/utils";
import SendJobAlertButton from "../components/send-job-alert-button";
import { useHandleJobOperation } from "../hooks/useHandleJobOperation";
import { SendJobAlertModal } from "./send-job-alert-modal";
import { sortJobEmployee } from "../utils/job-card";

import { NAMESPACE } from "@/i18n/type";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import PublishAJob from "../components/job-card/publish-a-job";

export const EditJobModal = ({ closeModal, dailyJobId }: { closeModal: () => void; dailyJobId: string }) => {
	const { mutate: updateDailyJobMutation, isPending } = useUpdateDailyJob();
	const { data: { dailyJob, bcewJob } = {}, isFetching: isLoadingDailyJob } = useGetDailyJob(dailyJobId);
	const { getSignedUrls, getFilesToUpload, handleFileUpload } = useHandleFileUpload();
	const { employees, isAllowedToModifyPastDates } = useScheduleContext();
	const { onUpdateDailyJob } = useHandleJobOperation();

	const showNotReadUpdates =
		dailyJob?.notReadyUpdate ||
		dailyJob?.jobLabelAssignments?.some(
			(jobLegend) => jobLegend.labelId === legends.jobNotReady || jobLegend.labelId === legends.newStart
		);

	const tjobCards = useTypedTranslations(NAMESPACE.JOB_CARDS);
	const tcommon = useTypedTranslations(NAMESPACE.COMMON);

	const queryClient = useQueryClient();
	const readOnly = dailyJob?.date && new Date(dailyJob?.date) < getTodayDate() && !isAllowedToModifyPastDates;

	const { data: crews, isLoading: isLoadingCrews } = useScheduleCrews({});

	const { openModal, closeModal: closeChildModal, Modal } = useModal();

	const crewLeaders = useMemo(() => {
		return (
			employees
				.map((employee) => ({
					id: employee.id,
					name: employee?.user?.name,
				}))
				.filter((crew) => crew.id !== null) || []
		);
	}, [employees]);

	const form = useForm<IUpdateDailyJobFormSchema>({
		resolver: zodResolver(updateDailyJobFormSchema),
	});

	const { labelIds } = form.watch();

	const isSubcontractorJob = useMemo(() => {
		return labelIds?.includes(legends.subContractorJob);
	}, [labelIds]);

	const onCrewLeaderChange = (crewLeaderId: string) => {
		const crew = crews?.items.find((crew) => crew.crewLeaderId === crewLeaderId);
		if (crew) {
			form.setValue(
				"jobEmployeeAssignments",
				crew.crewEmployees.map((employee) => ({
					employeeId: employee.employee.id,
					id: "",
					employeeName: employee.employee.employeeName,
				}))
			);
		}
	};

	const onSubmit = async (data: IUpdateDailyJobFormSchema) => {
		if (!dailyJob || !bcewJob) return;
		const filesToUpload = getFilesToUpload(data?.images || []);
		const signedUrls = await getSignedUrls(filesToUpload);
		const { notReadyUpdate } = data;
		updateDailyJobMutation(
			{
				id: dailyJob?.id,
				payload: {
					schlinId: bcewJob.schlin?.idnum,
					srvinvId: bcewJob.srvinv?.idnum,
					date: toMidnightDateString(data.date),
					note: data.note || undefined,
					labelIds: data.labelIds,
					...(!isSubcontractorJob
						? {
								jobEmployeeAssignments: data.jobEmployeeAssignments?.map((assignment) => {
									return {
										id: assignment.id,
										employeeId: assignment.employeeId,
										stopNumber: assignment.stopNumber,
										startTime: assignment.startTime ? assignment.startTime : undefined,
										endTime: assignment.endTime ? assignment.endTime : undefined,
										overrideStartTime: assignment.overrideStartTime ? assignment.overrideStartTime : undefined,
										overrideEndTime: assignment.overrideEndTime ? assignment.overrideEndTime : undefined,
									};
								}),
								subcontractorId: "",
								taskLeaderId: data?.taskLeaderId || "",
								crewLeaderId: data?.crewLeaderId || "",
							}
						: {
								jobEmployeeAssignments: [],
								subcontractorId: data.subcontractorId || "",
								crewLeaderId: "",
								taskLeaderId: "",
							}),

					forecastTime: data.forecastTime || 0,
					isJobFinishToday: isBoolean(data.isJobFinishToday) ? !!data.isJobFinishToday : undefined,
					isJobFinishTomorrow: isBoolean(data.isJobFinishTomorrow) ? !!data.isJobFinishTomorrow : undefined,
					notReadyUpdate:
						isBoolean(notReadyUpdate?.isReady) || isBoolean(notReadyUpdate?.isClean)
							? {
									isReady: data.notReadyUpdate?.isReady ?? false,
									isClean: data.notReadyUpdate?.isClean ?? false,
									updateForCrew: data.notReadyUpdate?.updateForCrew || "",
								}
							: undefined,
					subContractorJobUpdate: {
						id: dailyJob.subContractorJobUpdate?.id || undefined,
						startTime: data.subContractorJobUpdate?.startTime
							? dateToUTCString(data.subContractorJobUpdate.startTime)
							: null,
						endTime: data.subContractorJobUpdate?.endTime ? dateToUTCString(data.subContractorJobUpdate.endTime) : null,
						forecastDate: data.subContractorJobUpdate?.forecastDate
							? toMidnightDateString(data.subContractorJobUpdate.forecastDate)
							: null,
					},
					imagesKeyFiles: data.images?.map((image) => image.keyFile),
				},
			},
			{
				onSuccess: async (data) => {
					openSuccessToast("Daily job updated successfully.");
					void queryClient.invalidateQueries({ queryKey: ["week-schedule"] });
					closeModal();
					await handleFileUpload({ signedUrls, filesToUpload });
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

	const onDeleteClick = () => {
		if (!dailyJob || !bcewJob) return;
		openModal({
			modalView: <DeleteJobModal dailyJobId={dailyJob.id} onClose={closeChildModal} onDeleteSuccess={closeModal} />,
			modalTitle: (
				<p>
					Delete Job {bcewJob?.schlin?.actrec.jobnme || bcewJob?.srvinv?.actrec.jobnme} (
					{bcewJob?.schlin?.tsknme || bcewJob?.srvinv?.ordnum})
				</p>
			),
		});
	};

	const onSendAlerts = () => {
		if (!dailyJob?.id) return;
		openModal({
			modalTitle: tcommon.sendAlerts,
			modalView: <SendJobAlertModal onClose={closeChildModal} dailyJobId={dailyJob?.id} />,
		});
	};

	useEffect(() => {
		if (!dailyJob || !bcewJob || isLoadingDailyJob || isLoadingCrews) return;

		const recNum = bcewJob?.schlin?.recnum || bcewJob?.srvinv?.recnum;

		form.reset({
			jobName: bcewJob?.schlin?.actrec.jobnme || bcewJob?.srvinv?.actrec.jobnme,
			jobRecNum: recNum ? `#${recNum}` : undefined,
			date: dailyJob?.date ? toDate(dailyJob?.date) : undefined,
			crewLeaderId: dailyJob?.crewLeaderId,
			taskLeaderId: dailyJob?.taskLeaderId,
			labelIds: dailyJob?.jobLabelAssignments?.map((assignment) => assignment.labelId),
			subcontractorId: dailyJob?.subcontractorId || "",
			subcontactorCrewName: dailyJob?.subcontractorCrew?.name || "",
			subcontactorCrewLeaderName: dailyJob?.subcontractorCrew?.crewLeaderName || "",
			note: dailyJob?.note || "",
			notReadyUpdate: dailyJob?.notReadyUpdate
				? {
						isClean: dailyJob?.notReadyUpdate?.isClean ?? undefined,
						isReady: dailyJob?.notReadyUpdate?.isReady ?? undefined,
						updateForCrew: dailyJob?.notReadyUpdate?.updateForCrew || "",
						noteFromCrewMember: dailyJob?.notReadyUpdate?.note || "",
					}
				: undefined,
			jobEmployeeAssignments: sortJobEmployee({
				jobEmployees: dailyJob?.jobEmployeeAssignments || [],
				crewLeaderId: dailyJob?.crewLeaderId,
				taskLeaderId: dailyJob?.taskLeaderId,
			})?.map((assignment) => {
				return {
					employeeId: assignment.employeeId,
					stopNumber: assignment.stopNumber,
					hours: Number(assignment.hours),
					id: assignment.id || "",
					overTimeHours: assignment.overTimeHours,
					overTimeMinutes: assignment.overTimeMinutes,
					overTimeReason: assignment.overTimeReason || "",
					endTime: assignment.endTime && typeof assignment.endTime === "string" ? assignment.endTime : null,
					startTime: assignment.startTime && typeof assignment.startTime === "string" ? assignment.startTime : null,
					isOverTimeApproved: assignment.isOverTimeApproved,
					employeeName: assignment.employee?.user?.name,
					overrideStartTime:
						assignment.overrideStartTime && typeof assignment.overrideStartTime === "string"
							? assignment.overrideStartTime
							: null,
					overrideEndTime:
						assignment.overrideEndTime && typeof assignment.overrideEndTime === "string"
							? assignment.overrideEndTime
							: null,
				};
			}),
			images: dailyJob?.images,
			forecastTime: dailyJob?.forecastTime || 0,
			isJobFinishToday: dailyJob?.isJobFinishToday,
			isJobFinishTomorrow: dailyJob?.isJobFinishTomorrow,
			subContractorJobUpdate: {
				startTime: dailyJob?.subContractorJobUpdate?.startTime
					? toDate(dailyJob?.subContractorJobUpdate.startTime)
					: undefined,
				endTime: dailyJob?.subContractorJobUpdate?.endTime
					? toDate(dailyJob?.subContractorJobUpdate.endTime)
					: undefined,
				forecastDate: dailyJob?.subContractorJobUpdate?.forecastDate
					? toDate(dailyJob?.subContractorJobUpdate.forecastDate)
					: undefined,
			},
			forecastDate: dailyJob?.forecastDate ? dailyJob?.forecastDate : undefined,
		});
	}, [isLoadingDailyJob, form, dailyJob, bcewJob, isLoadingCrews]);

	if (isLoadingDailyJob || isLoadingCrews) return <Spinner />;

	if (!dailyJob || !bcewJob) return <p>Job not found</p>;

	return (
		<div className="p-1">
			<Modal />
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)}>
					<div className="my-4 flex flex-col gap-4 sm:flex-row sm:justify-between">
						<FormField
							control={form.control}
							name="jobRecNum"
							render={({ field }) => (
								<FormItem className="w-full">
									<FormControl>
										<InputField label={tcommon.jobId} placeholder="--" disabled {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="w-full">
							<InputField
								label={tcommon.phase}
								value={bcewJob?.schlin?.tsknme || bcewJob?.srvinv?.ordnum?.toString()}
								placeholder="--"
								disabled
							/>
						</div>
					</div>

					<div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
						<FormField
							control={form.control}
							name="date"
							render={({ field }) => (
								<FormItem className="w-full">
									<FormLabel className="text-sm text-brand-dark60">{tcommon.date}</FormLabel>
									<FormControl>
										<DatePicker
											onChange={(date) => field.onChange(date)}
											value={field.value ? toDate(field.value) : undefined}
											placeholder={tcommon.selectDate}
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
										<FormLabel className="text-sm text-brand-dark60">{tcommon.status}</FormLabel>

										<FormControl>
											<JobLabelField
												disabled={readOnly}
												onChange={field.onChange}
												value={field.value || []}
												mode={FORM_MODE.EDIT}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
					</div>
					{!isSubcontractorJob && (
						<div className="my-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
							<FormField
								control={form.control}
								name="crewLeaderId"
								render={({ field }) => {
									return (
										<FormItem className="w-full">
											<FormControl>
												<SelectField
													label={tjobCards.crewLeader}
													options={crewLeaders?.map((leader) => ({
														label: leader.name,
														value: leader.id,
													}))}
													onValueChange={(value) => {
														if (value) {
															field.onChange(value);
															onCrewLeaderChange(value);
														}
													}}
													value={field.value || ""}
													placeholder={tjobCards.selectCrewLeader}
													disabled={readOnly}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									);
								}}
							/>

							<TaskLeaderField disabled={readOnly} />
						</div>
					)}

					{isSubcontractorJob && <SubcontractorField mode={FORM_MODE.EDIT} readOnly={readOnly} />}

					{!isSubcontractorJob && (
						<div className="my-4">
							<JobMembersField mode={FORM_MODE.EDIT} readOnly={readOnly} bcewJob={bcewJob} />
						</div>
					)}

					<div className="my-4">
						<NotesFiled notes={dailyJob.notes} />
					</div>

					{showNotReadUpdates && <NotReadyFields />}

					<JobUpdatesField
						isSubcontractorJob={!!isSubcontractorJob}
						readOnly={readOnly}
						jobUpdateReasons={dailyJob.jobUpdateReasons}
						forecastCrew={dailyJob.forecastCrews}
					/>

					{/* TODO: Overtime field is not in use, will keep it for future use */}
					{/* {!isSubcontractorJob && <OverTimeField />} */}

					{!readOnly && (
						<div className="mt-4 flex w-full flex-col items-center justify-between gap-2">
							<Button
								key="delete-job-button"
								type="button"
								variant="ghost"
								className="w-full text-red-500"
								onClick={onDeleteClick}
							>
								{tcommon.deleteJob}
							</Button>
							<div className="flex w-full items-center gap-2">
								<SendJobAlertButton
									onSendAlerts={onSendAlerts}
									isPending={isPending}
									isPublish={dailyJob.isPublished}
								/>
								<Button key="save" className="w-full" variant={"filled"} type="submit" disabled={isPending}>
									{tcommon.save}
								</Button>
								{dailyJob && !dailyJob?.isPublished && <PublishAJob dailyJobId={dailyJobId} />}
							</div>
						</div>
					)}
				</form>
			</Form>
		</div>
	);
};
