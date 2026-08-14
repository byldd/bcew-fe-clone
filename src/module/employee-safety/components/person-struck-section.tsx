import { useMemo } from "react";
import { UseFormReturn, useWatch } from "react-hook-form";

import { FormInputWrapper } from "@/components/common/form/form-input-wrapper";
import { useDailyJobAllEmployees } from "@/module/job/hooks/useEmployeeSchedule";

import ReportSection from "./report-section";
import { PERSON_STRUCK_TYPE, YES_NO } from "../enums";
import { IAccidentReportSchema } from "../utils/accident-report-schema";
import { buildPersonInvolvedEmployeeField, personStruckFields } from "../utils/accident-report-fields";

const PersonStruckSection = ({
	form,
	disabled,
}: {
	form: UseFormReturn<IAccidentReportSchema>;
	disabled?: boolean;
}) => {
	const whoWasStruck = useWatch({ control: form.control, name: "personInvolved.whoWasStruck" });
	const employeeInjured = useWatch({ control: form.control, name: "personInvolved.employeeInjured" });
	const isEmployee = whoWasStruck === PERSON_STRUCK_TYPE.EMPLOYEE;
	const isOtherPerson = whoWasStruck === PERSON_STRUCK_TYPE.OTHER;

	const { data: employees } = useDailyJobAllEmployees();
	const employeeOptions = useMemo(
		() => (employees ?? []).map((employee) => ({ label: employee.user?.name || "--", value: employee.id })),
		[employees]
	);

	return (
		<ReportSection title="Who was the Person Involved?">
			<div className="space-y-3">
				<FormInputWrapper form={form} fieldConfig={personStruckFields.whoWasStruck} disabled={disabled} />
				{isOtherPerson && (
					<>
						<FormInputWrapper form={form} fieldConfig={personStruckFields.fullName} disabled={disabled} />
						<FormInputWrapper form={form} fieldConfig={personStruckFields.phoneNumber} disabled={disabled} />
						<FormInputWrapper form={form} fieldConfig={personStruckFields.personInjured} disabled={disabled} />
						{employeeInjured === YES_NO.YES && (
							<FormInputWrapper form={form} fieldConfig={personStruckFields.injuryDescription} disabled={disabled} />
						)}
					</>
				)}
				{isEmployee && (
					<>
						<FormInputWrapper
							form={form}
							fieldConfig={buildPersonInvolvedEmployeeField(employeeOptions)}
							disabled={disabled}
						/>
						<FormInputWrapper form={form} fieldConfig={personStruckFields.employeeInjured} disabled={disabled} />
						{employeeInjured === YES_NO.YES && (
							<FormInputWrapper
								form={form}
								fieldConfig={personStruckFields.employeeInjuryDescription}
								disabled={disabled}
							/>
						)}
					</>
				)}
			</div>
		</ReportSection>
	);
};

export default PersonStruckSection;
