"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Controller, FieldErrors, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import TimeInput from "@/components/ui/time-input";
import { FormLabelRequired } from "@/components/ui/formLabelrequired";
import { FormInputWrapper } from "@/components/common/form/form-input-wrapper";
import BackButton from "@/components/common/back-button";
import { openErrorToast, openSuccessToast } from "@/components/toast";
import { routes } from "@/config/routes";
import useAuthStore from "@/store/auth-store";
import { useHandleFileUpload } from "@/hooks/useFile";
import { cn } from "@/lib/utils/utils";

import { MEDICAL_DRUG_SCREEN, TECHNICIAN_REPORT_STATUS, YES_NO } from "../enums";
import { TECHNICIAN_STATUS_LABEL, toTechnicianStatus } from "../utils/technician-report-status";
import AccidentReportSuccess from "../components/accident-report-success";
import ReportSection from "../components/report-section";
import BcewVehicleInfoSection from "../components/bcew-vehicle-info-section";
import OtherVehicleSection from "../components/other-vehicle-section";
import PoliceSection from "../components/police-section";
import {
	accidentRequiredFieldsSchema,
	accidentSubmitSchema,
	IAccidentReportSchema,
} from "../utils/accident-report-schema";
import { focusFirstError } from "../utils/focus-first-error";
import {
	accidentDateField,
	bcewVehiclePhotosField,
	buildAccidentDetailFields,
	insuranceCorrespondenceField,
	otherVehiclePropertyPhotosField,
	quickQuestionsFields,
	whatHappenedFields,
} from "../utils/accident-report-fields";
import { buildAccidentPayload, collectAccidentImages } from "../utils/accident-report-payload";
import { mapReportToForm } from "../utils/accident-report-to-form";
import {
	useAccidentReport,
	useAssignedVehicle,
	useCreateAccidentDraft,
	useSafetyFormOptions,
	useSubmitAccidentReport,
	useUpdateAccidentDraft,
} from "../hooks/useVehicleAccident";

const NewVehicleAccidentReportTemplate = () => {
	const router = useRouter();
	const searchParams = useSearchParams();
	const draftId = searchParams.get("draftId");
	const { user } = useAuthStore((state) => state);
	const [reportId, setReportId] = useState<string | null>(null);
	const [isSubmitted, setIsSubmitted] = useState(false);

	const { data: formOptions } = useSafetyFormOptions();
	const { data: assignedVehicle } = useAssignedVehicle();
	const { data: draft } = useAccidentReport(draftId);
	const createDraft = useCreateAccidentDraft();
	const updateDraft = useUpdateAccidentDraft();
	const submitReport = useSubmitAccidentReport();
	const { getSignedUrls, getFilesToUpload, handleFileUpload } = useHandleFileUpload();

	const form = useForm<IAccidentReportSchema>({
		resolver: zodResolver(accidentSubmitSchema),
		defaultValues: {
			onJobSite: "",
			anotherVehicleInvolved: "",
			personStruck: "",
			truckNumber: "",
			vin: "",
			licensePlate: "",
			accidentTime: "",
			location: "",
			nearestCrossStreet: "",
			weather: "",
			describeAccident: "",
			damageToBcewVehicle: "",
			damageToOtherProperty: "",
			policeContacted: "",
			medicalDrugScreen: MEDICAL_DRUG_SCREEN.NO_ACTION,
			bcewVehiclePhotos: [],
			otherVehiclePropertyPhotos: [],
			insuranceCorrespondence: [],
			isConfirmedAccurate: false,
		},
	});

	const accidentDetailFields = buildAccidentDetailFields(formOptions?.weatherConditions ?? []);
	const isSaving = createDraft.isPending || updateDraft.isPending;
	const technicianStatus = toTechnicianStatus(draft?.status) ?? TECHNICIAN_REPORT_STATUS.DRAFT;
	const isPendingApproval = technicianStatus === TECHNICIAN_REPORT_STATUS.PENDING;
	const showOtherVehicle = useWatch({ control: form.control, name: "anotherVehicleInvolved" }) === YES_NO.YES;
	const accidentDate = useWatch({ control: form.control, name: "accidentDate" });

	// The confirm checkbox stays disabled until every required field (including the
	// ones gated behind toggles like "police contacted") is filled.
	const watchedValues = useWatch({ control: form.control });
	const isFormComplete = accidentRequiredFieldsSchema.safeParse(watchedValues).success;
	const confirmDisabled = isPendingApproval || !isFormComplete;

	useEffect(() => {
		if (!draft) return;
		setReportId(draft.id);
		form.reset(mapReportToForm(draft));
	}, [draft, form]);

	useEffect(() => {
		if (!assignedVehicle) return;
		form.setValue("truckNumber", assignedVehicle.truckNumber ?? "");
		form.setValue("vin", assignedVehicle.vin ?? "");
		form.setValue("licensePlate", assignedVehicle.licensePlate ?? "");
	}, [assignedVehicle, form]);

	const uploadPendingImages = async (data: IAccidentReportSchema) => {
		const filesToUpload = getFilesToUpload(collectAccidentImages(data));
		if (!filesToUpload.length) return;
		const signedUrls = await getSignedUrls(filesToUpload);
		await handleFileUpload({ signedUrls, filesToUpload });
	};

	const persistDraft = async (): Promise<string> => {
		const values = form.getValues();
		await uploadPendingImages(values);
		const payload = buildAccidentPayload(values);
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
			openSuccessToast("Progress saved.");
		} catch (error) {
			openErrorToast({ error: error as Error });
		}
	};

	const handleUploadDocuments = async () => {
		try {
			await persistDraft();
			openSuccessToast("Documents uploaded.");
		} catch (error) {
			openErrorToast({ error: error as Error });
		}
	};

	const onInvalid = (errors: FieldErrors<IAccidentReportSchema>) => {
		focusFirstError(errors);
	};

	const onSubmit = async (data: IAccidentReportSchema) => {
		try {
			await uploadPendingImages(data);
			const payload = buildAccidentPayload(data);
			const id = reportId ?? (await createDraft.mutateAsync(payload)).id;
			setReportId(id);
			await submitReport.mutateAsync({ id, payload });
			setIsSubmitted(true);
		} catch (error) {
			openErrorToast({ error: error as Error });
		}
	};

	if (isSubmitted) {
		return (
			<AccidentReportSuccess
				onGoHome={() => router.push(routes.employee.dashboard)}
				onCheckStatus={() => router.push(routes.employee.safetyMyRecords)}
			/>
		);
	}

	return (
		<div className="min-h-screen w-full bg-brand-bgLightgrey p-4 pb-24">
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="flex flex-1 flex-col">
					<div className="flex-1 space-y-3 pb-10">
						<div className="flex items-center justify-between">
							<div className="ml-[-10px] flex items-center gap-1">
								<BackButton />
								<h3 className="text-xl font-medium">Accident Report</h3>
							</div>
							<span className="rounded-[6px] bg-brand-dark10 px-3 py-0.5 text-xs font-medium text-brand-dark60">
								{TECHNICIAN_STATUS_LABEL[technicianStatus]}
							</span>
						</div>

						{isPendingApproval && (
							<div className="mb-3 rounded-[8px] bg-[#9A6A001A] p-2 text-sm text-[#9A6A00]">
								This report has been submitted for approval and can no longer be edited. You can still upload supporting
								documents below.
							</div>
						)}
						<ReportSection title="A Few Quick Questions">
							{quickQuestionsFields.map((fieldConfig) => (
								<FormInputWrapper
									key={fieldConfig.name}
									form={form}
									fieldConfig={fieldConfig}
									disabled={isPendingApproval}
									wrapperClassName="space-y-3"
								/>
							))}
						</ReportSection>

						<BcewVehicleInfoSection form={form} disabled={isPendingApproval} />

						<ReportSection title="Employee Information">
							<div className="space-y-4 text-sm">
								<div className="space-y-1">
									<p className="text-sm text-brand-grey">Full Name</p>
									<p className="font-medium text-brand-dark">{user?.name ?? "-"}</p>
								</div>
								<div className="grid grid-cols-2 gap-3">
									<div className="space-y-1">
										<p className="text-sm text-brand-grey">Driver&apos;s License Number</p>
										<p className="font-medium text-brand-dark">{assignedVehicle?.driverLicenseNumber ?? "-"}</p>
									</div>
									<div className="space-y-1">
										<p className="text-sm text-brand-grey">Phone Number</p>
										<p className="font-medium text-brand-dark">{user?.bcewUser?.CellNumber ?? "-"}</p>
									</div>
								</div>
							</div>
						</ReportSection>

						<ReportSection title="When and Where Did the Accident Happen?">
							<div className="grid grid-cols-2 gap-3">
								<FormInputWrapper
									form={form}
									fieldConfig={accidentDateField}
									disabled={isPendingApproval}
									wrapperClassName="space-y-3"
								/>
								<FormField
									control={form.control}
									name="accidentTime"
									render={({ field }) => (
										<FormItem className="space-y-1" data-error-anchor="accidentTime">
											<FormLabelRequired
												htmlFor={field.name}
												label="Time of Accident"
												required
												className="font-inter text-sm font-normal text-brand-grey"
											/>
											<FormControl>
												<TimeInput
													date={accidentDate ?? new Date()}
													value={field.value}
													onChange={field.onChange}
													minuteStep={15}
													placeholder="HH:MM"
													disabled={isPendingApproval}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
							{accidentDetailFields.map((fieldConfig) => (
								<FormInputWrapper
									key={fieldConfig.name}
									form={form}
									fieldConfig={fieldConfig}
									disabled={isPendingApproval}
								/>
							))}
						</ReportSection>

						<ReportSection title="What happened?">
							{whatHappenedFields.map((fieldConfig) => (
								<FormInputWrapper
									key={fieldConfig.name}
									form={form}
									fieldConfig={fieldConfig}
									disabled={isPendingApproval}
								/>
							))}
						</ReportSection>

						<ReportSection title="Required Photos">
							<FormInputWrapper form={form} fieldConfig={bcewVehiclePhotosField} canDelete={!isPendingApproval} />
							<FormInputWrapper
								form={form}
								fieldConfig={otherVehiclePropertyPhotosField}
								canDelete={!isPendingApproval}
							/>
						</ReportSection>

						{showOtherVehicle && <OtherVehicleSection form={form} disabled={isPendingApproval} />}

						<PoliceSection form={form} disabled={isPendingApproval} />

						<ReportSection title="Upload Insurance-Related Documents">
							<FormInputWrapper form={form} fieldConfig={insuranceCorrespondenceField} canDelete={!isPendingApproval} />
						</ReportSection>

						<section className="rounded-[10px] bg-white p-4" data-error-anchor="isConfirmedAccurate">
							<Controller
								name="isConfirmedAccurate"
								control={form.control}
								render={({ field, fieldState }) => (
									<>
										<label
											className={cn(
												"flex items-start gap-2 text-xs",
												confirmDisabled ? "text-brand-grey" : "text-brand-dark"
											)}
										>
											<Checkbox
												checked={field.value}
												onCheckedChange={(checked) => field.onChange(checked === true)}
												disabled={confirmDisabled}
											/>
											<span>
												I confirm the information is accurate. After submitting I can no longer edit this report, but I
												can still upload supporting documents.
											</span>
										</label>
										{fieldState.error && <p className="mt-2 text-xs text-brand-red">{fieldState.error.message}</p>}
									</>
								)}
							/>
						</section>
					</div>

					<div className="fixed bottom-0 left-0 right-0 z-50 space-y-2 bg-white px-4 py-3 shadow-md">
						{isPendingApproval ? (
							<div className="flex gap-2">
								<Button type="button" variant="outline" className="w-full" onClick={() => router.back()}>
									Back
								</Button>
								<Button
									type="button"
									variant="filled"
									className="w-full"
									loading={isSaving}
									onClick={handleUploadDocuments}
								>
									Upload Documents
								</Button>
							</div>
						) : (
							<>
								<Button type="button" className="w-full" loading={isSaving} onClick={handleSaveProgress}>
									Save Progress
								</Button>
								<div className="flex gap-2">
									<Button type="button" variant="outline" className="w-full" onClick={() => router.back()}>
										Cancel
									</Button>
									<Button type="submit" variant="filled" className="w-full" loading={submitReport.isPending}>
										Submit for Approval
									</Button>
								</div>
							</>
						)}
					</div>
				</form>
			</Form>
		</div>
	);
};

export default NewVehicleAccidentReportTemplate;
