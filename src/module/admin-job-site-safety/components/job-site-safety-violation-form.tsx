"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import TimeInput from "@/components/ui/time-input";
import DocumentUpload from "@/components/shared/document-upload/document-upload";
import SearchableSelect from "@/components/common/form/searchable-select";
import { FormInputWrapper } from "@/components/common/form/form-input-wrapper";
import { FormLabelRequired } from "@/components/ui/formLabelrequired";
import { openErrorToast, openSuccessToast } from "@/components/toast";
import { useHandleFileUpload } from "@/hooks/useFile";
import { getTodayDate } from "@/lib/utils/date";
import { routes } from "@/config/routes";
import { MATERIAL_JOB_PHASE_LABEL } from "@/module/employee-safety/utils";
import { buildNoJobAssignmentMessage } from "@/module/employee-safety/utils/job-site-injury-fields";

import {
	useCreateViolation,
	useUpdateViolation,
	useViolationAssignedJobs,
	useViolationEmployees,
} from "../hooks/useAdminJobSiteSafetyViolation";
import { useViolationReportDetail } from "../hooks/useViolationDetail";
import { mapViolationToForm } from "../utils/violation-to-form";
import {
	buildViolationJobSiteField,
	descriptionField,
	locationOnSiteField,
	severityField,
} from "../utils/violation-fields";
import { buildViolationPayload } from "../utils/violation-payload";
import { IViolationSchema, violationRequiredFieldsSchema, violationSchema } from "../utils/violation-schema";

const JobSiteSafetyViolationForm = () => {
	const router = useRouter();
	const searchParams = useSearchParams();
	const violationId = searchParams.get("violationId");

	const [employeeId, setEmployeeId] = useState("");
	// Opened on an existing violation, the record and its job list can already be
	// in the query cache, so the select mounts in the same commit that its value
	// is restored and its trigger keeps showing the placeholder. Remounting it
	// once hydration is done is what makes the saved job site appear.
	const [jobSiteFieldKey, setJobSiteFieldKey] = useState("new-violation");

	const { data: employees } = useViolationEmployees();
	const { data: violation } = useViolationReportDetail(violationId);
	const createViolation = useCreateViolation();
	const updateViolation = useUpdateViolation();

	const { getSignedUrls, getFilesToUpload, handleFileUpload } = useHandleFileUpload();

	const form = useForm<IViolationSchema>({
		resolver: zodResolver(violationSchema),
		defaultValues: {
			jobDailyRecordId: "",
			description: "",
			violationTime: "",
			severity: "",
			locationOnSite: "",
			photos: [],
		},
	});

	const formValues = form.watch();
	const { violationDate } = formValues;

	const { data: assignedJobs, isLoading: isLoadingAssignedJobs } = useViolationAssignedJobs(
		employeeId || undefined,
		violationDate
	);
	const jobSiteOptions = (assignedJobs ?? []).map((job) => ({
		label: [job.jobName, job.jobPhase && MATERIAL_JOB_PHASE_LABEL[job.jobPhase]].filter(Boolean).join(" — "),
		value: job.jobDailyRecordId,
	}));
	const jobSiteField = buildViolationJobSiteField(jobSiteOptions, Boolean(employeeId && violationDate));
	const hasNoJobAssignment =
		Boolean(employeeId && violationDate) && !isLoadingAssignedJobs && jobSiteOptions.length === 0;

	// The job site list is scoped to the selected employee + date, so a previously
	// picked job is no longer valid once either changes. This only reacts to the
	// user actually changing them — an effect watching the pair would also fire
	// while a saved violation is being loaded into the form, since the employee
	// state and form.reset land in separate renders.
	const clearJobSite = () => form.setValue("jobDailyRecordId", "");

	useEffect(() => {
		if (!violation) return;
		setEmployeeId(violation.employeeId ?? "");
		form.reset(mapViolationToForm(violation));
		setJobSiteFieldKey(violation.id);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [violation]);

	const onSubmit = async (data: IViolationSchema) => {
		if (!employeeId) {
			openErrorToast({ message: "Please select an employee" });
			return;
		}

		const validation = violationRequiredFieldsSchema.safeParse(data);
		if (!validation.success) {
			validation.error.issues.forEach((issue) => {
				form.setError(issue.path[0] as keyof IViolationSchema, { type: "custom", message: issue.message });
			});
			openErrorToast({ message: "Please fill required fields" });
			return;
		}

		try {
			const filesToUpload = getFilesToUpload(data.photos ?? []);
			if (filesToUpload.length) {
				const signedUrls = await getSignedUrls(filesToUpload);
				await handleFileUpload({ signedUrls, filesToUpload });
			}

			const payload = buildViolationPayload(data, employeeId);

			if (violationId) {
				await updateViolation.mutateAsync({ id: violationId, payload });
				openSuccessToast("Violation updated");
				router.push(routes.admin.jobSiteSafetyViolationReview(violationId));
				return;
			}

			const created = await createViolation.mutateAsync(payload);
			openSuccessToast("Violation created");
			router.push(routes.admin.jobSiteSafetyViolationReview(created.id));
		} catch (error) {
			openErrorToast({ error: error as Error });
		}
	};

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="space-y-4 rounded-[8px] border-none bg-white p-4 shadow-sm"
			>
				<div className="space-y-1">
					<h4 className="text-sm font-medium text-brand-grey">Create Safety Violation — Job Site</h4>
				</div>

				<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
					<div className="space-y-1">
						<FormLabelRequired
							label="Employee Name"
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
					<FormField
						control={form.control}
						name="violationDate"
						render={({ field }) => (
							<FormItem className="space-y-1">
								<FormLabelRequired
									label="Date"
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
				</div>

				<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
					<div className="space-y-1">
						<FormInputWrapper key={jobSiteFieldKey} form={form} fieldConfig={jobSiteField} />
						{hasNoJobAssignment && (
							<p className="text-xs text-brand-red">{buildNoJobAssignmentMessage(violationDate as Date)}</p>
						)}
					</div>
					<FormField
						control={form.control}
						name="violationTime"
						render={({ field }) => (
							<FormItem className="space-y-1">
								<FormLabel className="mb-2 font-inter text-sm font-normal text-brand-grey">Time</FormLabel>
								<FormControl>
									<TimeInput
										date={violationDate ?? new Date()}
										value={field.value}
										onChange={field.onChange}
										placeholder="HH:MM"
										minuteStep={15}
										className="h-10 rounded-[8px]"
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>
				<FormInputWrapper form={form} fieldConfig={descriptionField} />

				<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
					<FormInputWrapper form={form} fieldConfig={severityField} />
					<FormInputWrapper form={form} fieldConfig={locationOnSiteField} />
				</div>

				<div>
					<p className="mb-1.5 font-inter text-sm font-normal text-brand-grey">Upload Supporting Documents</p>
					<Controller
						name="photos"
						control={form.control}
						render={({ field }) => <DocumentUpload value={field.value ?? []} onChange={field.onChange} />}
					/>
				</div>

				<div className="flex gap-2 pt-2 sm:justify-end">
					<Button type="button" variant="outline" className="flex-1 sm:flex-none" onClick={() => router.back()}>
						Cancel
					</Button>
					<Button
						type="submit"
						variant="filled"
						className="flex-1 sm:flex-none"
						loading={createViolation.isPending || updateViolation.isPending}
					>
						{violationId ? "Save Changes" : "Create Violation"}
					</Button>
				</div>
			</form>
		</Form>
	);
};

export default JobSiteSafetyViolationForm;
