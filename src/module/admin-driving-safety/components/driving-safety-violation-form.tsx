"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import TimeInput from "@/components/ui/time-input";
import DocumentUpload from "@/components/shared/document-upload/document-upload";
import SearchableSelect from "@/components/common/form/searchable-select";
import { FormInputWrapper } from "@/components/common/form/form-input-wrapper";
import { openErrorToast, openSuccessToast } from "@/components/toast";
import { useHandleFileUpload } from "@/hooks/useFile";
import { getTodayDate, isFutureDate } from "@/lib/utils/date";
import { routes } from "@/config/routes";
import { useDrivingSafetyPolicies } from "@/module/driving-safety/policies/hooks/useDrivingSafetyPolicies";
import { VIOLATION_TYPE_CATEGORY } from "@/module/driving-safety/incident-reports/utils/enums";

import {
	useCreateDrivingSafetyViolation,
	useDrivingSafetyViolationEmployees,
	useDrivingSafetyViolationTrucks,
} from "../hooks/useAdminDrivingSafetyViolation";
import {
	buildTruckField,
	buildViolationTypeField,
	descriptionField,
	severityField,
} from "../utils/driving-safety-violation-fields";
import { buildDrivingSafetyViolationPayload } from "../utils/driving-safety-violation-payload";
import {
	drivingSafetyViolationRequiredFieldsSchema,
	drivingSafetyViolationSchema,
	IDrivingSafetyViolationSchema,
} from "../utils/driving-safety-violation-schema";
import PolicyReferenceCard from "./policy-reference-card";

const DrivingSafetyViolationForm = () => {
	const router = useRouter();
	const [employeeId, setEmployeeId] = useState("");

	const { data: employees } = useDrivingSafetyViolationEmployees();
	const { data: trucks } = useDrivingSafetyViolationTrucks();
	const { data: policies } = useDrivingSafetyPolicies();
	const createViolation = useCreateDrivingSafetyViolation();
	const { getSignedUrls, getFilesToUpload, handleFileUpload } = useHandleFileUpload();

	const form = useForm<IDrivingSafetyViolationSchema>({
		resolver: zodResolver(drivingSafetyViolationSchema),
		defaultValues: {
			truckNumber: "",
			violationTypeId: "",
			severity: "",
			description: "",
			violationTime: "",
			documents: [],
		},
	});

	const violationDate = useWatch({ control: form.control, name: "violationDate" });
	const violationTypeId = useWatch({ control: form.control, name: "violationTypeId" });

	const violationTypes = (policies?.violationTypes ?? []).filter((violationType) =>
		violationType.categories.includes(VIOLATION_TYPE_CATEGORY.DRIVING_SAFETY_VIOLATION)
	);
	const selectedType = violationTypes.find((violationType) => violationType.id === violationTypeId);

	const truckOptions = (trucks ?? []).map((truck) => ({ label: truck.truckNumber, value: truck.truckNumber }));
	const violationTypeOptions = violationTypes.map((violationType) => ({
		label: violationType.name,
		value: violationType.id,
	}));

	const onSubmit = async (data: IDrivingSafetyViolationSchema) => {
		if (!employeeId) {
			openErrorToast({ message: "Please select an employee" });
			return;
		}

		const validation = drivingSafetyViolationRequiredFieldsSchema.safeParse(data);
		if (!validation.success) {
			validation.error.issues.forEach((issue) => {
				form.setError(issue.path[0] as keyof IDrivingSafetyViolationSchema, {
					type: "custom",
					message: issue.message,
				});
			});
			openErrorToast({ message: "Please fill required fields" });
			return;
		}

		if (data.violationDate && isFutureDate(data.violationDate)) {
			form.setError("violationDate", {
				type: "custom",
				message: "A violation cannot occur in the future",
			});
			return;
		}

		try {
			const filesToUpload = getFilesToUpload(data.documents ?? []);
			if (filesToUpload.length) {
				const signedUrls = await getSignedUrls(filesToUpload);
				await handleFileUpload({ signedUrls, filesToUpload });
			}

			await createViolation.mutateAsync(buildDrivingSafetyViolationPayload(data, employeeId));
			openSuccessToast("Driving safety violation created");
			router.push(routes.admin.drivingSafetyIncidentReports);
		} catch (error) {
			openErrorToast({ error: error as Error });
		}
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4 lg:grid-cols-3">
				<div className="space-y-3 rounded-[10px] border-none bg-white p-4 shadow-sm lg:col-span-2">
					<div className="space-y-1">
						<h4 className="text-sm font-medium text-brand-grey">Create Safety Violation — Driving</h4>
						<p className="text-xs text-brand-grey">
							Manual path for office-received violations (school bus tickets, mailed traffic violations). Geotab events
							ingest automatically.
						</p>
					</div>

					<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
						<div className="space-y-1.5">
							<p className="font-inter text-sm font-normal text-brand-grey">
								Employee Name<span className="ml-0.5 align-super text-xs leading-none text-brand-grey">*</span>
							</p>
							<SearchableSelect
								value={employeeId}
								onChange={setEmployeeId}
								placeholder="Select Employee"
								options={(employees ?? []).map((employee) => ({ label: employee.name, value: employee.employeeId }))}
							/>
						</div>
						<FormInputWrapper form={form} fieldConfig={buildTruckField(truckOptions)} wrapperClassName="space-y-1" />
					</div>

					<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
						<FormInputWrapper form={form} fieldConfig={buildViolationTypeField(violationTypeOptions)} />
						<div className="space-y-1.5">
							<p className="font-inter text-sm font-normal text-brand-grey">
								Point Weight<span className="ml-0.5 align-super text-xs leading-none text-brand-grey">*</span>
							</p>
							<Input
								value={selectedType ? String(selectedType.points ?? "TBD") : ""}
								placeholder="--"
								readOnly
								disabled
								className="h-10 rounded-[8px] !border-none !bg-brand-bgLightgrey"
							/>
							<p className="text-xs text-brand-grey">Set by policy — override in review</p>
						</div>
					</div>

					<div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
						<FormInputWrapper form={form} fieldConfig={severityField} />
						<FormField
							control={form.control}
							name="violationDate"
							render={({ field }) => (
								<FormItem className="gap-1.5">
									<FormLabel className="font-inter text-sm font-normal text-brand-grey">
										Date<span className="ml-0.5 align-super text-xs leading-none text-brand-grey">*</span>
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
							name="violationTime"
							render={({ field }) => (
								<FormItem className="gap-1.5">
									<FormLabel className="font-inter text-sm font-normal text-brand-grey">Time</FormLabel>
									<FormControl>
										<TimeInput
											date={violationDate ?? new Date()}
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

					<FormInputWrapper form={form} fieldConfig={descriptionField} />

					<div>
						<p className="mb-1.5 font-inter text-sm font-normal text-brand-grey">Upload Supporting Documents</p>
						<Controller
							name="documents"
							control={form.control}
							render={({ field }) => <DocumentUpload value={field.value ?? []} onChange={field.onChange} />}
						/>
					</div>

					<div className="flex gap-2 pt-2">
						<Button type="button" variant="outline" className="w-full" onClick={() => router.back()}>
							Cancel
						</Button>
						<Button type="submit" variant="filled" className="w-full" loading={createViolation.isPending}>
							Create Driving Safety Violation
						</Button>
					</div>
				</div>

				<div className="lg:col-span-1">
					<PolicyReferenceCard selectedType={selectedType} />
				</div>
			</form>
		</Form>
	);
};

export default DrivingSafetyViolationForm;
