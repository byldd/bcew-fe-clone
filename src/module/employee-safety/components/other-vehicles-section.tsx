import { useEffect } from "react";
import { Controller, useFieldArray, UseFormReturn, useWatch } from "react-hook-form";

import { FormInputWrapper } from "@/components/common/form/form-input-wrapper";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils/utils";

import ReportSection from "./report-section";
import { IAccidentReportSchema } from "../utils/accident-report-schema";
import { buildOtherVehicleFields, buildOtherVehicleImageFields } from "../utils/accident-report-fields";

const RefusedCheckbox = ({
	form,
	name,
	disabled,
	onRefuse,
}: {
	form: UseFormReturn<IAccidentReportSchema>;
	name:
		| `otherVehicles.${number}.refusedDriverLicense`
		| `otherVehicles.${number}.refusedInsuranceCard`
		| `otherVehicles.${number}.refusedDriverLicensePhoto`;
	disabled?: boolean;
	onRefuse: () => void;
}) => (
	<Controller
		name={name}
		control={form.control}
		render={({ field }) => (
			<label className={cn("flex items-center gap-2 text-xs text-brand-dark", disabled && "text-brand-grey")}>
				<Checkbox
					checked={field.value === true}
					onCheckedChange={(checked) => {
						const isChecked = checked === true;
						field.onChange(isChecked);
						if (isChecked) onRefuse();
					}}
					disabled={disabled}
				/>
				<span>Other party refused to provide</span>
			</label>
		)}
	/>
);

const OtherVehicleBlock = ({
	form,
	index,
	disabled,
	uploadDisabled,
	canDelete,
}: {
	form: UseFormReturn<IAccidentReportSchema>;
	index: number;
	disabled?: boolean;
	uploadDisabled?: boolean;
	canDelete?: boolean;
}) => {
	const fields = buildOtherVehicleFields(index);
	const imageFields = buildOtherVehicleImageFields(index);
	const vehicle = useWatch({ control: form.control, name: `otherVehicles.${index}` });

	return (
		<div className="space-y-6">
			<ReportSection title={`Other Details: Vehicle ${index + 1}`}>
				<div className="space-y-3">
					<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
						<FormInputWrapper form={form} fieldConfig={fields.make} disabled={disabled} />
						<FormInputWrapper form={form} fieldConfig={fields.model} disabled={disabled} />
					</div>
					<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
						<FormInputWrapper form={form} fieldConfig={fields.whatWasStruck} disabled={disabled} />
						<FormInputWrapper form={form} fieldConfig={fields.vin} disabled={disabled} />
					</div>
					<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
						<FormInputWrapper form={form} fieldConfig={fields.driverFullName} disabled={disabled} />
						<div className="space-y-2">
							<FormInputWrapper
								form={form}
								fieldConfig={fields.driverLicenseNumber}
								disabled={disabled || vehicle?.refusedDriverLicense === true}
							/>
							<RefusedCheckbox
								form={form}
								name={`otherVehicles.${index}.refusedDriverLicense`}
								disabled={disabled}
								onRefuse={() => form.setValue(`otherVehicles.${index}.driverLicenseNumber`, "")}
							/>
						</div>
					</div>
				</div>
			</ReportSection>

			<ReportSection title={`Required Photos of Vehicle ${index + 1}`}>
				<div className="space-y-3">
					<div className="space-y-2">
						<FormInputWrapper
							form={form}
							fieldConfig={imageFields.insuranceCard}
							disabled={uploadDisabled || vehicle?.refusedInsuranceCard === true}
							canDelete={canDelete && vehicle?.refusedInsuranceCard !== true}
						/>
						<RefusedCheckbox
							form={form}
							name={`otherVehicles.${index}.refusedInsuranceCard`}
							disabled={disabled}
							onRefuse={() => form.setValue(`otherVehicles.${index}.insuranceCardImages`, [])}
						/>
					</div>
					<div className="space-y-2">
						<FormInputWrapper
							form={form}
							fieldConfig={imageFields.driverLicense}
							disabled={uploadDisabled || vehicle?.refusedDriverLicensePhoto === true}
							canDelete={canDelete && vehicle?.refusedDriverLicensePhoto !== true}
						/>
						<RefusedCheckbox
							form={form}
							name={`otherVehicles.${index}.refusedDriverLicensePhoto`}
							disabled={disabled}
							onRefuse={() => form.setValue(`otherVehicles.${index}.driverLicenseImages`, [])}
						/>
					</div>
					<FormInputWrapper
						form={form}
						fieldConfig={imageFields.vehicleDamage}
						disabled={uploadDisabled}
						canDelete={canDelete}
					/>
				</div>
			</ReportSection>
		</div>
	);
};

const OtherVehiclesSection = ({
	form,
	count,
	disabled,
	uploadDisabled,
	canDelete,
}: {
	form: UseFormReturn<IAccidentReportSchema>;
	count: number;
	disabled?: boolean;
	uploadDisabled?: boolean;
	canDelete?: boolean;
}) => {
	const { fields, append, remove } = useFieldArray({ control: form.control, name: "otherVehicles" });

	// Keep the otherVehicles array length in sync with the selected vehicle count.
	// shouldFocus:false — otherwise appending focuses the new block and scrolls the page.
	useEffect(() => {
		if (fields.length < count) {
			for (let i = fields.length; i < count; i++) append({}, { shouldFocus: false });
		} else if (fields.length > count) {
			for (let i = fields.length - 1; i >= count; i--) remove(i);
		}
	}, [count, fields.length, append, remove]);

	return (
		<>
			{fields.slice(0, count).map((field, index) => (
				<OtherVehicleBlock
					key={field.id}
					form={form}
					index={index}
					disabled={disabled}
					uploadDisabled={uploadDisabled}
					canDelete={canDelete}
				/>
			))}
		</>
	);
};

export default OtherVehiclesSection;
