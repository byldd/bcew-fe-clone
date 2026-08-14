"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePicker } from "@/components/ui/date-picker";
import TimeInput from "@/components/ui/time-input";
import DocumentUpload from "@/components/shared/document-upload/document-upload";
import SearchableSelect from "@/components/common/form/searchable-select";
import { FormInputWrapper } from "@/components/common/form/form-input-wrapper";
import { FormLabelRequired } from "@/components/ui/formLabelrequired";
import { openErrorToast, openSuccessToast } from "@/components/toast";
import { getTodayDate, toFormattedDate } from "@/lib/utils/date";
import { DATE_FORMAT } from "@/types/date";
import { useHandleFileUpload } from "@/hooks/useFile";
import { routes } from "@/config/routes";
import useAuthStore from "@/store/auth-store";

import ReportSection from "@/module/employee-safety/components/report-section";
import JobSiteInjuryTreatmentLocationSelect from "@/module/employee-safety/components/job-site-injury-treatment-location-select";
import { jobSiteInjurySchema, IJobSiteInjurySchema } from "@/module/employee-safety/utils/job-site-injury-schema";
import {
	doctorsMedicsField,
	equipmentMalfunctionExplainField,
	incidentDetailFields,
	recommendationFields,
} from "@/module/employee-safety/utils/job-site-injury-fields";
import { buildJobSiteInjuryPayload } from "@/module/employee-safety/utils/job-site-injury-payload";
import { mapJobSiteInjuryReportToForm } from "@/module/employee-safety/utils/job-site-injury-report-to-form";
import {
	jobSiteInjuryRequiredFieldsSchema,
	jobSiteInjurySubmitSchema,
} from "@/module/employee-safety/utils/job-site-injury-submit-schema";
import { JOB_SITE_INJURY_MEDICAL_ACTION, SAFETY_REPORT_STATUS, YES_NO } from "@/module/employee-safety/enums";
import { MATERIAL_JOB_PHASE_LABEL } from "@/module/employee-safety/utils";

import YesNoQuestion from "./yes-no-question";
import {
	adminEquipmentMalfunctionField,
	buildAdminJobSiteField,
	drugScreenLocationField,
	medicalTreatmentLocationOtherField,
	withSavedJobSiteOption,
} from "../utils/admin-job-site-injury-fields";
import {
	useActiveEmployees,
	useAdminAssignedJobs,
	useAdminTreatmentLocations,
	useCreateAdminJobSiteInjuryDraft,
	useSubmitAdminJobSiteInjuryReport,
	useUpdateAdminJobSiteInjuryDraft,
} from "../hooks/useAdminJobSiteInjury";
import {
	useApproveInternally,
	useJobSiteInjuryReportDetail,
	useMarkReadyForInsurance,
} from "../hooks/useJobSiteInjuryDetail";
import { JOB_SITE_SAFETY_REVIEWER_ROLE } from "../enums";

const REQUIRED_ANSWER = "This field is required";

const [howInjuryOccurredField, bodyPartInjuredField] = incidentDetailFields as [
	(typeof incidentDetailFields)[number],
	(typeof incidentDetailFields)[number],
];

// Derives the shared `medicalAction` enum from the admin form's two Yes/No
// questions — the backend/shared validation still only understands the
// single enum, so this is the one place that bridges the two shapes.
const deriveMedicalAction = (
	isDrugScreenRequired?: YES_NO,
	isMedicalCareNeeded?: YES_NO
): JOB_SITE_INJURY_MEDICAL_ACTION | "" => {
	if (isDrugScreenRequired === undefined || isMedicalCareNeeded === undefined) return "";

	const drugScreen = isDrugScreenRequired === YES_NO.YES;
	// Only "medical care needed" pulls in the treatment fields — a drug screen on
	// its own has no treatment location, dates or doctors to record.
	if (isMedicalCareNeeded === YES_NO.YES) {
		return drugScreen
			? JOB_SITE_INJURY_MEDICAL_ACTION.TREATMENT_AND_DRUG_SCREEN
			: JOB_SITE_INJURY_MEDICAL_ACTION.TREATMENT_NEEDED;
	}
	return drugScreen ? JOB_SITE_INJURY_MEDICAL_ACTION.DRUG_SCREEN_ONLY : JOB_SITE_INJURY_MEDICAL_ACTION.NO_ACTION;
};

// Reverse of deriveMedicalAction — each of the four combinations maps to its own
// value, so resuming a draft/edit restores exactly what was answered.
const deriveYesNoFromMedicalAction = (medicalAction: string): { drugScreen: YES_NO; medicalCare: YES_NO } => {
	if (medicalAction === JOB_SITE_INJURY_MEDICAL_ACTION.TREATMENT_AND_DRUG_SCREEN) {
		return { drugScreen: YES_NO.YES, medicalCare: YES_NO.YES };
	}
	if (medicalAction === JOB_SITE_INJURY_MEDICAL_ACTION.TREATMENT_NEEDED) {
		return { drugScreen: YES_NO.NO, medicalCare: YES_NO.YES };
	}
	if (medicalAction === JOB_SITE_INJURY_MEDICAL_ACTION.DRUG_SCREEN_ONLY) {
		return { drugScreen: YES_NO.YES, medicalCare: YES_NO.NO };
	}
	return { drugScreen: YES_NO.NO, medicalCare: YES_NO.NO };
};

const JobSiteInjuryRecordForm = () => {
	const router = useRouter();
	const searchParams = useSearchParams();
	const draftId = searchParams.get("draftId");

	const [employeeId, setEmployeeId] = useState("");
	const [reportId, setReportId] = useState<string | null>(null);
	const [isDrugScreenRequired, setIsDrugScreenRequired] = useState<YES_NO>();
	const [isMedicalCareNeeded, setIsMedicalCareNeeded] = useState<YES_NO>();
	const [showMedicalQuestionErrors, setShowMedicalQuestionErrors] = useState(false);
	// Arriving from the Review page, the report and its job list are already in
	// the query cache, so the select mounts in the same commit that its value is
	// restored and its trigger keeps showing the placeholder. Remounting it once
	// hydration is done is what makes the saved job site appear.
	const [jobSiteFieldKey, setJobSiteFieldKey] = useState("new-report");

	const { data: employees } = useActiveEmployees();
	const { data: draft } = useJobSiteInjuryReportDetail(draftId);
	const selectedEmployee = employees?.find((employee) => employee.employeeId === employeeId) ?? null;

	const createDraft = useCreateAdminJobSiteInjuryDraft();
	const updateDraft = useUpdateAdminJobSiteInjuryDraft();
	const submitReport = useSubmitAdminJobSiteInjuryReport();
	const markReadyForInsurance = useMarkReadyForInsurance();
	const approveInternally = useApproveInternally();

	const { user } = useAuthStore((state) => state);
	const canApproveInternally =
		user?.role?.name === JOB_SITE_SAFETY_REVIEWER_ROLE.PRESIDENT ||
		user?.role?.name === JOB_SITE_SAFETY_REVIEWER_ROLE.FLEET_MANAGER;
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
			drugScreenLocation: "",
			immediateAction: "",
			permanentSolution: "",
			photos: [],
			isConfirmedAccurate: false,
		},
	});

	const formValues = form.watch();
	const { equipmentMalfunction, injuryDate, treatmentStartDate, treatmentEndDate, isMedicalTreatmentLocationOther } =
		formValues;
	const isFormComplete =
		jobSiteInjuryRequiredFieldsSchema.safeParse(formValues).success &&
		Boolean(employeeId) &&
		Boolean(equipmentMalfunction) &&
		isDrugScreenRequired !== undefined &&
		isMedicalCareNeeded !== undefined;

	useEffect(() => {
		form.setValue("medicalAction", deriveMedicalAction(isDrugScreenRequired, isMedicalCareNeeded));
	}, [isDrugScreenRequired, isMedicalCareNeeded, form]);

	const { data: assignedJobs } = useAdminAssignedJobs(employeeId || undefined, injuryDate);
	const { data: treatmentLocations } = useAdminTreatmentLocations();
	const jobSiteOptions = (assignedJobs ?? []).map((job) => ({
		label: [job.jobName, job.jobPhase && MATERIAL_JOB_PHASE_LABEL[job.jobPhase]].filter(Boolean).join(" — "),
		value: job.jobDailyRecordId,
	}));
	const jobSiteField = buildAdminJobSiteField(
		withSavedJobSiteOption(jobSiteOptions, draft?.jobDailyRecordId, draft?.jobSiteName),
		Boolean(employeeId && injuryDate)
	);

	// The job site list is scoped to the selected employee + injury date, so a
	// previously picked job is no longer valid once either changes. This only
	// reacts to the user actually changing them — an effect watching the pair
	// would also fire while a saved report is being loaded into the form, since
	// the employee state and form.reset land in separate renders.
	const clearJobSite = () => form.setValue("jobDailyRecordId", "");

	useEffect(() => {
		if (!draft) return;
		setReportId(draft.id);
		setEmployeeId(draft.employeeId ?? "");
		const { drugScreen, medicalCare } = deriveYesNoFromMedicalAction(draft.medicalAction);
		setIsDrugScreenRequired(drugScreen);
		setIsMedicalCareNeeded(medicalCare);
		form.reset(mapJobSiteInjuryReportToForm(draft));
		setJobSiteFieldKey(draft.id);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [draft]);

	const uploadPendingImages = async (data: IJobSiteInjurySchema) => {
		const filesToUpload = getFilesToUpload(data.photos ?? []);
		if (!filesToUpload.length) return;
		const signedUrls = await getSignedUrls(filesToUpload);
		await handleFileUpload({ signedUrls, filesToUpload });
	};

	const persistDraft = async (): Promise<string> => {
		const values = form.getValues();
		await uploadPendingImages(values);
		const payload = { ...buildJobSiteInjuryPayload(values), employeeId };
		if (reportId) {
			await updateDraft.mutateAsync({ id: reportId, payload });
			return reportId;
		}
		const created = await createDraft.mutateAsync(payload);
		setReportId(created.id);
		return created.id;
	};

	const handleSaveProgress = async () => {
		if (!employeeId) {
			openErrorToast({ message: "Please select an employee" });
			return;
		}
		try {
			await persistDraft();
			openSuccessToast("Progress saved");
			router.push(routes.admin.jobSiteSafetyDashboard);
		} catch (error) {
			openErrorToast({ error: error as Error });
		}
	};

	// Editing an already-submitted report (via "Edit Report" on the Review
	// page) saves changes in place — it never re-submits, since the report is
	// already past the draft stage.
	const isEditingSubmittedReport = draft?.status !== undefined && draft.status !== SAFETY_REPORT_STATUS.DRAFT;

	const isSubmittable = (data: IJobSiteInjurySchema): boolean => {
		if (!employeeId) {
			openErrorToast({ message: "Please select an employee" });
			return false;
		}
		// These three answers are required on the admin form but not by the shared
		// schema, so they're checked alongside it and reported the same way — one
		// toast, errors on whichever fields are missing.
		const areMedicalQuestionsAnswered = isDrugScreenRequired !== undefined && isMedicalCareNeeded !== undefined;
		setShowMedicalQuestionErrors(!areMedicalQuestionsAnswered);

		if (!data.equipmentMalfunction) {
			form.setError("equipmentMalfunction", { type: "custom", message: REQUIRED_ANSWER });
		}

		const validation = jobSiteInjurySubmitSchema.safeParse(data);
		if (!validation.success) {
			validation.error.issues.forEach((issue) => {
				form.setError(issue.path[0] as keyof IJobSiteInjurySchema, { type: "custom", message: issue.message });
			});
		}

		if (!validation.success || !areMedicalQuestionsAnswered || !data.equipmentMalfunction) {
			openErrorToast({ message: "Please fill required fields" });
			return false;
		}

		return true;
	};

	// The extra footer buttons submit the report and immediately apply the Review
	// page's action, so an admin doesn't have to open the Review page for a
	// decision they already made while filling the form in.
	const submitWithAction = async (
		data: IJobSiteInjurySchema,
		followUp?: { run: (id: string) => Promise<unknown>; message: string }
	) => {
		if (!isSubmittable(data)) return;

		try {
			await uploadPendingImages(data);

			if (isEditingSubmittedReport) {
				const savedId = await persistDraft();
				openSuccessToast("Changes saved");
				router.push(routes.admin.jobSiteSafetyInjuryReview(savedId));
				return;
			}

			const payload = { ...buildJobSiteInjuryPayload(data), employeeId };
			const id = reportId ?? (await createDraft.mutateAsync(payload)).id;
			setReportId(id);
			await submitReport.mutateAsync({ id, payload });
			if (followUp) await followUp.run(id);
			openSuccessToast(followUp?.message ?? "Job Site Injury report created");
			router.push(routes.admin.jobSiteSafetyInjuryReview(id));
		} catch (error) {
			openErrorToast({ error: error as Error });
		}
	};

	const onSubmit = (data: IJobSiteInjurySchema) => submitWithAction(data);

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 rounded-[8px] bg-white p-2 shadow-sm">
				<ReportSection title="Employee Information">
					<div className="space-y-1 py-1">
						<FormLabelRequired
							label="Select Employee"
							required
							className="mb-1.5 font-inter text-sm font-normal text-brand-grey"
						/>
						<SearchableSelect
							value={employeeId}
							onChange={(value) => {
								setEmployeeId(value);
								clearJobSite();
							}}
							placeholder="Select Employee"
							options={(employees ?? []).map((employee) => ({ label: employee.name, value: employee.employeeId }))}
						/>
					</div>

					<div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
						<div className="space-y-1">
							<p className="text-brand-grey">Occupation</p>
							<p className="font-medium text-brand-dark">{selectedEmployee?.occupation ?? "-"}</p>
						</div>
						<div className="space-y-1">
							<p className="text-brand-grey">Phone Number</p>
							<p className="font-medium text-brand-dark">{selectedEmployee?.cellPhone ?? "-"}</p>
						</div>
						<div className="space-y-1">
							<p className="text-brand-grey">Date of Birth</p>
							<p className="font-medium text-brand-dark">
								{selectedEmployee?.dateOfBirth
									? toFormattedDate(selectedEmployee.dateOfBirth, DATE_FORMAT.MM_SLASH_DD_YYYY)
									: "-"}
							</p>
						</div>
						<div className="space-y-1">
							<p className="text-brand-grey">Date of Hire</p>
							<p className="font-medium text-brand-dark">
								{selectedEmployee?.hireDate
									? toFormattedDate(selectedEmployee.hireDate, DATE_FORMAT.MM_SLASH_DD_YYYY)
									: "-"}
							</p>
						</div>
					</div>
				</ReportSection>

				<ReportSection title="Incident Details">
					<div className="grid grid-cols-1 gap-3 py-1 sm:grid-cols-2">
						<FormField
							control={form.control}
							name="injuryDate"
							render={({ field }) => (
								<FormItem className="space-y-1">
									<FormLabelRequired
										label="Date of Injury"
										required
										htmlFor={field.name}
										className="font-inter text-sm font-normal text-brand-grey"
									/>
									<FormControl>
										<DatePicker
											value={field.value}
											onChange={(date) => {
												field.onChange(date);
												clearJobSite();
											}}
											placeholder="MM/DD/YYYY"
											disabledDate={{ after: getTodayDate() }}
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
										label="Time of Injury"
										required
										htmlFor={field.name}
										className="font-inter text-sm font-normal text-brand-grey"
									/>
									<FormControl>
										<TimeInput
											date={injuryDate ?? new Date()}
											value={field.value}
											onChange={field.onChange}
											placeholder="HH:MM"
											minuteStep={15}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>

					<FormInputWrapper key={jobSiteFieldKey} form={form} fieldConfig={jobSiteField} />

					<FormInputWrapper form={form} fieldConfig={howInjuryOccurredField} />

					<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
						<FormInputWrapper form={form} fieldConfig={bodyPartInjuredField} />
						<FormInputWrapper form={form} fieldConfig={adminEquipmentMalfunctionField} />
					</div>
					{equipmentMalfunction === YES_NO.YES && (
						<FormInputWrapper form={form} fieldConfig={equipmentMalfunctionExplainField} />
					)}
				</ReportSection>

				<ReportSection title="Medical & Drug Screen">
					<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
						<YesNoQuestion
							label="Is a Drug Screen Required?"
							value={isDrugScreenRequired}
							onChange={setIsDrugScreenRequired}
							error={showMedicalQuestionErrors && isDrugScreenRequired === undefined ? REQUIRED_ANSWER : undefined}
						/>
						<YesNoQuestion
							label="Is Medical Care Needed?"
							value={isMedicalCareNeeded}
							onChange={setIsMedicalCareNeeded}
							error={showMedicalQuestionErrors && isMedicalCareNeeded === undefined ? REQUIRED_ANSWER : undefined}
						/>
					</div>

					<div className="grid grid-cols-1 gap-3 sm:grid-cols-4 sm:items-end">
						<div className="sm:col-span-2">
							{isDrugScreenRequired === YES_NO.YES && (
								<FormInputWrapper form={form} fieldConfig={drugScreenLocationField} />
							)}
						</div>

						{isMedicalCareNeeded === YES_NO.YES && (
							<>
								<JobSiteInjuryTreatmentLocationSelect form={form} locations={treatmentLocations ?? []} hideOtherInput />

								<FormField
									control={form.control}
									name="treatmentStartDate"
									render={() => (
										<FormItem className="gap-1.5">
											<FormLabelRequired
												label="Dates of Treatment"
												required
												htmlFor="treatmentStartDate"
												className="font-inter text-sm font-normal text-brand-grey"
											/>
											<FormControl>
												<DatePicker
													mode="range"
													required={false}
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

								{isMedicalTreatmentLocationOther && (
									<FormInputWrapper
										form={form}
										fieldConfig={medicalTreatmentLocationOtherField}
										wrapperClassName="sm:col-start-3 sm:col-span-2"
									/>
								)}

								<FormInputWrapper
									form={form}
									fieldConfig={doctorsMedicsField}
									wrapperClassName="sm:col-start-3 sm:col-span-2"
								/>
							</>
						)}
					</div>
				</ReportSection>

				<ReportSection title="Recommendations">
					{recommendationFields.map((fieldConfig) => (
						<FormInputWrapper key={fieldConfig.name} form={form} fieldConfig={fieldConfig} />
					))}
				</ReportSection>

				<ReportSection title="Documents">
					<Controller
						name="photos"
						control={form.control}
						render={({ field }) => <DocumentUpload value={field.value ?? []} onChange={field.onChange} />}
					/>
				</ReportSection>

				<section className="rounded-xl bg-white p-4">
					<Controller
						name="isConfirmedAccurate"
						control={form.control}
						render={({ field, fieldState }) => (
							<div className="space-y-1">
								<label className="flex items-start gap-2 text-xs text-brand-dark60">
									<Checkbox
										checked={field.value}
										disabled={!isFormComplete}
										onCheckedChange={(checked) => field.onChange(checked === true)}
									/>
									<span>I confirm the information is accurate.</span>
								</label>
								{fieldState.error && <p className="text-xs text-brand-red">{fieldState.error.message}</p>}
							</div>
						)}
					/>
				</section>

				<div className="flex flex-col gap-2 pb-4 sm:flex-row sm:flex-wrap sm:justify-start">
					{/* Cancel + Save Progress share one row, split evenly, so mobile has no dangling gap */}
					<div className="flex gap-2">
						<Button type="button" variant="outline" className="flex-1 sm:flex-none" onClick={() => router.back()}>
							Cancel
						</Button>
						{!isEditingSubmittedReport && (
							<Button
								type="button"
								variant="outline"
								className="flex-1 sm:flex-none"
								loading={isSaving}
								onClick={handleSaveProgress}
							>
								Save Progress
							</Button>
						)}
					</div>
					{!isEditingSubmittedReport && (
						<>
							<Button
								type="button"
								variant="outline"
								className="w-full sm:w-auto"
								loading={markReadyForInsurance.isPending}
								onClick={form.handleSubmit((data) =>
									submitWithAction(data, {
										run: (id) => markReadyForInsurance.mutateAsync(id),
										message: "Report marked ready for insurance",
									})
								)}
							>
								Mark for President&apos;s Review
							</Button>
							{canApproveInternally && (
								<Button
									type="button"
									variant="filled"
									className="w-full sm:w-auto"
									loading={approveInternally.isPending}
									onClick={form.handleSubmit((data) =>
										submitWithAction(data, {
											run: (id) => approveInternally.mutateAsync(id),
											message: "Claim resolved internally",
										})
									)}
								>
									Claim Resolved
								</Button>
							)}
						</>
					)}
					<Button
						type="submit"
						variant="filled"
						className="w-full sm:w-auto"
						loading={isEditingSubmittedReport ? isSaving : submitReport.isPending}
					>
						{isEditingSubmittedReport ? "Save Changes" : "Create Report"}
					</Button>
				</div>
			</form>
		</Form>
	);
};

export default JobSiteInjuryRecordForm;
