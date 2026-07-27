"use client";

import { useState, useMemo } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useHandleFileUpload } from "@/hooks/useFile";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { TextareaField } from "@/components/ui/textareaField";
import { SelectField } from "@/components/ui/selectField"; // Assuming this is your custom Select
import ImageUpload from "@/components/shared/image-upload/image-upload";
import { Plus, Minus, X, Check } from "lucide-react";
import { CgAddR } from "react-icons/cg";

import { openErrorToast, openSuccessToast } from "@/components/toast";
import { useDailyJobAllEmployees, useUpdateDailyJobRecord } from "../../hooks/useEmployeeSchedule";
import { IJobUpdateFormProps } from "../../types";
import { IJobUpdateFormSchema, jobUpdateFormSchema } from "./job-update-form";
import { DatePicker } from "@/components/ui/date-picker";
import { dateToUTCString, getTodayDate, toDate, toMidnightDateString } from "@/lib/utils/date";
import { addDays } from "date-fns";
import { getForecastBanner, getInitialCrew } from "../../utils";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
import { Input } from "@/components/ui/input";
import { JOB_PHASE_LABEL_NUM } from "@/module/schedule-management/weekly-schedule-management/constants/week-schedule";
import FormError from "@/components/ui/form-error";
import { SlabRoughReferencePhoto } from "@/utils/constants";
import Image from "next/image";

export default function JobUpdateForm({ job, onClose, onSubmitSuccess }: IJobUpdateFormProps) {
	const { schedule, specialJob } = job;
	const tEmployee = useTypedTranslations(NAMESPACE.EMPLOYEE);
	const tSchedule = useTypedTranslations(NAMESPACE.SCHEDULE);
	const { actrec } = schedule || {};
	const queryClient = useQueryClient();
	const { mutate: updateDailyJob, isPending } = useUpdateDailyJobRecord(job.id);
	const { data: allEmployees } = useDailyJobAllEmployees();
	const { getSignedUrls, getFilesToUpload, handleFileUpload } = useHandleFileUpload();

	const [isAdding, setIsAdding] = useState(false);
	const [newEmployeeId, setNewEmployeeId] = useState<string>("");

	const today = job.date ? toDate(job.date) : getTodayDate();
	const tomorrow = addDays(today, 1);

	const jobEndDate = toDate(toMidnightDateString(job?.scheduledEndDate ? toDate(job.scheduledEndDate) : today));

	const isScheduledTillTomorrow = jobEndDate.getTime() === tomorrow.getTime();
	const isScheduledOnlyTillToday = jobEndDate.getTime() <= today.getTime();
	const isSlabRoughJob = Number(job.schedule?.tsknum) === JOB_PHASE_LABEL_NUM["Slab Rough"];

	const isMarkedAsNotReady = job.notReadyUpdate?.isReady == false || job.notReadyUpdate?.isClean == false;

	const stableInitialValues = useMemo(() => {
		return {
			jobCompleted: isMarkedAsNotReady ? false : job.isJobFinishToday,
			forecastCompletion: job.isJobFinishTomorrow,
			note: "",
			images: job.images || [],
			forecastDate: job.forecastDate ? dateToUTCString(job.forecastDate) : undefined,
			jobEmployeeAssignments: getInitialCrew(job),
		};
	}, [job, isMarkedAsNotReady]);

	const {
		control,
		handleSubmit,
		watch,
		setValue,
		formState: { errors },
	} = useForm<IJobUpdateFormSchema>({
		resolver: zodResolver(jobUpdateFormSchema({ isSlabRoughJob })),
		defaultValues: stableInitialValues,
	});

	const { fields, update, append } = useFieldArray({
		control,
		name: "jobEmployeeAssignments",
	});

	const { jobCompleted, forecastCompletion, forecastDate } = watch();

	const banner = getForecastBanner({
		forecastDate,
		jobEndDate,
		today,
		errors,
		isScheduledOnlyTillToday,
		forecastCompletion,
	});

	const showForecastDatePicker = jobCompleted === false && forecastCompletion === false;
	const showCrew = jobCompleted === false;
	const isExtension = forecastDate && toDate(forecastDate) > jobEndDate;

	const watchedAssignments = watch("jobEmployeeAssignments");

	const memoizedAssignments = useMemo(() => {
		return watchedAssignments || [];
	}, [watchedAssignments]);

	const totalForecastHours = memoizedAssignments
		.filter((m) => m.checked)
		.reduce((sum, m) => sum + (m.forecastHours || 0), 0);

	const allEmployeeOptions = useMemo(() => {
		const currentemployeeIds = new Set(memoizedAssignments.map((a) => a.employeeId));

		return (allEmployees || [])
			.filter((emp) => !currentemployeeIds.has(emp.id))
			.map((emp) => ({
				label: emp.user?.name || "--",
				value: emp.id,
			}));
	}, [allEmployees, memoizedAssignments]);

	const handleUpdateCrewMember = (index: number, delta: number) => {
		const currentMember = memoizedAssignments[index];
		if (!currentMember) return;
		update(index, {
			...currentMember,
			forecastHours: Math.max(0, (currentMember.forecastHours ?? 0) + delta),
			employeeId: currentMember.employeeId || "",
			name: currentMember.name || "--",
			checked: currentMember.checked ?? true,
		});
	};

	const commitNewMember = () => {
		const emp = allEmployees?.find((e) => e.id === newEmployeeId);
		if (emp) {
			append({
				employeeId: emp.id,
				name: emp.user?.name || "--",
				checked: true,
				forecastHours: 0,
			});
			setIsAdding(false);
			setNewEmployeeId("");
		}
	};

	const cancelNewMember = () => {
		setIsAdding(false);
		setNewEmployeeId("");
	};

	const onSubmit = async (data: IJobUpdateFormSchema) => {
		const filesToUpload = getFilesToUpload(data.images || []);
		const signedUrls = await getSignedUrls(filesToUpload);

		const payload = {
			...job,
			isJobFinishToday: data.jobCompleted,
			isJobFinishTomorrow: data.forecastCompletion,
			forecastDate: data.forecastDate,
			forecastCrew: data.jobEmployeeAssignments
				?.filter((m) => m.checked)
				.map((m) => ({
					employeeId: m.employeeId,
					name: m.name,
					forecastHours: m.forecastHours,
				})),
			note: data.note,
			images: data?.images?.map((img) => ({ keyFile: img.keyFile || "", url: img.url })),
		};

		updateDailyJob(payload, {
			onSuccess: async () => {
				await handleFileUpload({ signedUrls, filesToUpload });
				openSuccessToast(tEmployee.jobUpdatedSuccessfully);
				queryClient.invalidateQueries({ queryKey: ["employee-daily-job"] });
				onClose();
				await onSubmitSuccess?.();
			},
			onError: (error) => openErrorToast({ error }),
		});
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-4 border-t p-1">
			<header className="mt-1">
				<h1 className="text-sm font-medium">{specialJob ? specialJob.name : actrec?.jobnme}</h1>
				{!specialJob && (
					<p className="text-sm text-muted-foreground">
						{tEmployee.job} #{actrec?.recnum}
					</p>
				)}
			</header>

			<div className="space-y-3">
				<Label className="text-sm font-medium text-brand-dark50">{tEmployee.jobCompletedTodayRequired}</Label>
				<Controller
					name="jobCompleted"
					control={control}
					render={({ field }) => (
						<RadioGroup
							value={field.value === true ? "yes" : field.value === false ? "no" : ""}
							onValueChange={(val) => field.onChange(val === "yes")}
							className="flex gap-8"
							disabled={isMarkedAsNotReady}
						>
							<div className="flex items-center gap-2">
								<RadioGroupItem value="yes" id="completed-yes" />
								<Label htmlFor="completed-yes">{tEmployee.yes}</Label>
							</div>
							<div className="flex items-center gap-2">
								<RadioGroupItem value="no" id="completed-no" />
								<Label htmlFor="completed-no">{tEmployee.no}</Label>
							</div>
						</RadioGroup>
					)}
				/>
			</div>

			{jobCompleted === false && (
				<div className="space-y-3">
					<div className="space-y-3">
						<Label className="text-sm font-medium text-brand-dark50">
							{tEmployee.forecastCompletionTomorrowRequired}
						</Label>
						<Controller
							name="forecastCompletion"
							control={control}
							render={({ field }) => (
								<RadioGroup
									value={field.value === true ? "yes" : field.value === false ? "no" : ""}
									onValueChange={(val) => {
										field.onChange(val === "yes");
										if (val === "yes" && isScheduledTillTomorrow) setValue("forecastDate", dateToUTCString(tomorrow));
									}}
									className="flex gap-8"
								>
									<div className="flex items-center gap-2">
										<RadioGroupItem value="yes" id="forecast-yes" />
										<Label htmlFor="forecast-yes">{tEmployee.yes}</Label>
									</div>
									<div className="flex items-center gap-2">
										<RadioGroupItem value="no" id="forecast-no" />
										<Label htmlFor="forecast-no">{tEmployee.no}</Label>
									</div>
								</RadioGroup>
							)}
						/>
						{errors.forecastCompletion && <p className="text-sm text-red-500">{errors.forecastCompletion.message}</p>}
					</div>

					{showForecastDatePicker && (
						<div className="space-y-1 pt-3">
							<Label className="text-sm font-medium text-brand-dark50">{tEmployee.forecastedDate}</Label>
							<Controller
								name="forecastDate"
								control={control}
								render={({ field }) => (
									<DatePicker
										value={field.value || undefined}
										onChange={(value) => field.onChange(dateToUTCString(value))}
										placeholder={tSchedule.selectDate}
										className="w-full"
										disabledDate={{ before: addDays(today, 1) }}
									/>
								)}
							/>
						</div>
					)}
					{banner && <p className={`text-sm ${banner.color}`}>{banner.message}</p>}

					{showCrew && (
						<div className="space-y-2 border-t pt-2">
							<Label className="text-sm font-medium text-brand-dark50">
								{tEmployee.tomorrowsCrew} {isExtension && "(Extension)"}
							</Label>

							<div className="space-y-3">
								{fields.map((field, index) => (
									<div key={field.id} className="flex items-center justify-between">
										<div className="flex items-center gap-3">
											<Input
												type="checkbox"
												className="h-4 w-4 rounded accent-[hsl(var(--primary))]"
												checked={memoizedAssignments[index]?.checked}
												onChange={(e) =>
													update(index, {
														...memoizedAssignments[index],
														checked: e.target.checked,
														employeeId: memoizedAssignments?.[index]?.employeeId || "",
														name: memoizedAssignments?.[index]?.name || "--",
														forecastHours: memoizedAssignments?.[index]?.forecastHours ?? 0,
													})
												}
											/>
											<span className="text-sm font-medium">{field.name}</span>
										</div>
										<div className="flex items-center gap-2 rounded-lg bg-secondary/20 p-1">
											<Button
												variant="ghost"
												size="icon"
												className="h-7 w-7"
												type="button"
												onClick={() => handleUpdateCrewMember(index, -0.5)}
											>
												<Minus size={14} />
											</Button>
											<span className="w-14 text-center text-sm font-medium">
												{memoizedAssignments[index]?.forecastHours ?? 0} Hrs
											</span>
											<Button
												variant="ghost"
												size="icon"
												className="h-7 w-7"
												type="button"
												onClick={() => handleUpdateCrewMember(index, 0.5)}
											>
												<Plus size={14} />
											</Button>
										</div>
									</div>
								))}
								{errors.forecastCrew && <p className="text-sm text-red-500">{errors.forecastCrew.message}</p>}
							</div>

							{!isAdding ? (
								<Button
									className="rounded-[8px] py-4"
									size="sm"
									type="button"
									variant="outline"
									onClick={() => setIsAdding(true)}
								>
									<CgAddR /> {tEmployee.addMember}
								</Button>
							) : (
								<div className="flex w-full items-end gap-2 py-2 animate-in slide-in-from-left-2">
									<div className="flex-1 space-y-1">
										<SelectField
											label="Search Member"
											options={allEmployeeOptions}
											placeholder="Select Member"
											value={newEmployeeId}
											onValueChange={(val) => setNewEmployeeId(val)}
										/>
									</div>
									<Button
										className="h-10 w-10 p-0"
										type="button"
										variant="default"
										disabled={!newEmployeeId}
										onClick={commitNewMember}
									>
										<Check size={18} />
									</Button>
									<Button className="h-10 w-10 p-0" type="button" variant="outline" onClick={cancelNewMember}>
										<X size={18} />
									</Button>
								</div>
							)}

							<div className="border-t border-dashed pt-2">
								<p className="text-xs font-medium">
									{tEmployee.totalHoursRequired}: {totalForecastHours} {tEmployee.hrs}
								</p>
							</div>
						</div>
					)}

					<div className="space-y-4 border-t pt-4">
						<div className="space-y-2">
							<Label className="font-inter text-sm font-normal text-brand-grey">{tEmployee.addReason}</Label>
							<Controller
								name="note"
								control={control}
								render={({ field }) => (
									<TextareaField {...field} placeholder={tEmployee.typeHere} className="min-h-[80px]" />
								)}
							/>
						</div>
					</div>
				</div>
			)}

			{(jobCompleted === false || isSlabRoughJob) && (
				<>
					{isSlabRoughJob && (
						<div className="space-y-2">
							<p className="font-inter text-sm font-medium text-brand-grey">
								Upload slab rough photos similar to the examples below.
							</p>
							<div className="flex gap-2">
								{SlabRoughReferencePhoto?.map((photo, idx) => (
									<div key={idx} className="relative h-24 w-24 overflow-hidden rounded-lg">
										<Image
											src={photo.url}
											alt={`uploaded-${idx}`}
											className="h-full w-full cursor-pointer object-cover"
											width={94}
											height={94}
										/>
									</div>
								))}
							</div>
						</div>
					)}

					<Controller
						name="images"
						control={control}
						render={({ field }) => (
							<ImageUpload value={field.value ?? []} onChange={field.onChange} label={tEmployee.addImages} />
						)}
					/>
					<FormError error={errors.images?.message} />
				</>
			)}

			<Button
				type="submit"
				className="h-11 w-full bg-black text-white hover:bg-black/90"
				disabled={isPending || (jobCompleted === false && showCrew && totalForecastHours <= 0)}
				loading={isPending}
			>
				{tEmployee.submit}
			</Button>
		</form>
	);
}
