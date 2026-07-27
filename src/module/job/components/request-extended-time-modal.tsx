import { Button } from "@/components/ui/button";
import { openErrorToast, openSuccessToast } from "@/components/toast";
import React, { useEffect, useMemo, useState } from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useForm, Controller } from "react-hook-form";
import { extendedReasonType, extendedTimeType } from "../utils/enums";
import { useGetExtendedRequest, useUpdateExtendedTime } from "../hooks/useEmployeeExtendedTime";
import { dateToUTCString, getTodayDate, toDate, toFormattedDate } from "@/lib/utils/date";
import { getFormattedTimeRange } from "@/module/schedule-management/roster-time-configuration/utils";
import {
	calculateExtendedHours,
	getWorkOnScheduleOptions,
	getAllowedExtendedType,
	getHighestEndTime,
	getLowestStartTime,
	hasPendingBothTypeRequest,
	validateExtendedTypeSelection,
} from "../utils";
import { IExtendedTime } from "../types";
import { useQueryClient } from "@tanstack/react-query";
import TimeInput from "@/components/ui/time-input";
import { FALLBACK_TIME_RANGE_STRINGS } from "@/utils/enums";
import { Plus } from "lucide-react";
import { DATE_FORMAT } from "@/types/date";
import { extendedTimeTypeMap } from "@/module/schedule-management/time-logs-management/utils/constants";
import { SelectField } from "@/components/ui/selectField";
import { useEmployeeScheduleParams } from "../hooks/useEmployeeScheduleParams";
import { useEmployeeSchedules, useEmployeeTodayRoster } from "../hooks/useEmployeeSchedule";
import { TextareaField } from "@/components/ui/textareaField";
import { defaultRosterTime, extendedReasonMap, extendedReasonOptions } from "../utils/constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { extendedTimeFormSchema, IExtendedTimeFormSchema } from "../utils/extended-time-form";
import { IRoster } from "@/module/schedule-management/roster-time-configuration/types";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
import { LuPencilLine } from "react-icons/lu";
import { FormLabelRequired } from "@/components/ui/formLabelrequired";

const RequestExtendedTimeModal = ({ onClose, userRoster }: { onClose: () => void; userRoster?: IRoster }) => {
	const { getParams } = useEmployeeScheduleParams();
	const { startDate } = getParams();
	const { data: extendedRequest } = useGetExtendedRequest(dateToUTCString(startDate));
	const { data: rosterTime } = useEmployeeTodayRoster({ date: dateToUTCString(getTodayDate()) });
	const { data } = useEmployeeSchedules({ startDate: dateToUTCString(startDate) });
	const employeeDayTimes = extendedRequest?.employee?.employeeDayTimes?.[0];
	const {
		date,
		dayStartTime: rosterStartTime,
		dayEndTime: rosterEndTime,
		extendedApprovedStartTime,
		extendedApprovedEndTime,
	} = rosterTime || userRoster || defaultRosterTime;
	const extendedRequests: IExtendedTime[] = extendedRequest?.extendedRequestTimes || [];

	const { mutate: requestExtendedTime } = useUpdateExtendedTime();
	const queryClient = useQueryClient();
	const [currentEditId, setCurrentEditId] = useState<string | null>(null);
	const [showNewRequestForm, setShowNewRequestForm] = useState(!extendedRequest);
	const [stopOptions, setStopOptions] = useState<{ label: string; value: string; assignmentId: string }[]>();
	const tEmployee = useTypedTranslations(NAMESPACE.EMPLOYEE);

	const {
		control,
		handleSubmit,
		watch,
		setValue,
		reset,
		formState: { errors },
	} = useForm<IExtendedTimeFormSchema>({
		resolver: zodResolver(
			extendedTimeFormSchema({
				rosterStartTime,
				rosterEndTime,
				rosterTime,
			})
		),
		defaultValues: {
			id: extendedRequest?.id,
			startTime: "",
			endTime: "",
			extendedReason: "",
			note: "",
			extendedType: extendedTimeType.EARLY_START,
			jobStartTime: "",
			jobEndTime: "",
			jobDailyRecordId: "",
		},
	});

	const baseStopOptions = useMemo(
		() =>
			data?.map((stop) => ({
				label: `${stop.jobDailyRecord.jobnme}${stop.jobDailyRecord.tsknme ? ` (${stop.jobDailyRecord.tsknme})` : ""}`,
				value: stop.jobDailyRecord.id,
				assignmentId: stop.assignmentId,
			})) ?? [],
		[data]
	);

	const { extendedType: type, startTime, endTime, extendedReason } = watch();

	const onFormSubmit = (data: IExtendedTimeFormSchema) => {
		const selectedStop = stopOptions?.find((stop) => stop.value === data.jobDailyRecordId);

		handleExtendedTimeRequest(
			data.startTime,
			data.endTime,
			data.extendedReason,
			data.extendedType,
			data.note,
			data.jobStartTime,
			data.jobEndTime,
			data.jobDailyRecordId,
			selectedStop?.label,
			selectedStop?.assignmentId
		);
	};

	const handleExtendedTimeRequest = (
		startTime: string | undefined,
		endTime: string | undefined,
		reason: string,
		extendedType: string,
		note: string | undefined,
		jobStartTime?: string,
		jobEndTime?: string,
		jobDailyRecordId?: string | null,
		stopName?: string | undefined | null,
		assignmentId?: string
	) => {
		const extendedStartTime =
			startTime && extendedType !== extendedTimeType.LATE_RELEASE ? toDate(startTime) : rosterStartTime;
		const extendedEndTime = endTime && extendedType !== extendedTimeType.EARLY_START ? toDate(endTime) : rosterEndTime;

		const payload = {
			requestId: extendedRequest?.id,
			id: currentEditId,
			startTime: dateToUTCString(extendedStartTime),
			endTime: dateToUTCString(extendedEndTime),
			extendedReason: reason,
			extendedType,
			date,
			note,
			jobStartTime,
			jobEndTime,
			jobDailyRecordId,
			stopName,
			assignmentId,
		};

		if (!validateExtendedTypeSelection(extendedType as extendedTimeType, extendedRequests, currentEditId)) {
			return;
		}

		requestExtendedTime(payload, {
			onSuccess: () => {
				openSuccessToast(tEmployee.extendedTimeRequestSubmittedSuccessfully);
				queryClient.invalidateQueries({ queryKey: ["employeeData"] });
				onClose();
			},
			onError: (error) => {
				openErrorToast({ error });
			},
		});
	};

	useEffect(() => {
		if (extendedReason === extendedReasonType.WORK_ON_SCHEDULED_JOB) {
			const filteredOptions = getWorkOnScheduleOptions(type, data, baseStopOptions);
			setStopOptions(filteredOptions);
		} else {
			setStopOptions(baseStopOptions);
			setValue("jobDailyRecordId", "");
		}
	}, [extendedReason, type, data, baseStopOptions, setValue]);

	const handleToggleRequestForm = () => {
		if (hasPendingBothTypeRequest(extendedRequests, currentEditId)) {
			return openErrorToast({ message: tEmployee.bothEarlyLatePendingRequest });
		}

		const willShow = !showNewRequestForm;
		setShowNewRequestForm(willShow);

		if (willShow) {
			const allowedType = getAllowedExtendedType(extendedRequests, currentEditId);
			if (allowedType) {
				setValue("extendedType", allowedType);
			}
		}

		if (!willShow) {
			setCurrentEditId(null);
			reset();
		}
	};

	const handleExtendedTypeChange = (
		newValue: string,
		fieldOnChange: (value: string) => void,
		extendedRequests: IExtendedTime[]
	) => {
		setValue("startTime", "");
		setValue("endTime", "");
		if (!validateExtendedTypeSelection(newValue as extendedTimeType, extendedRequests, currentEditId)) {
			return;
		}

		fieldOnChange(newValue);
	};

	const handleEarlyStartTimeChange = (newValue: string, fieldOnChange: (value: string) => void) => {
		const lowestStartTime = getLowestStartTime(data, dateToUTCString(extendedApprovedStartTime || rosterStartTime));
		setValue("jobStartTime", newValue);
		setValue("jobEndTime", lowestStartTime);

		fieldOnChange(newValue);
	};

	const handleLateReleaseTimeChange = (newValue: string, fieldOnChange: (value: string) => void) => {
		const highestEndTime = getHighestEndTime(data, dateToUTCString(extendedApprovedEndTime || rosterEndTime));
		setValue("jobStartTime", highestEndTime);
		setValue("jobEndTime", newValue);

		fieldOnChange(newValue);
	};

	const handleJobEndTimeDisable = () => {
		return employeeDayTimes?.dayEndTime ? true : type === extendedTimeType.LATE_RELEASE;
	};

	const handleJobStartTimeDisable = () => {
		return employeeDayTimes?.dayEndTime ? true : type === extendedTimeType.EARLY_START;
	};

	return (
		<div className="max-h-[70vh] w-full overflow-y-auto border-t bg-white px-0.5">
			<h2 className="py-2 font-inter text-sm font-medium text-brand-grey">
				{tEmployee.date}{" "}
				<span className="text-xs font-medium text-brand-dark">{date ? toFormattedDate(date) : "--"}</span>
			</h2>

			<h2 className="mb-2 border-b pb-2 font-inter text-sm font-medium text-brand-dark60">
				{tEmployee.rosterTime}:{" "}
				<span className="text-xs font-medium text-brand-dark">
					{getFormattedTimeRange(
						rosterTime?.dayStartTime,
						rosterTime?.dayEndTime,
						FALLBACK_TIME_RANGE_STRINGS.DEFAULT_TIME_RANGE
					)}
				</span>
			</h2>
			{extendedApprovedStartTime && (
				<h2 className="mb-4 border-b pb-4 font-inter text-sm font-normal text-brand-grey">
					{tEmployee.extendedRosterTime}:{" "}
					<span className="text-xs font-medium text-brand-dark">
						{getFormattedTimeRange(extendedApprovedStartTime || null, extendedApprovedEndTime || null)}
					</span>
				</h2>
			)}

			{extendedRequests.length > 0 && (
				<div className="mb-4">
					<h3 className="my-2 text-sm font-normal text-brand-dark60">{tEmployee.previousRequests}</h3>

					<div className="flex flex-col gap-2">
						{extendedRequests.map((req) => (
							<div
								key={req.id}
								className="flex items-center justify-between rounded-xl border border-brand-lightgrey p-2"
							>
								<div>
									<p className="text-xs font-medium text-brand-dark">
										{req.extendedType === extendedTimeType.BOTH
											? `${getFormattedTimeRange(req.startTime, req.endTime)} Early: ${calculateExtendedHours(req.startTime, rosterStartTime, extendedTimeType.EARLY_START)} Late: ${calculateExtendedHours(req.endTime, rosterEndTime, extendedTimeType.LATE_RELEASE)}`
											: req.extendedType === extendedTimeType.EARLY_START
												? `${toFormattedDate(req.startTime, DATE_FORMAT.HH_MM_AA_PM)} Early: ${calculateExtendedHours(req.startTime, rosterStartTime, extendedTimeType.EARLY_START)}`
												: `${toFormattedDate(req.endTime, DATE_FORMAT.HH_MM_AA_PM)} Late: ${calculateExtendedHours(req.endTime, rosterEndTime, extendedTimeType.LATE_RELEASE)}`}
									</p>
									<p className="line-clamp-3 break-words break-all text-xs font-normal text-brand-dark">
										{extendedReasonMap[req.extendedReason]}
									</p>
									{req.note && (
										<p className="line-clamp-3 break-words break-all text-xs font-normal text-brand-dark">
											{tEmployee.note}: {`${req.note}`}
										</p>
									)}
									{req.adminNote && (
										<p className="line-clamp-3 break-words break-all text-xs font-normal text-brand-dark">
											{tEmployee.adminNote}: {`${req.adminNote}`}
										</p>
									)}
								</div>

								{req.isApproved === true ? (
									<span className="text-sm font-semibold text-green-600">{tEmployee.approved}</span>
								) : req.isApproved === false ? (
									<span className="text-sm font-semibold text-red-600">{tEmployee.declined}</span>
								) : (
									<Button
										className="ml-4 font-inter text-xs font-semibold text-yellow-600"
										onClick={() => {
											setCurrentEditId(req.id);
											setShowNewRequestForm(true);
											setValue("startTime", req.startTime);
											setValue("endTime", req.endTime);
											setValue("extendedReason", req.extendedReason);
											setValue("extendedType", req.extendedType);
											setValue("jobStartTime", req.jobStartTime);
											setValue("jobEndTime", req.jobEndTime);
											setValue("note", req.note);
											setValue("jobDailyRecordId", req.jobDailyRecordId);
											setValue("assignmentId", req.assignmentId || "");
										}}
									>
										Pending
										<LuPencilLine className="text-black" />
									</Button>
								)}
							</div>
						))}
					</div>
				</div>
			)}

			{extendedRequest && (
				<div className="my-4">
					<Button
						variant="outline"
						className="flex items-center gap-2 border border-gray-300 text-sm font-medium text-brand-dark"
						onClick={handleToggleRequestForm}
					>
						<Plus className="h-4 w-4" />
						{currentEditId ? tEmployee.editRequest : tEmployee.sendNewRequest}
					</Button>
				</div>
			)}

			{showNewRequestForm && (
				<div>
					{" "}
					<div className="flex items-center justify-between">
						<p className="mb-1 font-inter text-sm font-normal text-brand-dark60">{tEmployee.selectRequestType}</p>
					</div>
					{currentEditId ? (
						<div className="font-inter text-sm font-normal">{extendedTimeTypeMap[type]}* </div>
					) : (
						<Controller
							name="extendedType"
							control={control}
							render={({ field }) => (
								<RadioGroup
									value={field.value}
									onValueChange={(newValue) => handleExtendedTypeChange(newValue, field.onChange, extendedRequests)}
									className="flex flex-col gap-3 py-2"
								>
									<div className="flex items-center space-x-2">
										<RadioGroupItem value={extendedTimeType.EARLY_START} id="early-start" />
										<Label htmlFor="early-start" className="text-sm text-brand-dark">
											{tEmployee.earlyStart}
										</Label>
									</div>
									<div className="flex items-center space-x-2">
										<RadioGroupItem value={extendedTimeType.LATE_RELEASE} id="late-release" />
										<Label htmlFor="late-release" className="text-sm text-brand-dark">
											{tEmployee.lateRelease}
										</Label>
									</div>
									{/* <div className="flex items-center space-x-2">
										<RadioGroupItem value={extendedTimeType.BOTH} id="both" />
										<Label htmlFor="both" className="mt-2 text-xs text-brand-dark">
											Both
										</Label>
									</div> */}
								</RadioGroup>
							)}
						/>
					)}
					<div className="my-3 flex flex-col gap-2 sm:flex-row sm:gap-4">
						{type !== extendedTimeType.LATE_RELEASE && (
							<div className="flex w-full flex-col space-y-1">
								<label className="text-sm font-normal text-brand-dark60">{tEmployee.earlyStartTime}</label>
								<Controller
									name="startTime"
									control={control}
									render={({ field }) => (
										<TimeInput
											onChange={(newValue) => handleEarlyStartTimeChange(newValue, field.onChange)}
											value={field.value}
											date={date}
										/>
									)}
								/>
								<span className="mt-1 text-xs font-normal text-brand-dark">
									{tEmployee.extendedHours} :{" "}
									{calculateExtendedHours(startTime, rosterStartTime, extendedTimeType.EARLY_START)}
									{errors.startTime && <p className="mt-1 text-xs text-red-500">{errors.startTime.message}</p>}
								</span>
							</div>
						)}

						{type !== extendedTimeType.EARLY_START && (
							<div className="flex w-full flex-col">
								<label className="mb-1 text-sm font-normal text-brand-dark60">{tEmployee.lateReleaseTime}</label>
								<Controller
									name="endTime"
									control={control}
									render={({ field }) => (
										<TimeInput
											onChange={(newValue) => handleLateReleaseTimeChange(newValue, field.onChange)}
											value={field.value}
											date={date}
										/>
									)}
								/>
								<span className="mt-1 text-xs font-normal text-brand-dark">
									{tEmployee.extendedHours} :{" "}
									{calculateExtendedHours(endTime, rosterEndTime, extendedTimeType.LATE_RELEASE)}
									{errors.endTime && <p className="mt-1 text-xs text-red-500">{errors.endTime.message}</p>}
								</span>
							</div>
						)}
					</div>
					<FormLabelRequired
						label={tEmployee.reasonRequired}
						required
						className="mb-1 font-inter text-sm font-normal text-brand-dark60"
					/>
					<Controller
						name="extendedReason"
						control={control}
						render={({ field, fieldState }) => (
							<SelectField
								id="extendedReason"
								placeholder={tEmployee.selectReason}
								options={extendedReasonOptions}
								value={field.value}
								onValueChange={(value) => {
									return field.onChange(value);
								}}
								error={fieldState.error?.message}
								className="mb-4"
							/>
						)}
					/>
					{extendedReason === extendedReasonType.WORK_ON_SCHEDULED_JOB && (
						<>
							<FormLabelRequired
								label={tEmployee.selectStopRequired}
								required
								className="mb-1 font-inter text-sm font-normal text-brand-dark60"
							/>
							<Controller
								name="jobDailyRecordId"
								control={control}
								rules={{ required: "Stop is required" }}
								render={({ field, fieldState }) => (
									<SelectField
										id="jobDailyRecordId"
										placeholder={tEmployee.selectAStop}
										options={stopOptions || []}
										value={field.value}
										onValueChange={(value) => field.onChange(value)}
										error={fieldState.error?.message}
										className="mb-4"
									/>
								)}
							/>
						</>
					)}
					<p className="mb-1 font-inter text-sm font-normal text-brand-dark60">{tEmployee.note}</p>
					<Controller
						name="note"
						control={control}
						render={({ field }) => (
							<TextareaField
								{...field}
								className="mb-4 h-[80px] w-full rounded-[8px] bg-brand-bgLightgrey text-xs font-normal outline-none"
								placeholder={tEmployee.typeHere}
							/>
						)}
					/>
					<div className="my-4 flex flex-col gap-2 sm:flex-row sm:gap-4">
						<div className="flex w-full flex-col">
							<label className="mb-1 text-sm font-normal text-brand-dark60">{tEmployee.extendedStartTime}</label>
							<Controller
								name="jobStartTime"
								control={control}
								render={({ field }) => (
									<TimeInput
										disabled={handleJobStartTimeDisable()}
										onChange={field.onChange}
										value={field.value}
										date={date}
									/>
								)}
							/>
							{errors.jobStartTime && <p className="mt-1 text-xs text-red-500">{errors.jobStartTime.message}</p>}
						</div>

						<div className="flex w-full flex-col">
							<label className="mb-1 text-sm font-normal text-brand-dark60">{tEmployee.extendedEndTime}</label>
							<Controller
								name="jobEndTime"
								control={control}
								render={({ field }) => (
									<TimeInput
										disabled={handleJobEndTimeDisable()}
										onChange={field.onChange}
										value={field.value}
										date={date}
									/>
								)}
							/>
							{errors.jobEndTime && <p className="mt-1 text-xs text-red-500">{errors.jobEndTime.message}</p>}
						</div>
					</div>
					{extendedReason !== extendedReasonType.NEW_JOB && (
						<div className="sticky bottom-0 z-10 border-t bg-white pt-3">
							<div className="flex w-full gap-2">
								<Button
									variant="outline"
									className="flex-1"
									onClick={() => {
										const willShow = !showNewRequestForm;

										setShowNewRequestForm(willShow);

										if (!willShow) {
											setCurrentEditId(null);
											reset();
										}
									}}
								>
									{tEmployee.cancel}
								</Button>
								<Button variant="filled" onClick={handleSubmit(onFormSubmit)} className="flex-1">
									{currentEditId ? tEmployee.updateRequest : tEmployee.sendRequest}
								</Button>
							</div>
						</div>
					)}
				</div>
			)}
		</div>
	);
};

export default RequestExtendedTimeModal;
