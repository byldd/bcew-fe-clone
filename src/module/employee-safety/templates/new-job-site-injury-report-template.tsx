"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePicker } from "@/components/ui/date-picker";
import TimeInput from "@/components/ui/time-input";
import DocumentUpload from "@/components/shared/document-upload/document-upload";
import { FormInputWrapper } from "@/components/common/form/form-input-wrapper";
import BackButton from "@/components/common/back-button";
import { openErrorToast, openSuccessToast } from "@/components/toast";
import { toFormattedDate } from "@/lib/utils/date";
import { DATE_FORMAT } from "@/types/date";
import useAuthStore from "@/store/auth-store";
import { useHandleFileUpload } from "@/hooks/useFile";

import ReportSection from "../components/report-section";
import JobSiteInjurySuccess from "../components/job-site-injury-success";
import JobSiteInjuryTreatmentLocationSelect from "../components/job-site-injury-treatment-location-select";
import { jobSiteInjurySchema, IJobSiteInjurySchema } from "../utils/job-site-injury-schema";
import {
	buildJobSiteField,
	doctorsMedicsField,
	equipmentMalfunctionExplainField,
	equipmentMalfunctionField,
	incidentDetailFields,
	medicalActionField,
	recommendationFields,
} from "../utils/job-site-injury-fields";
import { buildJobSiteInjuryPayload } from "../utils/job-site-injury-payload";
import { mapJobSiteInjuryReportToForm } from "../utils/job-site-injury-report-to-form";
import { jobSiteInjuryRequiredFieldsSchema, jobSiteInjurySubmitSchema } from "../utils/job-site-injury-submit-schema";
import {
	useAssignedJobs,
	useCreateJobSiteInjuryDraft,
	useJobSiteInjuryReport,
	useSubmitJobSiteInjuryReport,
	useUpdateJobSiteInjuryDraft,
} from "../hooks/useJobSiteInjury";
import { useMedicalTreatmentLocations } from "../hooks/useVehicleAccident";
import { JOB_SITE_INJURY_MEDICAL_ACTION, SAFETY_REPORT_STATUS, YES_NO } from "../enums";
import { MATERIAL_JOB_PHASE_LABEL } from "../utils";
import { FormLabelRequired } from "@/components/ui/formLabelrequired";

const NewJobSiteInjuryReportTemplate = () => {
	const router = useRouter();
	const searchParams = useSearchParams();
	const draftId = searchParams.get("draftId");
	const { user } = useAuthStore((state) => state);
	const [reportId, setReportId] = useState<string | null>(null);
	const [isSubmitted, setIsSubmitted] = useState(false);

	const { data: draft } = useJobSiteInjuryReport(draftId);
	const createDraft = useCreateJobSiteInjuryDraft();
	const updateDraft = useUpdateJobSiteInjuryDraft();
	const submitReport = useSubmitJobSiteInjuryReport();
	const { getSignedUrls, getFilesToUpload, handleFileUpload } = useHandleFileUpload();
	const isSaving = createDraft.isPending || updateDraft.isPending;

	const form = useForm<IJobSiteInjurySchema>({
		resolver: zodResolver(jobSiteInjurySchema),
		defaultValues: {
			injuryTime: "",
			jobDailyRecordId: "",
			howInjuryOccurred: "",
			bodyPartInjured: "",
			equipmentMalfunction: "",
			equipmentMalfunctionExplain: "",
			medicalAction: "",
			medicalTreatmentLocation: "",
			isMedicalTreatmentLocationOther: false,
			doctorsMedics: "",
			immediateAction: "",
			permanentSolution: "",
			photos: [],
			isConfirmedAccurate: false,
		},
	});

	const formValues = form.watch();
	const { equipmentMalfunction, medicalAction, injuryDate, treatmentStartDate, treatmentEndDate } = formValues;
	const isFormComplete = jobSiteInjuryRequiredFieldsSchema.safeParse(formValues).success;
	// Once submitted, the report is frozen — the technician can only attach more
	// supporting photos, not edit any field or remove an already-uploaded one.
	const isReadOnly = draft?.status === SAFETY_REPORT_STATUS.SUBMITTED;

	const { data: assignedJobs } = useAssignedJobs(injuryDate);
	const { data: treatmentLocations } = useMedicalTreatmentLocations();
	const jobSiteOptions = (assignedJobs ?? []).map((job) => ({
		label: [job.jobName, job.jobPhase && MATERIAL_JOB_PHASE_LABEL[job.jobPhase]].filter(Boolean).join(" — "),
		value: job.jobDailyRecordId,
	}));
	const jobSiteField = buildJobSiteField(jobSiteOptions, Boolean(injuryDate));
	// A job restored from a draft can briefly have no matching option yet (the
	// assigned-jobs list for that date hasn't loaded/refreshed), and the Select
	// won't pick up a label added after it first mounted — remounting once a
	// match actually appears guarantees it shows correctly regardless of how
	// long that takes.
	const hasMatchingJobSite =
		!formValues.jobDailyRecordId || jobSiteOptions.some((option) => option.value === formValues.jobDailyRecordId);

	// The job site list is scoped to the selected injury date, so a previously
	// picked job may no longer be valid once the date changes. Skipped right
	// after a draft loads, since that reset also changes `injuryDate` and would
	// otherwise wipe out the job site the draft just restored.
	const isHydratingDraft = useRef(false);

	useEffect(() => {
		if (isHydratingDraft.current) {
			isHydratingDraft.current = false;
			return;
		}
		form.setValue("jobDailyRecordId", "");
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [injuryDate]);

	useEffect(() => {
		if (!draft) return;
		isHydratingDraft.current = true;
		setReportId(draft.id);
		form.reset(mapJobSiteInjuryReportToForm(draft));
	}, [draft, form]);

	const uploadPendingImages = async (data: IJobSiteInjurySchema) => {
		const filesToUpload = getFilesToUpload(data.photos ?? []);
		if (!filesToUpload.length) return;
		const signedUrls = await getSignedUrls(filesToUpload);
		await handleFileUpload({ signedUrls, filesToUpload });
	};

	const persistDraft = async (): Promise<string> => {
		const values = form.getValues();
		await uploadPendingImages(values);
		const payload = buildJobSiteInjuryPayload(values);
		if (reportId) {
			await updateDraft.mutateAsync({ id: reportId, payload });
			return reportId;
		}
		const created = await createDraft.mutateAsync(payload);
		setReportId(created.id);
		return created.id;
	};

	const handleSaveProgress = async () => {
		try {
			await persistDraft();
			openSuccessToast(isReadOnly ? "Document uploaded" : "Progress saved");
		} catch (error) {
			openErrorToast({ error: error as Error });
		}
	};

	const onSubmit = async (data: IJobSiteInjurySchema) => {
		const validation = jobSiteInjurySubmitSchema.safeParse(data);
		if (!validation.success) {
			validation.error.issues.forEach((issue) => {
				form.setError(issue.path[0] as keyof IJobSiteInjurySchema, { type: "custom", message: issue.message });
			});
			openErrorToast({ message: "Please fill required fields" });
			return;
		}

		try {
			await uploadPendingImages(data);
			const payload = buildJobSiteInjuryPayload(data);
			const id = reportId ?? (await createDraft.mutateAsync(payload)).id;
			setReportId(id);
			await submitReport.mutateAsync({ id, payload });
			setIsSubmitted(true);
		} catch (error) {
			openErrorToast({ error: error as Error });
		}
	};

	if (isSubmitted && reportId) return <JobSiteInjurySuccess />;

	return (
		<div className="min-h-screen w-full bg-brand-bgLightgrey p-4">
			<div className="mb-3 flex items-center justify-between">
				<div className="ml-[-10px] flex items-center gap-1">
					<BackButton />
					<h3 className="text-xl font-medium">Report Job Site Injury</h3>
				</div>
				<span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs text-brand-dark60">
					{draft?.status === SAFETY_REPORT_STATUS.SUBMITTED ? "Pending" : "Draft"}
				</span>
			</div>

			{isReadOnly && (
				<div className="mb-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
					This report has been submitted for approval and can no longer be edited. You can still upload supporting
					documents below.
				</div>
			)}

			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 pb-32">
					<ReportSection title="Employee Information">
						<div className="space-y-3 text-sm">
							<div>
								<p className="text-brand-grey">Full Name</p>
								<p className="font-medium text-brand-dark">{user?.name ?? user?.bcewUser?.EmployeeName ?? "—"}</p>
							</div>
							<div className="grid grid-cols-2 gap-3">
								<div>
									<p className="text-brand-grey">Occupation</p>
									<p className="font-medium text-brand-dark">{user?.bcewUser?.Class ?? "—"}</p>
								</div>
								<div>
									<p className="text-brand-grey">Phone Number</p>
									<p className="font-medium text-brand-dark">{user?.phone ?? user?.bcewUser?.CellNumber ?? "—"}</p>
								</div>
								<div>
									<p className="text-brand-grey">Date of Birth</p>
									<p className="font-medium text-brand-dark">
										{user?.bcewUser?.employee?.dtebth
											? toFormattedDate(user.bcewUser.employee.dtebth, DATE_FORMAT.MM_SLASH_DD_YYYY)
											: "—"}
									</p>
								</div>
								<div>
									<p className="text-brand-grey">Date of Hire</p>
									<p className="font-medium text-brand-dark">
										{user?.bcewUser?.HireDate
											? toFormattedDate(user.bcewUser.HireDate, DATE_FORMAT.MM_SLASH_DD_YYYY)
											: "—"}
									</p>
								</div>
							</div>
						</div>
					</ReportSection>

					<ReportSection title="Incident Details">
						<div className="grid grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="injuryDate"
								render={({ field }) => (
									<FormItem className="space-y-1">
										<FormLabelRequired
											htmlFor={field.name}
											label="Date of Injury"
											required
											className="font-inter text-sm font-normal text-brand-grey"
										/>
										<FormControl>
											<DatePicker
												value={field.value}
												onChange={field.onChange}
												placeholder="MM/DD/YY"
												disabled={isReadOnly}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="injuryTime"
								render={({ field }) => (
									<FormItem className="space-y-1">
										<FormLabelRequired
											htmlFor={field.name}
											label="Time of Injury"
											required
											className="font-inter text-sm font-normal text-brand-grey"
										/>
										<FormControl>
											<TimeInput
												date={injuryDate ?? new Date()}
												value={field.value}
												onChange={field.onChange}
												minuteStep={15}
												disabled={isReadOnly}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<FormInputWrapper
							key={hasMatchingJobSite ? "matched" : "unmatched"}
							form={form}
							fieldConfig={jobSiteField}
							disabled={isReadOnly}
						/>

						{incidentDetailFields.map((fieldConfig) => (
							<FormInputWrapper key={fieldConfig.name} form={form} fieldConfig={fieldConfig} disabled={isReadOnly} />
						))}

						<FormInputWrapper form={form} fieldConfig={equipmentMalfunctionField} disabled={isReadOnly} />
						{equipmentMalfunction === YES_NO.YES && (
							<FormInputWrapper form={form} fieldConfig={equipmentMalfunctionExplainField} disabled={isReadOnly} />
						)}
					</ReportSection>

					<ReportSection title="Medical Details">
						<FormInputWrapper form={form} fieldConfig={medicalActionField} disabled={isReadOnly} />

						{(medicalAction === JOB_SITE_INJURY_MEDICAL_ACTION.TREATMENT_NEEDED ||
							medicalAction === JOB_SITE_INJURY_MEDICAL_ACTION.TREATMENT_AND_DRUG_SCREEN) && (
							<>
								<JobSiteInjuryTreatmentLocationSelect
									form={form}
									locations={treatmentLocations ?? []}
									disabled={isReadOnly}
								/>

								<FormField
									control={form.control}
									name="treatmentStartDate"
									render={() => (
										<FormItem className="space-y-1">
											<FormLabelRequired
												label="Dates of Treatment"
												required
												className="font-inter text-sm font-normal text-brand-grey"
											/>
											<FormControl>
												<DatePicker
													mode="range"
													required={false}
													disabled={isReadOnly}
													selected={{ from: treatmentStartDate, to: treatmentEndDate }}
													onSelect={(range) => {
														form.setValue("treatmentStartDate", range?.from);
														form.setValue("treatmentEndDate", range?.to ?? range?.from);
													}}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormInputWrapper form={form} fieldConfig={doctorsMedicsField} disabled={isReadOnly} />
							</>
						)}
					</ReportSection>

					<ReportSection title="Recommendations">
						{recommendationFields.map((fieldConfig) => (
							<FormInputWrapper key={fieldConfig.name} form={form} fieldConfig={fieldConfig} disabled={isReadOnly} />
						))}
					</ReportSection>

					<ReportSection title="Documents">
						<Controller
							name="photos"
							control={form.control}
							render={({ field }) => (
								<DocumentUpload value={field.value ?? []} onChange={field.onChange} canDelete={!isReadOnly} />
							)}
						/>
					</ReportSection>

					<section className="rounded-xl border bg-white p-4">
						<Controller
							name="isConfirmedAccurate"
							control={form.control}
							render={({ field, fieldState }) => (
								<div className="space-y-1">
									<label className="flex items-start gap-2 text-xs font-medium text-brand-dark">
										<Checkbox
											checked={field.value}
											disabled={!isFormComplete || isReadOnly}
											onCheckedChange={(checked) => field.onChange(checked === true)}
										/>
										<span>
											I confirm the information is accurate. I can update this report until an admin closes it.
										</span>
									</label>
									{fieldState.error && <p className="text-xs text-brand-red">{fieldState.error.message}</p>}
								</div>
							)}
						/>
					</section>

					<div className="fixed bottom-0 left-0 right-0 z-50 space-y-2 bg-white px-4 py-3 shadow-md">
						{!isReadOnly && (
							<Button type="button" className="w-full" loading={isSaving} onClick={handleSaveProgress}>
								Save Progress
							</Button>
						)}
						<div className="flex gap-2">
							<Button type="button" variant="outline" className="w-full" onClick={() => router.back()}>
								{isReadOnly ? "Back" : "Cancel"}
							</Button>
							{isReadOnly ? (
								<Button
									type="button"
									variant="filled"
									className="w-full"
									loading={isSaving}
									onClick={handleSaveProgress}
								>
									Upload Document
								</Button>
							) : (
								<Button type="submit" variant="filled" className="w-full" loading={submitReport.isPending}>
									Submit for Approval
								</Button>
							)}
						</div>
					</div>
				</form>
			</Form>
		</div>
	);
};

export default NewJobSiteInjuryReportTemplate;
