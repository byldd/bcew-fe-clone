"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Controller, FieldErrors, Resolver, useForm, useWatch } from "react-hook-form";
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

import { ACCIDENT_SECTION, MEDICAL_DRUG_SCREEN, TECHNICIAN_REPORT_STATUS, YES_NO } from "../enums";
import { TECHNICIAN_STATUS_LABEL, toTechnicianStatus } from "../utils/technician-report-status";
import { parseRequestedSections } from "../utils/requested-sections";
import AccidentReportSuccess from "../components/accident-report-success";
import ReportSection from "../components/report-section";
import BcewVehicleInfoSection from "../components/bcew-vehicle-info-section";
import OtherVehiclesSection from "../components/other-vehicles-section";
import PersonStruckSection from "../components/person-struck-section";
import PoliceSection from "../components/police-section";
import FollowUpQuestionsSection from "../components/follow-up-questions-section";
import {
	accidentRequiredFieldsSchema,
	accidentSubmitSchema,
	buildAirSubmitSchema,
	IAccidentReportSchema,
} from "../utils/accident-report-schema";
import { focusFirstError } from "../utils/focus-first-error";
import {
	accidentDateField,
	bcewVehiclePhotosField,
	buildAccidentDetailFields,
	impoundLotCostField,
	impoundReleaseChargesField,
	insuranceCorrespondenceField,
	jobSiteTypeField,
	numberOfVehiclesField,
	onJobSiteField,
	otherVehiclePropertyPhotosField,
	otherVehicleTowCostField,
	quickQuestionsFields,
	towCostOnSpotField,
	towProviderNameField,
	towToggleFields,
	whatHappenedFields,
} from "../utils/accident-report-fields";
import { buildAccidentPayload, collectAccidentImages } from "../utils/accident-report-payload";
import { mapReportToForm } from "../utils/accident-report-to-form";
import { getAccidentSectionVisibility } from "../utils/accident-section-visibility";
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

	// When the technician is completing an admin "ask" request, only the requested
	// sections are validated on submit; the resolver reads this ref at submit time.
	const airSectionsRef = useRef<Set<ACCIDENT_SECTION> | null>(null);

	// Skips the police auto-select on the render right after a saved draft is hydrated,
	// so a technician's previously chosen answer isn't overwritten on load.
	const skipPoliceAutofill = useRef(false);
	const resolver: Resolver<IAccidentReportSchema> = (values, context, options) => {
		const schema = airSectionsRef.current ? buildAirSubmitSchema(airSectionsRef.current) : accidentSubmitSchema;
		return zodResolver(schema)(values, context, options);
	};

	const form = useForm<IAccidentReportSchema>({
		resolver,
		defaultValues: {
			onJobSite: "",
			jobSiteType: "",
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
			policeContacted: "",
			medicalDrugScreen: MEDICAL_DRUG_SCREEN.NO_ACTION,
			personInvolved: {},
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
	const isAdditionalInfoRequested = technicianStatus === TECHNICIAN_REPORT_STATUS.ADDITIONAL_INFO_REQUESTED;
	// Approved/rejected reports are read-only: the technician can view them but every
	// field is locked and no action buttons are shown.
	const isClosed =
		technicianStatus === TECHNICIAN_REPORT_STATUS.APPROVED || technicianStatus === TECHNICIAN_REPORT_STATUS.REJECTED;
	const accidentDate = useWatch({ control: form.control, name: "accidentDate" });

	const requestedSections = useMemo(() => parseRequestedSections(draft?.requestedSections), [draft?.requestedSections]);

	useEffect(() => {
		airSectionsRef.current = isAdditionalInfoRequested ? requestedSections : null;
	}, [isAdditionalInfoRequested, requestedSections]);

	// In ask-mode a section is editable only if the admin requested it; otherwise the
	// whole form follows the normal draft/pending editability.
	const disabledFor = (section?: ACCIDENT_SECTION): boolean =>
		isClosed ? true : isAdditionalInfoRequested ? !section || !requestedSections.has(section) : isPendingApproval;

	const highlightFor = (section: ACCIDENT_SECTION): string =>
		isAdditionalInfoRequested && requestedSections.has(section)
			? "overflow-hidden rounded-[10px] ring-2 ring-brand-dark"
			: "";

	// Uploads stay addable in the pending state (technicians can still attach supporting
	// documents) — only ask-mode sections that weren't requested block them.
	const uploadDisabledFor = (section?: ACCIDENT_SECTION): boolean =>
		isClosed ? true : isAdditionalInfoRequested ? !section || !requestedSections.has(section) : false;
	const uploadCanDelete = (section?: ACCIDENT_SECTION): boolean => !isPendingApproval && !uploadDisabledFor(section);

	// The confirm checkbox stays disabled until every required field (including the
	// ones gated behind toggles like "police contacted") is filled.
	const watchedValues = useWatch({ control: form.control });
	const isFormComplete = accidentRequiredFieldsSchema.safeParse(watchedValues).success;
	const confirmDisabled = isPendingApproval || !isFormComplete;

	const sections = getAccidentSectionVisibility(watchedValues);

	useEffect(() => {
		if (!draft) return;
		setReportId(draft.id);
		skipPoliceAutofill.current = true;
		form.reset(mapReportToForm(draft));
	}, [draft, form]);

	useEffect(() => {
		if (!assignedVehicle) return;
		form.setValue("truckNumber", assignedVehicle.truckNumber ?? "");
		form.setValue("vin", assignedVehicle.vin ?? "");
		form.setValue("licensePlate", assignedVehicle.licensePlate ?? "");
	}, [assignedVehicle, form]);

	// "Were police contacted?" is auto-set from the scenario: Yes when another vehicle was
	// involved or a person was struck (scenarios 2–5), No otherwise (scenario 1). Submitted
	// reports are left untouched, and a loaded draft keeps its saved value until edited.
	useEffect(() => {
		if (isClosed || isPendingApproval) return;
		if (skipPoliceAutofill.current) {
			skipPoliceAutofill.current = false;
			return;
		}
		const anotherVehicle = watchedValues.anotherVehicleInvolved === YES_NO.YES;
		const personStruck = watchedValues.personStruck === YES_NO.YES;
		form.setValue("policeContacted", anotherVehicle || personStruck ? YES_NO.YES : YES_NO.NO);
	}, [watchedValues.anotherVehicleInvolved, watchedValues.personStruck, isClosed, isPendingApproval, form]);

	const scrolledDraftRef = useRef<string | null>(null);
	useEffect(() => {
		if (!isAdditionalInfoRequested || !draft || scrolledDraftRef.current === draft.id) return;
		const firstRequested = document.querySelector(".ring-brand-dark");
		if (!firstRequested) return;
		scrolledDraftRef.current = draft.id;
		firstRequested.scrollIntoView({ behavior: "smooth", block: "center" });
	}, [isAdditionalInfoRequested, draft, watchedValues]);

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
							<FormInputWrapper
								form={form}
								fieldConfig={onJobSiteField}
								disabled={disabledFor()}
								wrapperClassName="space-y-3"
							/>
							{watchedValues.onJobSite === YES_NO.YES && (
								<FormInputWrapper
									form={form}
									fieldConfig={jobSiteTypeField}
									disabled={disabledFor()}
									wrapperClassName="space-y-3"
								/>
							)}
							{quickQuestionsFields.map((fieldConfig) => (
								<Fragment key={fieldConfig.name}>
									<FormInputWrapper
										form={form}
										fieldConfig={fieldConfig}
										disabled={disabledFor()}
										wrapperClassName="space-y-3"
									/>
									{fieldConfig.name === "anotherVehicleInvolved" &&
										watchedValues.anotherVehicleInvolved === YES_NO.YES && (
											<FormInputWrapper form={form} fieldConfig={numberOfVehiclesField} disabled={disabledFor()} />
										)}
								</Fragment>
							))}
						</ReportSection>

						{sections.truckInfo && <BcewVehicleInfoSection form={form} disabled={disabledFor()} />}

						{sections.employeeInfo && (
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
						)}

						<div className={highlightFor(ACCIDENT_SECTION.ACCIDENT_DETAILS)}>
							<ReportSection title="When and Where Did the Accident Happen?">
								<div className="grid grid-cols-2 gap-3">
									<FormInputWrapper
										form={form}
										fieldConfig={accidentDateField}
										disabled={disabledFor(ACCIDENT_SECTION.ACCIDENT_DETAILS)}
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
														disabled={disabledFor(ACCIDENT_SECTION.ACCIDENT_DETAILS)}
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
										disabled={disabledFor(ACCIDENT_SECTION.ACCIDENT_DETAILS)}
									/>
								))}
							</ReportSection>
						</div>

						<div className={highlightFor(ACCIDENT_SECTION.WHAT_HAPPENED)}>
							<ReportSection title="What happened?">
								{whatHappenedFields.map((fieldConfig) => (
									<FormInputWrapper
										key={fieldConfig.name}
										form={form}
										fieldConfig={fieldConfig}
										disabled={disabledFor(ACCIDENT_SECTION.WHAT_HAPPENED)}
									/>
								))}
							</ReportSection>
						</div>

						{sections.followUp && (
							<div className={highlightFor(ACCIDENT_SECTION.FOLLOW_UP)}>
								<FollowUpQuestionsSection form={form} disabled={disabledFor(ACCIDENT_SECTION.FOLLOW_UP)} />
							</div>
						)}

						<div className={highlightFor(ACCIDENT_SECTION.POLICE)}>
							{sections.police && <PoliceSection form={form} disabled={disabledFor(ACCIDENT_SECTION.POLICE)} />}
						</div>

						{sections.otherVehicle && (
							<div className={highlightFor(ACCIDENT_SECTION.OTHER_VEHICLE)}>
								<OtherVehiclesSection
									form={form}
									count={Number(watchedValues.numberOfVehicles) || 0}
									disabled={disabledFor(ACCIDENT_SECTION.OTHER_VEHICLE)}
									uploadDisabled={uploadDisabledFor(ACCIDENT_SECTION.OTHER_VEHICLE)}
									canDelete={uploadCanDelete(ACCIDENT_SECTION.OTHER_VEHICLE)}
								/>
							</div>
						)}

						{sections.personInvolved && (
							<div className={highlightFor(ACCIDENT_SECTION.PERSON_INVOLVED)}>
								<PersonStruckSection form={form} disabled={disabledFor(ACCIDENT_SECTION.PERSON_INVOLVED)} />
							</div>
						)}

						{isAdditionalInfoRequested && requestedSections.has(ACCIDENT_SECTION.TOW_IMPOUND) && (
							<div className={highlightFor(ACCIDENT_SECTION.TOW_IMPOUND)}>
								<ReportSection title="Tow & Impound (optional)">
									<div className="space-y-3">
										<FormInputWrapper
											form={form}
											fieldConfig={towToggleFields.bcewVehicleTowed}
											disabled={disabledFor(ACCIDENT_SECTION.TOW_IMPOUND)}
										/>
										{watchedValues.bcewVehicleTowed === YES_NO.YES && (
											<div className="grid grid-cols-2 items-end gap-3">
												<FormInputWrapper
													form={form}
													fieldConfig={towProviderNameField}
													disabled={disabledFor(ACCIDENT_SECTION.TOW_IMPOUND)}
												/>
												<FormInputWrapper
													form={form}
													fieldConfig={towCostOnSpotField}
													disabled={disabledFor(ACCIDENT_SECTION.TOW_IMPOUND)}
												/>
											</div>
										)}
										<FormInputWrapper
											form={form}
											fieldConfig={towToggleFields.otherVehicleTowed}
											disabled={disabledFor(ACCIDENT_SECTION.TOW_IMPOUND)}
										/>
										{watchedValues.otherVehicleTowed === YES_NO.YES && (
											<FormInputWrapper
												form={form}
												fieldConfig={otherVehicleTowCostField}
												disabled={disabledFor(ACCIDENT_SECTION.TOW_IMPOUND)}
											/>
										)}
										<FormInputWrapper
											form={form}
											fieldConfig={towToggleFields.vehicleImpounded}
											disabled={disabledFor(ACCIDENT_SECTION.TOW_IMPOUND)}
										/>
										{watchedValues.vehicleImpounded === YES_NO.YES && (
											<div className="grid grid-cols-2 items-end gap-3">
												<FormInputWrapper
													form={form}
													fieldConfig={impoundLotCostField}
													disabled={disabledFor(ACCIDENT_SECTION.TOW_IMPOUND)}
												/>
												<FormInputWrapper
													form={form}
													fieldConfig={impoundReleaseChargesField}
													disabled={disabledFor(ACCIDENT_SECTION.TOW_IMPOUND)}
												/>
											</div>
										)}
									</div>
								</ReportSection>
							</div>
						)}

						<div className={highlightFor(ACCIDENT_SECTION.REQUIRED_PHOTOS)}>
							<ReportSection title="Required Uploads">
								<FormInputWrapper
									form={form}
									fieldConfig={bcewVehiclePhotosField}
									disabled={uploadDisabledFor(ACCIDENT_SECTION.REQUIRED_PHOTOS)}
									canDelete={uploadCanDelete(ACCIDENT_SECTION.REQUIRED_PHOTOS)}
								/>
								<FormInputWrapper
									form={form}
									fieldConfig={otherVehiclePropertyPhotosField}
									disabled={uploadDisabledFor(ACCIDENT_SECTION.REQUIRED_PHOTOS)}
									canDelete={uploadCanDelete(ACCIDENT_SECTION.REQUIRED_PHOTOS)}
								/>
							</ReportSection>
						</div>

						{sections.insuranceDocs && (
							<ReportSection title="Upload Insurance-Related Documents">
								<FormInputWrapper
									form={form}
									fieldConfig={insuranceCorrespondenceField}
									disabled={uploadDisabledFor()}
									canDelete={uploadCanDelete()}
								/>
							</ReportSection>
						)}

						{!isAdditionalInfoRequested && (
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
													I confirm the information is accurate. After submitting I can no longer edit this report, but
													I can still upload supporting documents.
												</span>
											</label>
											{fieldState.error && <p className="mt-2 text-xs text-brand-red">{fieldState.error.message}</p>}
										</>
									)}
								/>
							</section>
						)}
					</div>

					{!isClosed && (
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
									{!isAdditionalInfoRequested && (
										<Button type="button" className="w-full" loading={isSaving} onClick={handleSaveProgress}>
											Save Progress
										</Button>
									)}
									<div className="flex gap-2">
										<Button type="button" variant="outline" className="w-full" onClick={() => router.back()}>
											Cancel
										</Button>
										<Button type="submit" variant="filled" className="w-full" loading={submitReport.isPending}>
											{isAdditionalInfoRequested ? "Submit" : "Submit for Approval"}
										</Button>
									</div>
								</>
							)}
						</div>
					)}
				</form>
			</Form>
		</div>
	);
};

export default NewVehicleAccidentReportTemplate;
