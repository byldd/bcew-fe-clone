import { UseFormReturn } from "react-hook-form";

import { FormInputWrapper } from "@/components/common/form/form-input-wrapper";

import ReportSection from "./report-section";
import { IAccidentReportSchema } from "../utils/accident-report-schema";
import { otherVehicleFields, otherVehiclePhotosField } from "../utils/accident-report-fields";

const OtherVehicleSection = ({
	form,
	disabled,
}: {
	form: UseFormReturn<IAccidentReportSchema>;
	disabled?: boolean;
}) => {
	return (
		<ReportSection title="Other Vehicle Involved">
			<div className="space-y-3">
				<div className="grid grid-cols-2 gap-3">
					<FormInputWrapper form={form} fieldConfig={otherVehicleFields.make} disabled={disabled} />
					<FormInputWrapper form={form} fieldConfig={otherVehicleFields.model} disabled={disabled} />
				</div>
				<FormInputWrapper form={form} fieldConfig={otherVehicleFields.whatWasStruck} disabled={disabled} />
				<FormInputWrapper form={form} fieldConfig={otherVehicleFields.vin} disabled={disabled} />
				<FormInputWrapper form={form} fieldConfig={otherVehicleFields.driverFullName} disabled={disabled} />
				<div className="grid grid-cols-2 gap-3">
					<FormInputWrapper form={form} fieldConfig={otherVehicleFields.driverLicenseNumber} disabled={disabled} />
					<FormInputWrapper form={form} fieldConfig={otherVehicleFields.driverPhoneNumber} disabled={disabled} />
				</div>
				<div className="grid grid-cols-2 gap-3">
					<FormInputWrapper form={form} fieldConfig={otherVehicleFields.insuranceCompany} disabled={disabled} />
					<FormInputWrapper form={form} fieldConfig={otherVehicleFields.policyNumber} disabled={disabled} />
				</div>
				<FormInputWrapper form={form} fieldConfig={otherVehiclePhotosField} canDelete={!disabled} />
			</div>
		</ReportSection>
	);
};

export default OtherVehicleSection;
