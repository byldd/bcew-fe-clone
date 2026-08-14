import { UseFormReturn, useWatch } from "react-hook-form";

import { FormInputWrapper } from "@/components/common/form/form-input-wrapper";

import ReportSection from "./report-section";
import { YES_NO } from "../enums";
import { IAccidentReportSchema } from "../utils/accident-report-schema";
import { policeContactedField, policeFields } from "../utils/accident-report-fields";

const PoliceSection = ({ form, disabled }: { form: UseFormReturn<IAccidentReportSchema>; disabled?: boolean }) => {
	const contacted = useWatch({ control: form.control, name: "policeContacted" }) === YES_NO.YES;

	return (
		<ReportSection title="Were Police Contacted?">
			<FormInputWrapper form={form} fieldConfig={policeContactedField} disabled={disabled} />
			{contacted &&
				policeFields.map((fieldConfig) => (
					<FormInputWrapper key={fieldConfig.name} form={form} fieldConfig={fieldConfig} disabled={disabled} />
				))}
		</ReportSection>
	);
};

export default PoliceSection;
