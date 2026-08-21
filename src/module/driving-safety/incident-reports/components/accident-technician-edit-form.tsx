"use client";

import { Fragment, useMemo, useState } from "react";
import { AxiosError } from "axios";
import { FieldErrors, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import TimeInput from "@/components/ui/time-input";
import { FormLabelRequired } from "@/components/ui/formLabelrequired";
import { FormInputWrapper } from "@/components/common/form/form-input-wrapper";
import { openErrorToast, openSuccessToast } from "@/components/toast";
import { useHandleFileUpload } from "@/hooks/useFile";
import { dateToUTCString } from "@/lib/utils/date";
import { isValidLatLng } from "@/lib/utils/coordinates";
import { YES_NO } from "@/module/employee-safety/enums";
import ReportSection from "@/module/employee-safety/components/report-section";
import BcewVehicleInfoFields from "@/module/employee-safety/components/bcew-vehicle-info-fields";
import OtherVehiclesSection from "@/module/employee-safety/components/other-vehicles-section";
import PersonStruckSection from "@/module/employee-safety/components/person-struck-section";
import PoliceSection from "@/module/employee-safety/components/police-section";
import FollowUpQuestionsSection from "@/module/employee-safety/components/follow-up-questions-section";
import InjuryReportSection from "@/module/employee-safety/components/injury-report-section";
import InjuryReportPage from "@/module/employee-safety/components/injury-report-page";
import { useMedicalTreatmentLocations, useSafetyFormOptions } from "@/module/employee-safety/hooks/useVehicleAccident";
import { IAccidentReportDetail, IFormOption } from "@/module/employee-safety/types";
import {
	accidentRequiredFieldsSchema,
	IAccidentReportSchema,
} from "@/module/employee-safety/utils/accident-report-schema";
import {
	accidentDateField,
	bcewVehiclePhotosField,
	buildAccidentDetailFields,
	jobSiteTypeField,
	numberOfVehiclesField,
	onJobSiteField,
	otherVehiclePropertyPhotosField,
	quickQuestionsFields,
	whatHappenedFields,
} from "@/module/employee-safety/utils/accident-report-fields";
import { buildAccidentPayload, collectAccidentImages } from "@/module/employee-safety/utils/accident-report-payload";
import { mapReportToForm } from "@/module/employee-safety/utils/accident-report-to-form";
import { getAccidentSectionVisibility } from "@/module/employee-safety/utils/accident-section-visibility";
import { focusFirstError } from "@/module/employee-safety/utils/focus-first-error";

import { useAccidentReportForEdit, useUpdateAccidentTechnicianInfo } from "../hooks/useAccidentReport";
import { IAccidentReviewDetail } from "../types";
import { orDash } from "../utils/accident-review-display";
import { ReviewCard } from "./review-card";
import { isProductionEnv } from "@/utils";

const ReadOnlyField = ({ label, value }: { label: string; value: string | null }) => (
	<div className="space-y-1">
		<p className="text-sm text-brand-dark50">{label}</p>
		<p className="text-sm font-medium text-brand-dark">{orDash(value)}</p>
	</div>
);

// Inner form — mounted only once the report + weather options are ready, so every
// field (incl. the async-optioned weather <Select>) initializes from defaultValues
// with its option already present, rather than via a post-mount reset.
const EditForm = ({
	report,
	editReport,
	weatherOptions,
	painLevels,
	onClose,
}: {
	report: IAccidentReviewDetail;
	editReport: IAccidentReportDetail;
	weatherOptions: IFormOption[];
	painLevels: IFormOption[];
	onClose: () => void;
}) => {
	const updateReport = useUpdateAccidentTechnicianInfo(report.id);
	const { getSignedUrls, getFilesToUpload, handleFileUpload } = useHandleFileUpload();
	const { data: treatmentLocations } = useMedicalTreatmentLocations();
	const [showInjuryReport, setShowInjuryReport] = useState(false);

	const defaultValues = useMemo<IAccidentReportSchema>(() => {
		const seed = mapReportToForm(editReport);
		seed.accidentTime = editReport.accidentDate ? dateToUTCString(new Date(editReport.accidentDate)) : "";
		return seed;
	}, [editReport]);

	const form = useForm<IAccidentReportSchema>({
		resolver: zodResolver(accidentRequiredFieldsSchema),
		defaultValues,
	});

	const watchedValues = useWatch({ control: form.control });
	const accidentDate = useWatch({ control: form.control, name: "accidentDate" });
	const sections = getAccidentSectionVisibility(watchedValues);
	const accidentDetailFields = buildAccidentDetailFields(weatherOptions);
	const otherVehicleCount = Number(watchedValues.numberOfVehicles) || 0;

	const onInvalid = (errors: FieldErrors<IAccidentReportSchema>) => focusFirstError(errors);

	const onSubmit = async (data: IAccidentReportSchema) => {
		try {
			const filesToUpload = getFilesToUpload(collectAccidentImages(data));
			if (filesToUpload.length) {
				const signedUrls = await getSignedUrls(filesToUpload);
				await handleFileUpload({ signedUrls, filesToUpload });
			}
			await updateReport.mutateAsync(buildAccidentPayload(data));
			openSuccessToast("Report updated");
			onClose();
		} catch (error) {
			openErrorToast({ error: error as AxiosError<{ message: string }> });
		}
	};

	const actions = (
		<div className="flex gap-2">
			<Button
				type="button"
				variant="outline"
				className="rounded-[8px]"
				size="sm"
				onClick={onClose}
				disabled={updateReport.isPending}
			>
				Cancel
			</Button>
			<Button
				type="button"
				variant="filled"
				size="sm"
				className="rounded-[8px]"
				loading={updateReport.isPending}
				onClick={() => form.handleSubmit(onSubmit, onInvalid)()}
			>
				Save Changes
			</Button>
		</div>
	);

	if (showInjuryReport) {
		return (
			<InjuryReportPage
				form={form}
				painLevels={painLevels}
				treatmentLocations={treatmentLocations ?? []}
				onCancel={() => setShowInjuryReport(false)}
				onCreate={() => setShowInjuryReport(false)}
			/>
		);
	}

	return (
		<ReviewCard title="Information from Technician" action={actions}>
			<Form {...form}>
				<div className="space-y-5">
					<ReportSection title="A Few Quick Questions">
						<FormInputWrapper form={form} fieldConfig={onJobSiteField} wrapperClassName="space-y-3" />
						{watchedValues.onJobSite === YES_NO.YES && (
							<FormInputWrapper form={form} fieldConfig={jobSiteTypeField} wrapperClassName="space-y-3" />
						)}
						{quickQuestionsFields.map((fieldConfig) => (
							<Fragment key={fieldConfig.name}>
								<FormInputWrapper form={form} fieldConfig={fieldConfig} wrapperClassName="space-y-3" />
								{fieldConfig.name === "anotherVehicleInvolved" &&
									watchedValues.anotherVehicleInvolved === YES_NO.YES && (
										<FormInputWrapper form={form} fieldConfig={numberOfVehiclesField} />
									)}
							</Fragment>
						))}
					</ReportSection>

					<ReportSection title="Employee & Vehicle Information">
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
							<ReadOnlyField label="Full Name" value={report.user?.name ?? null} />
							<ReadOnlyField label="Phone" value={report.user?.cellPhone ?? null} />
							<ReadOnlyField label="Driver's License Number" value={report.driverLicenseNumber} />
							<BcewVehicleInfoFields form={form} />
						</div>
					</ReportSection>

					<ReportSection title="When and where did the accident happen?">
						<div className="grid grid-cols-2 gap-3">
							<FormInputWrapper form={form} fieldConfig={accidentDateField} wrapperClassName="space-y-3" />
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
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
						{accidentDetailFields
							.filter((fieldConfig) => fieldConfig.name !== "speedLimit" || isValidLatLng(watchedValues.location))
							.map((fieldConfig) => (
								<FormInputWrapper key={fieldConfig.name} form={form} fieldConfig={fieldConfig} />
							))}
					</ReportSection>

					<ReportSection title="What happened?">
						{whatHappenedFields.map((fieldConfig) => (
							<FormInputWrapper key={fieldConfig.name} form={form} fieldConfig={fieldConfig} />
						))}
					</ReportSection>

					{sections.followUp && <FollowUpQuestionsSection form={form} />}
					{sections.police && <PoliceSection form={form} />}
					{sections.otherVehicle && <OtherVehiclesSection form={form} count={otherVehicleCount} canDelete />}
					{sections.personInvolved && <PersonStruckSection form={form} />}

					<ReportSection title="Required Uploads">
						<FormInputWrapper form={form} fieldConfig={bcewVehiclePhotosField} canDelete />
						<FormInputWrapper form={form} fieldConfig={otherVehiclePropertyPhotosField} canDelete />
					</ReportSection>

					{isProductionEnv() && <InjuryReportSection form={form} onOpenInjury={() => setShowInjuryReport(true)} />}
				</div>
			</Form>
		</ReviewCard>
	);
};

const AccidentTechnicianEditForm = ({ report, onClose }: { report: IAccidentReviewDetail; onClose: () => void }) => {
	const { data: editReport, isLoading } = useAccidentReportForEdit(report.id, true);
	const { data: formOptions } = useSafetyFormOptions();

	if (isLoading || !editReport || !formOptions) {
		return (
			<ReviewCard title="Information from Technician">
				<div className="flex justify-center py-10">
					<Spinner />
				</div>
			</ReviewCard>
		);
	}

	return (
		<EditForm
			report={report}
			editReport={editReport}
			weatherOptions={formOptions.weatherConditions}
			painLevels={formOptions.painLevels}
			onClose={onClose}
		/>
	);
};

export default AccidentTechnicianEditForm;
