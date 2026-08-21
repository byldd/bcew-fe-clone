"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, Path, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import TimeInput from "@/components/ui/time-input";
import DocumentUpload from "@/components/shared/document-upload/document-upload";
import { FormInputWrapper } from "@/components/common/form/form-input-wrapper";
import { openErrorToast, openSuccessToast } from "@/components/toast";
import { useHandleFileUpload } from "@/hooks/useFile";
import { getTodayDate, isFutureDate } from "@/lib/utils/date";
import { isValidLatLng } from "@/lib/utils/coordinates";
import { routes } from "@/config/routes";
import { INCIDENT_REPORT_STATUS, VIOLATION_TYPE_CATEGORY } from "@/module/driving-safety/incident-reports/utils/enums";
import { useDrivingSafetyPolicies } from "@/module/driving-safety/policies/hooks/useDrivingSafetyPolicies";
import { useMedicalTreatmentLocations, useSafetyFormOptions } from "@/module/employee-safety/hooks/useVehicleAccident";
import {
	ACCIDENT_SECTION,
	MANDATORY_ASK_TECHNICIAN_SECTIONS,
	MEDICAL_TREATMENT_LOCATION_OTHER,
	YES_NO,
} from "@/module/employee-safety/enums";

import AccidentRecordSection from "./accident-record-section";
import {
	useCreateVehicleAccident,
	useUpdateVehicleAccident,
	useVehicleAccidentAssignedVehicle,
	useVehicleAccidentDraft,
	useVehicleAccidentEmployees,
	useVehicleAccidentTrucks,
} from "../hooks/useAdminVehicleAccident";
import {
	anotherVehicleField,
	bcewTowedField,
	buildEmployeeField,
	buildMedicalTreatmentLocationField,
	buildViolationTypeField,
	buildWeatherField,
	drugScreenNeededField,
	followUpFields,
	impoundLotCostField,
	impoundReleaseChargesField,
	impoundedField,
	jobSiteTypeField,
	locationField,
	medicalCareNeededField,
	medicalTreatmentLocationOtherField,
	nearestCrossStreetField,
	numberOfVehiclesField,
	onJobSiteField,
	otherVehicleTowCostField,
	otherVehicleTowedField,
	personStruckField,
	policeContactedField,
	policeFields,
	speedLimitField,
	towCostField,
	towProviderField,
	truckNumberField,
} from "../utils/vehicle-accident-record-fields";
import {
	buildVehicleAccidentRecordPayload,
	collectAccidentRecordImages,
} from "../utils/vehicle-accident-record-payload";
import { IVehicleAccidentRecordSchema, vehicleAccidentRecordSchema } from "../utils/vehicle-accident-record-schema";
import { mapDraftToRecordForm } from "../utils/vehicle-accident-record-to-form";

const InfoNote = ({ children }: { children: string }) => (
	<div className="rounded-[8px] bg-[#9A6A001A] px-3 py-2 text-xs text-[#9A6A00]">{children}</div>
);

const ReadOnlyField = ({ label, value }: { label: string; value: string | null }) => (
	<div className="space-y-1">
		<p className="font-inter text-sm font-normal text-brand-grey">{label}</p>
		<p className="text-sm font-medium text-brand-dark">{value || "-"}</p>
	</div>
);

const VehicleAccidentRecordForm = ({ draftId }: { draftId?: string }) => {
	const router = useRouter();

	const { data: employees } = useVehicleAccidentEmployees();
	const { data: trucks } = useVehicleAccidentTrucks();
	const { data: policies } = useDrivingSafetyPolicies();
	const { data: formOptions } = useSafetyFormOptions();
	const { data: medicalLocations } = useMedicalTreatmentLocations();
	const { data: draft } = useVehicleAccidentDraft(draftId ?? null);
	const createAccident = useCreateVehicleAccident();
	const updateAccident = useUpdateVehicleAccident();
	const { getSignedUrls, getFilesToUpload, handleFileUpload } = useHandleFileUpload();

	const form = useForm<IVehicleAccidentRecordSchema>({
		resolver: zodResolver(vehicleAccidentRecordSchema),
		defaultValues: {
			employeeId: "",
			truckNumber: "",
			onJobSite: "",
			jobSiteType: "",
			anotherVehicleInvolved: "",
			personStruck: "",
			accidentTime: "",
			location: "",
			nearestCrossStreet: "",
			weather: "",
			policeContacted: "",
			bcewVehicleTowed: "",
			otherVehicleTowed: "",
			vehicleImpounded: "",
			drugScreenNeeded: "",
			medicalCareNeeded: "",
			medicalTreatmentLocation: "",
			violationTypeId: "",
			insuranceCorrespondence: [],
		},
	});

	const values = useWatch({ control: form.control });
	const accidentDate = useWatch({ control: form.control, name: "accidentDate" });

	const { data: assignedVehicle } = useVehicleAccidentAssignedVehicle(values.employeeId || null);

	// When loading a saved draft, keep the draft's own truck number — don't let the
	// assigned-vehicle autofill clobber it on the first resolve after load.
	const skipTruckAutofill = useRef(false);

	// Skips the police / drug-screen auto-select on the render right after a saved draft
	// is hydrated, so the draft's own answers aren't overwritten on load.
	const skipAutoDefaults = useRef(false);

	// Hydrate the form from a saved admin draft (Continue flow). The reporter's
	// userId is mapped back to the employee dropdown value.
	useEffect(() => {
		if (!draft || !employees) return;
		const employeeId = employees.find((employee) => employee.userId === draft.userId)?.employeeId ?? "";
		skipTruckAutofill.current = true;
		skipAutoDefaults.current = true;
		form.reset(mapDraftToRecordForm(draft, employeeId));
	}, [draft, employees, form]);

	// Selecting an employee pre-fills their assigned truck; the truck stays editable
	// and its VIN / license plate re-resolve from whatever number is entered.
	useEffect(() => {
		if (!assignedVehicle) return;
		if (skipTruckAutofill.current) {
			skipTruckAutofill.current = false;
			return;
		}
		form.setValue("truckNumber", assignedVehicle.truckNumber ?? "");
	}, [assignedVehicle, form]);

	const employeeOptions = (employees ?? []).map((employee) => ({ label: employee.name, value: employee.employeeId }));
	const weatherOptions = formOptions?.weatherConditions ?? [];
	const medicalLocationOptions = [
		...(medicalLocations ?? []).map((location) => ({ label: location.name, value: location.name })),
		{ label: "Other", value: MEDICAL_TREATMENT_LOCATION_OTHER },
	];
	const violationTypes = (policies?.violationTypes ?? []).filter((type) =>
		type.categories.includes(VIOLATION_TYPE_CATEGORY.ACCIDENT_VIOLATION)
	);
	const violationTypeOptions = violationTypes.map((type) => ({ label: type.name, value: type.id }));

	const selectedTruck = trucks?.find((truck) => truck.truckNumber === (values.truckNumber ?? "").trim());
	const selectedEmployee = employees?.find((employee) => employee.employeeId === values.employeeId);
	const selectedViolationType = violationTypes.find((type) => type.id === values.violationTypeId);

	const onJobSite = values.onJobSite === YES_NO.YES;
	const anotherVehicleInvolved = values.anotherVehicleInvolved === YES_NO.YES;
	const otherVehicleCount = Number(values.numberOfVehicles) || 0;
	const personStruck = values.personStruck === YES_NO.YES;
	const showPoliceDetails = values.policeContacted === YES_NO.YES;
	const showDrugScreen = values.drugScreenNeeded === YES_NO.YES;
	const showMedicalLocation = values.medicalCareNeeded === YES_NO.YES;
	const showEnterLocation = showMedicalLocation && values.medicalTreatmentLocation === MEDICAL_TREATMENT_LOCATION_OTHER;
	const anotherCompanyStruck = values.propertyDamage?.anotherCompanyProperty === YES_NO.YES;
	const builderStruck = values.propertyDamage?.builderProperty === YES_NO.YES;
	const homeownerStruck = values.propertyDamage?.homeownerProperty === YES_NO.YES;

	const [askedSections, setAskedSections] = useState<Set<ACCIDENT_SECTION>>(
		() => new Set(MANDATORY_ASK_TECHNICIAN_SECTIONS)
	);

	const toggleAsk = (section: ACCIDENT_SECTION) => {
		setAskedSections((prev) => {
			const next = new Set(prev);
			if (next.has(section)) next.delete(section);
			else next.add(section);
			return next;
		});
	};

	// Scenario 2 (another vehicle involved): "Other Vehicle Involved" is a mandatory
	// ask-technician prompt. Scenario 3 (person struck): "Who was the Person Involved"
	// is a mandatory ask-technician prompt.
	useEffect(() => {
		setAskedSections((prev) => {
			const hasVehicle = prev.has(ACCIDENT_SECTION.OTHER_VEHICLE);
			const hasPerson = prev.has(ACCIDENT_SECTION.PERSON_INVOLVED);
			if (hasVehicle === anotherVehicleInvolved && hasPerson === personStruck) return prev;
			const next = new Set(prev);
			if (anotherVehicleInvolved) next.add(ACCIDENT_SECTION.OTHER_VEHICLE);
			else next.delete(ACCIDENT_SECTION.OTHER_VEHICLE);
			if (personStruck) next.add(ACCIDENT_SECTION.PERSON_INVOLVED);
			else next.delete(ACCIDENT_SECTION.PERSON_INVOLVED);
			return next;
		});
	}, [anotherVehicleInvolved, personStruck]);

	// Police contacted and drug screen are auto-set from the scenario: Yes when another
	// vehicle was involved or a person was struck (scenarios 2–5), No otherwise (scenario 1).
	useEffect(() => {
		if (skipAutoDefaults.current) {
			skipAutoDefaults.current = false;
			return;
		}
		const vehicleAnswer = values.anotherVehicleInvolved;
		const personAnswer = values.personStruck;
		const scenarioKnown =
			(vehicleAnswer === YES_NO.YES || vehicleAnswer === YES_NO.NO) &&
			(personAnswer === YES_NO.YES || personAnswer === YES_NO.NO);
		if (!scenarioKnown) return;
		const scenarioValue = vehicleAnswer === YES_NO.YES || personAnswer === YES_NO.YES ? YES_NO.YES : YES_NO.NO;
		form.setValue("policeContacted", scenarioValue);
		form.setValue("drugScreenNeeded", scenarioValue);
	}, [values.anotherVehicleInvolved, values.personStruck, form]);

	// The truck number is editable; verify it matches a real fleet vehicle and surface an
	// inline error when it doesn't (mirrors the technician "Report an Accident" lookup).
	useEffect(() => {
		const truckNumber = (values.truckNumber ?? "").trim();
		if (!trucks || !truckNumber || trucks.some((truck) => truck.truckNumber === truckNumber)) {
			form.clearErrors("truckNumber");
			return;
		}
		form.setError("truckNumber", {
			type: "manual",
			message: `No vehicle found for truck number ${truckNumber}`,
		});
	}, [values.truckNumber, trucks, form]);

	const runAction = async (
		data: IVehicleAccidentRecordSchema,
		targetStatus: INCIDENT_REPORT_STATUS,
		requestedSections: ACCIDENT_SECTION[]
	) => {
		const missing: Path<IVehicleAccidentRecordSchema>[] = [];
		const fail = (field: Path<IVehicleAccidentRecordSchema>, message: string) => {
			form.setError(field, { type: "manual", message });
			missing.push(field);
		};

		if (targetStatus !== INCIDENT_REPORT_STATUS.DRAFT) {
			if (!data.onJobSite) fail("onJobSite", "Please answer this question");
			else if (data.onJobSite === YES_NO.YES && !data.jobSiteType) {
				fail("jobSiteType", "Please select the job-site type");
			}
			if (!data.anotherVehicleInvolved) fail("anotherVehicleInvolved", "Please answer this question");
			else if (data.anotherVehicleInvolved === YES_NO.YES && !data.numberOfVehicles) {
				fail("numberOfVehicles", "Please select how many vehicles were involved");
			}
			if (!data.personStruck) fail("personStruck", "Please answer this question");

			// Accident Details are required unless the admin defers the whole section to
			// the technician via its "Ask Technician" toggle.
			if (!requestedSections.includes(ACCIDENT_SECTION.ACCIDENT_DETAILS)) {
				if (!data.accidentDate) fail("accidentDate", "Please select the date of accident");
				if (!data.accidentTime) fail("accidentTime", "Please enter the time of accident");
				if (!data.location?.trim()) fail("location", "Please enter the location of accident");
			}

			if (!requestedSections.includes(ACCIDENT_SECTION.POLICE)) {
				if (!data.policeContacted) fail("policeContacted", "Please answer this question");
				else if (data.policeContacted === YES_NO.YES && !data.policeDepartment?.trim()) {
					fail("policeDepartment", "Please enter the police department");
				}
			}

			if (!data.violationTypeId) fail("violationTypeId", "Please select a violation type");

			// Follow-up (on-site only): company name is required when another company's
			// property was struck — unless the section is deferred to the technician.
			if (
				data.onJobSite === YES_NO.YES &&
				!requestedSections.includes(ACCIDENT_SECTION.FOLLOW_UP) &&
				data.propertyDamage?.anotherCompanyProperty === YES_NO.YES &&
				!data.propertyDamage?.companyName?.trim()
			) {
				fail("propertyDamage.companyName", "Please enter the company name");
			}

			// Tow & Impound cost fields are required only when their Yes toggle is set —
			// unless the section is deferred to the technician.
			if (!requestedSections.includes(ACCIDENT_SECTION.TOW_IMPOUND)) {
				if (data.bcewVehicleTowed === YES_NO.YES) {
					if (!data.towProviderName?.trim()) fail("towProviderName", "Please enter the tow provider name");
					if (data.towCostOnSpot == null) fail("towCostOnSpot", "Please enter the tow cost");
				}
				if (
					data.anotherVehicleInvolved === YES_NO.YES &&
					data.otherVehicleTowed === YES_NO.YES &&
					data.otherVehicleTowCost == null
				) {
					fail("otherVehicleTowCost", "Please enter the other vehicle tow cost");
				}
				if (data.vehicleImpounded === YES_NO.YES) {
					if (data.impoundLotCost == null) fail("impoundLotCost", "Please enter the impound lot cost");
					if (data.impoundReleaseCharges == null) fail("impoundReleaseCharges", "Please enter the release charges");
				}
			}

			// Medical treatment location is required only when medical care was needed.
			if (data.medicalCareNeeded === YES_NO.YES && !data.medicalTreatmentLocation) {
				fail("medicalTreatmentLocation", "Please select the medical treatment location");
			} else if (
				data.medicalCareNeeded === YES_NO.YES &&
				data.medicalTreatmentLocation === MEDICAL_TREATMENT_LOCATION_OTHER &&
				!data.medicalTreatmentLocationOther?.trim()
			) {
				fail("medicalTreatmentLocationOther", "Please enter the medical treatment location");
			}
		}

		const truckNumber = data.truckNumber?.trim();
		if (!data.employeeId) fail("employeeId", "Please select an employee");
		if (data.accidentDate && isFutureDate(data.accidentDate)) {
			fail("accidentDate", "An accident cannot occur in the future");
		}
		if (!truckNumber) fail("truckNumber", "Please select a truck");
		else if (trucks && !trucks.some((truck) => truck.truckNumber === truckNumber)) {
			fail("truckNumber", `No vehicle found for truck number ${truckNumber}`);
		}

		if (missing.length) {
			openErrorToast({ message: "Please complete the highlighted required fields" });
			return;
		}

		try {
			const filesToUpload = getFilesToUpload(collectAccidentRecordImages(data));
			if (filesToUpload.length) {
				const signedUrls = await getSignedUrls(filesToUpload);
				await handleFileUpload({ signedUrls, filesToUpload });
			}
			const payload = buildVehicleAccidentRecordPayload(data, targetStatus, requestedSections);
			const isAskRequest = targetStatus === INCIDENT_REPORT_STATUS.ADDITIONAL_INFO_REQUESTED;
			const isDraft = targetStatus === INCIDENT_REPORT_STATUS.DRAFT;
			const result = draftId
				? await updateAccident.mutateAsync({ id: draftId, payload })
				: await createAccident.mutateAsync(payload);
			openSuccessToast(
				isAskRequest
					? "Request sent to technician"
					: isDraft
						? "Accident Report Saved as Draft"
						: draftId
							? "Accident report updated"
							: "Accident report created"
			);
			// A saved draft reopens from the Drafts tab, so it lands on the list; a created
			// report (sent to technician / marked for insurance) opens its own review page.
			if (isDraft) {
				router.push(routes.admin.drivingSafetyIncidentReports);
				return;
			}
			router.push(routes.admin.drivingSafetyAccidentReview(result.id));
		} catch (error) {
			openErrorToast({ error: error as Error });
		}
	};

	const submitWith = (targetStatus: INCIDENT_REPORT_STATUS) =>
		form.handleSubmit((data) => runAction(data, targetStatus, [...askedSections]))();

	return (
		<Form {...form}>
			<form className="rounded-[8px] bg-white p-4 shadow-sm">
				<AccidentRecordSection title="A Few Quick Questions" showAskTechnician={false}>
					<div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
						<FormInputWrapper form={form} fieldConfig={onJobSiteField} wrapperClassName="space-y-2" />
						{onJobSite && <FormInputWrapper form={form} fieldConfig={jobSiteTypeField} wrapperClassName="space-y-2" />}
						<FormInputWrapper form={form} fieldConfig={anotherVehicleField} wrapperClassName="space-y-2" />
						<FormInputWrapper form={form} fieldConfig={personStruckField} wrapperClassName="space-y-2" />
						{anotherVehicleInvolved && <FormInputWrapper form={form} fieldConfig={numberOfVehiclesField} />}
					</div>
					<div className="pt-2">
						{personStruck && (
							<InfoNote>
								Coordinate with other company to see if they want to handle accident outside of insurance if the person
								is not a employee.
							</InfoNote>
						)}
					</div>
				</AccidentRecordSection>

				<AccidentRecordSection title="Employee & Vehicle Information" showAskTechnician={false}>
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
						<FormInputWrapper form={form} fieldConfig={buildEmployeeField(employeeOptions)} />
						<ReadOnlyField label="Phone" value={selectedEmployee?.cellPhone ?? null} />
						<ReadOnlyField label="Driver's License Number" value={assignedVehicle?.driverLicenseNumber ?? null} />
						<FormInputWrapper form={form} fieldConfig={truckNumberField} className="h-10 rounded-[8px] text-sm" />
						<ReadOnlyField label="VIN" value={selectedTruck?.vin ?? null} />
						<ReadOnlyField label="License Plate" value={selectedTruck?.licensePlate ?? null} />
					</div>
				</AccidentRecordSection>

				<AccidentRecordSection
					title="Accident Details"
					isAsked={askedSections.has(ACCIDENT_SECTION.ACCIDENT_DETAILS)}
					onToggleAsk={() => toggleAsk(ACCIDENT_SECTION.ACCIDENT_DETAILS)}
				>
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<FormField
							control={form.control}
							name="accidentDate"
							render={({ field }) => (
								<FormItem className="gap-1.5">
									<FormLabel className="font-inter text-sm font-normal text-brand-grey">
										Date of Accident<span className="ml-0.5 align-super text-xs leading-none text-brand-grey">*</span>
									</FormLabel>
									<FormControl>
										<DatePicker
											value={field.value}
											onChange={field.onChange}
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
							name="accidentTime"
							render={({ field }) => (
								<FormItem className="gap-1.5">
									<FormLabel className="font-inter text-sm font-normal text-brand-grey">
										Time of Accident<span className="ml-0.5 align-super text-xs leading-none text-brand-grey">*</span>
									</FormLabel>
									<FormControl>
										<TimeInput
											date={accidentDate ?? new Date()}
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
					<div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
						<FormInputWrapper form={form} fieldConfig={locationField} />
						{isValidLatLng(values.location) && <FormInputWrapper form={form} fieldConfig={speedLimitField} />}
						<FormInputWrapper form={form} fieldConfig={nearestCrossStreetField} />
						<FormInputWrapper form={form} fieldConfig={buildWeatherField(weatherOptions)} />
					</div>
				</AccidentRecordSection>

				<AccidentRecordSection title="What happened" mandatory>
					<p className="text-xs text-brand-grey">
						This prompts the technician to briefly describe how the accident happened &amp; damage happened to vehicle.
					</p>
				</AccidentRecordSection>

				<AccidentRecordSection title="Required Photos" mandatory>
					<p className="text-xs text-brand-grey">
						This prompts the technician to upload photos of vehicle &amp; photos of damaged property.
					</p>
				</AccidentRecordSection>

				{anotherVehicleInvolved &&
					Array.from({ length: otherVehicleCount }, (_, index) => (
						<AccidentRecordSection key={index} title={`Other Details: Vehicle ${index + 1}`} mandatory>
							<p className="text-xs text-brand-grey">
								This prompts the technician to give the details like Make, Model of the Other Vehicle, What was Struck,
								VIN, Driver&apos;s Full Name &amp; Driver&apos;s License #.
							</p>
						</AccidentRecordSection>
					))}
				{personStruck && (
					<AccidentRecordSection title="Who was the Person Involved" mandatory>
						<p className="text-xs text-brand-grey">
							This prompts the technician to give the details of the other person involved.
						</p>
					</AccidentRecordSection>
				)}

				{onJobSite && (
					<AccidentRecordSection
						title="Follow Up Questions"
						isAsked={askedSections.has(ACCIDENT_SECTION.FOLLOW_UP)}
						onToggleAsk={() => toggleAsk(ACCIDENT_SECTION.FOLLOW_UP)}
					>
						<div className="space-y-2">
							<FormInputWrapper
								form={form}
								fieldConfig={followUpFields.anotherCompanyProperty}
								wrapperClassName="space-y-3"
							/>
							{anotherCompanyStruck && (
								<div className="space-y-3">
									<InfoNote>Collect company information</InfoNote>
									<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
										<FormInputWrapper form={form} fieldConfig={followUpFields.companyName} />
										<FormInputWrapper form={form} fieldConfig={followUpFields.contactPhoneNumber} />
										<FormInputWrapper form={form} fieldConfig={followUpFields.contactPersonName} />
									</div>
									<FormInputWrapper form={form} fieldConfig={followUpFields.otherInformation} />
								</div>
							)}
							<FormInputWrapper form={form} fieldConfig={followUpFields.builderProperty} wrapperClassName="space-y-3" />
							{builderStruck && (
								<InfoNote>
									Inform the foreman to contact the builder representative regarding the property damage.
								</InfoNote>
							)}
							<FormInputWrapper
								form={form}
								fieldConfig={followUpFields.homeownerProperty}
								wrapperClassName="space-y-3"
							/>
							{homeownerStruck && <InfoNote>Inform homeowner about the accident</InfoNote>}
						</div>
					</AccidentRecordSection>
				)}

				<AccidentRecordSection
					title="Were Police Contacted?"
					isAsked={askedSections.has(ACCIDENT_SECTION.POLICE)}
					onToggleAsk={() => toggleAsk(ACCIDENT_SECTION.POLICE)}
					className="space-y-[-6]"
				>
					<FormInputWrapper form={form} fieldConfig={policeContactedField} />
					{showPoliceDetails && (
						<div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
							{policeFields.map((fieldConfig) => (
								<FormInputWrapper key={fieldConfig.name} form={form} fieldConfig={fieldConfig} />
							))}
						</div>
					)}
				</AccidentRecordSection>

				<AccidentRecordSection
					title="Tow & Impound (optional)"
					isAsked={askedSections.has(ACCIDENT_SECTION.TOW_IMPOUND)}
					onToggleAsk={() => toggleAsk(ACCIDENT_SECTION.TOW_IMPOUND)}
				>
					<div className="space-y-2">
						<FormInputWrapper form={form} fieldConfig={bcewTowedField} wrapperClassName="space-y-2" />
						{values.bcewVehicleTowed === YES_NO.YES && (
							<div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-2">
								<FormInputWrapper form={form} fieldConfig={towProviderField} />
								<FormInputWrapper form={form} fieldConfig={towCostField} />
							</div>
						)}
						{anotherVehicleInvolved && (
							<>
								<FormInputWrapper form={form} fieldConfig={otherVehicleTowedField} wrapperClassName="space-y-2" />
								{values.otherVehicleTowed === YES_NO.YES && (
									<FormInputWrapper form={form} fieldConfig={otherVehicleTowCostField} />
								)}
							</>
						)}
						<FormInputWrapper form={form} fieldConfig={impoundedField} wrapperClassName="space-y-2" />
						{values.vehicleImpounded === YES_NO.YES && (
							<div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-2">
								<FormInputWrapper form={form} fieldConfig={impoundLotCostField} />
								<FormInputWrapper form={form} fieldConfig={impoundReleaseChargesField} />
							</div>
						)}
					</div>
				</AccidentRecordSection>

				{(anotherVehicleInvolved || personStruck) && (
					<AccidentRecordSection title="Was Drug Screen Needed?" showAskTechnician={false} className="space-y-[-2]">
						<FormInputWrapper form={form} fieldConfig={drugScreenNeededField} wrapperClassName="space-y-3" />
						{showDrugScreen && <InfoNote>Call Drug Coordinator to inform of drug screen.</InfoNote>}
					</AccidentRecordSection>
				)}

				<AccidentRecordSection title="Was Medical Care Needed?" showAskTechnician={false} className="space-y-[-2]">
					<FormInputWrapper form={form} fieldConfig={medicalCareNeededField} />
					{showMedicalLocation && (
						<div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
							<FormInputWrapper form={form} fieldConfig={buildMedicalTreatmentLocationField(medicalLocationOptions)} />
							{showEnterLocation && (
								<FormInputWrapper
									form={form}
									fieldConfig={medicalTreatmentLocationOtherField}
									className="h-10 rounded-[8px] text-sm"
								/>
							)}
						</div>
					)}
				</AccidentRecordSection>

				<AccidentRecordSection title="Violation Assessment" showAskTechnician={false}>
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<FormInputWrapper form={form} fieldConfig={buildViolationTypeField(violationTypeOptions)} />
						<div className="mt-1 space-y-1.5">
							<p className="font-inter text-sm font-normal text-brand-grey">Point Weight</p>
							<Input
								value={selectedViolationType ? String(selectedViolationType.points ?? "TBD") : ""}
								readOnly
								disabled
								className="h-10 rounded-[8px] !border-none !bg-brand-bgLightgrey text-sm"
								placeholder="Auto-filled based on violation type"
							/>
						</div>
					</div>
				</AccidentRecordSection>

				<AccidentRecordSection title="Insurance Correspondence" showAskTechnician={false}>
					<Controller
						name="insuranceCorrespondence"
						control={form.control}
						render={({ field }) => <DocumentUpload value={field.value ?? []} onChange={field.onChange} />}
					/>
				</AccidentRecordSection>

				<div className="flex flex-wrap justify-end gap-2 border-t border-brand-dark10 pt-4">
					<Button type="button" variant="outline" onClick={() => router.back()}>
						Cancel
					</Button>
					<Button
						type="button"
						variant="outline"
						loading={createAccident.isPending || updateAccident.isPending}
						onClick={() => submitWith(INCIDENT_REPORT_STATUS.DRAFT)}
					>
						Save Progress
					</Button>
					<Button
						type="button"
						variant="filled"
						loading={createAccident.isPending || updateAccident.isPending}
						onClick={() => submitWith(INCIDENT_REPORT_STATUS.ADDITIONAL_INFO_REQUESTED)}
					>
						Send to Technician
					</Button>
				</div>
			</form>
		</Form>
	);
};

export default VehicleAccidentRecordForm;
