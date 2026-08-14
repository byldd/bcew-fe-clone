import { UseFormReturn, useWatch } from "react-hook-form";

import { FormInputWrapper } from "@/components/common/form/form-input-wrapper";

import ReportSection from "./report-section";
import { IAccidentReportSchema } from "../utils/accident-report-schema";
import { followUpFields } from "../utils/accident-report-fields";
import { YES_NO } from "../enums";

const InfoNote = ({ children }: { children: string }) => (
	<div className="rounded-[8px] bg-[#9A6A001A] px-3 py-2 text-xs text-[#9A6A00]">{children}</div>
);

const FollowUpQuestionsSection = ({
	form,
	disabled,
}: {
	form: UseFormReturn<IAccidentReportSchema>;
	disabled?: boolean;
}) => {
	const propertyDamage = useWatch({ control: form.control, name: "propertyDamage" });
	const anotherCompanyStruck = propertyDamage?.anotherCompanyProperty === YES_NO.YES;
	const builderStruck = propertyDamage?.builderProperty === YES_NO.YES;
	const homeownerStruck = propertyDamage?.homeownerProperty === YES_NO.YES;

	return (
		<ReportSection title="Follow Up Questions">
			<div className="space-y-3">
				<FormInputWrapper
					form={form}
					fieldConfig={followUpFields.anotherCompanyProperty}
					disabled={disabled}
					wrapperClassName="space-y-3"
				/>
				{anotherCompanyStruck && (
					<div className="space-y-3">
						<InfoNote>Collect company&apos;s information</InfoNote>
						<FormInputWrapper form={form} fieldConfig={followUpFields.companyName} disabled={disabled} />
						<FormInputWrapper form={form} fieldConfig={followUpFields.contactPersonName} disabled={disabled} />
						<FormInputWrapper form={form} fieldConfig={followUpFields.contactPhoneNumber} disabled={disabled} />
						<FormInputWrapper form={form} fieldConfig={followUpFields.otherInformation} disabled={disabled} />
					</div>
				)}

				<FormInputWrapper
					form={form}
					fieldConfig={followUpFields.builderProperty}
					disabled={disabled}
					wrapperClassName="space-y-3"
				/>
				{builderStruck && (
					<InfoNote>Inform the foreman to contact the builder representative regarding the property damage.</InfoNote>
				)}

				<FormInputWrapper
					form={form}
					fieldConfig={followUpFields.homeownerProperty}
					disabled={disabled}
					wrapperClassName="space-y-3"
				/>
				{homeownerStruck && <InfoNote>Inform homeowner about the accident</InfoNote>}
			</div>
		</ReportSection>
	);
};

export default FollowUpQuestionsSection;
