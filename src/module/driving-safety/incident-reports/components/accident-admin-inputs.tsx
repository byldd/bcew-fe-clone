"use client";

import { UseFormReturn, useWatch } from "react-hook-form";

import { FormInputWrapper } from "@/components/common/form/form-input-wrapper";
import { cn } from "@/lib/utils/utils";
import { useMedicalTreatmentLocations } from "@/module/employee-safety/hooks/useVehicleAccident";
import { MEDICAL_TREATMENT_LOCATION_OTHER, YES_NO } from "@/module/employee-safety/enums";

import { IAccidentReviewSchema } from "../utils/accident-review-schema";
import {
	bcewTowedField,
	buildMedicalTreatmentLocationField,
	drugScreenNeededField,
	impoundLotCostField,
	impoundReleaseChargesField,
	impoundedField,
	medicalCareNeededField,
	medicalTreatmentLocationOtherField,
	otherVehicleTowCostField,
	otherVehicleTowedField,
	towCostField,
	towProviderField,
} from "../utils/accident-admin-input-fields";
import { InfoNote } from "./info-note";
import { ReviewCard } from "./review-card";
import { Button } from "@/components/ui/button";

const SectionTitle = ({ children }: { children: string }) => (
	<h4 className="text-sm font-medium text-brand-dark">{children}</h4>
);

const AskTechnicianButton = ({ isAsked, onToggle }: { isAsked: boolean; onToggle: () => void }) => (
	<Button
		type="button"
		onClick={onToggle}
		className={cn(
			"h-8 shrink-0 rounded-[8px] border px-3 py-1 text-xs font-medium transition-colors",
			isAsked ? "border-brand-dark bg-brand-dark text-white" : "border-brand-dark10 text-brand-dark"
		)}
	>
		{isAsked ? "Remove Ask Technician" : "Ask Technician"}
	</Button>
);

const AccidentAdminInputs = ({
	form,
	disabled,
	anotherVehicleInvolved,
	personStruck,
	objectStruck,
	showAskTow = false,
	isTowAsked = false,
	onToggleAskTow,
	className,
}: {
	form: UseFormReturn<IAccidentReviewSchema>;
	disabled?: boolean;
	anotherVehicleInvolved: boolean;
	personStruck: boolean;
	objectStruck: boolean;
	showAskTow?: boolean;
	isTowAsked?: boolean;
	onToggleAskTow?: () => void;
	className?: string;
}) => {
	const values = useWatch({ control: form.control });
	const { data: medicalLocations } = useMedicalTreatmentLocations();

	const medicalLocationOptions = [
		...(medicalLocations ?? []).map((location) => ({ label: location.name, value: location.name })),
		{ label: "Other", value: MEDICAL_TREATMENT_LOCATION_OTHER },
	];

	const showMedicalLocation = values.medicalCareNeeded === YES_NO.YES;
	const showEnterLocation = showMedicalLocation && values.medicalTreatmentLocation === MEDICAL_TREATMENT_LOCATION_OTHER;

	return (
		<ReviewCard title="Inputs Needed from Admin" className={className}>
			<div className="space-y-4">
				<div className="space-y-3">
					<div className="mt-3 flex items-center justify-between gap-2">
						<SectionTitle>Tow &amp; Impound (optional)</SectionTitle>
						{showAskTow && onToggleAskTow && <AskTechnicianButton isAsked={isTowAsked} onToggle={onToggleAskTow} />}
					</div>
					<fieldset disabled={isTowAsked} className={cn("space-y-3", isTowAsked && "pointer-events-none opacity-60")}>
						<FormInputWrapper
							form={form}
							fieldConfig={bcewTowedField}
							disabled={disabled}
							wrapperClassName="space-y-3"
						/>
						{values.bcewVehicleTowed === YES_NO.YES && (
							<div className="grid grid-cols-2 gap-4">
								<FormInputWrapper form={form} fieldConfig={towProviderField} disabled={disabled} />
								<FormInputWrapper form={form} fieldConfig={towCostField} disabled={disabled} />
							</div>
						)}
						{values.bcewVehicleTowed === YES_NO.NO && (
							<p className="text-xs text-brand-dark50">No tow was required for the vehicle.</p>
						)}
						{anotherVehicleInvolved && (
							<>
								<FormInputWrapper
									form={form}
									fieldConfig={otherVehicleTowedField}
									disabled={disabled}
									wrapperClassName="space-y-3"
								/>
								{values.otherVehicleTowed === YES_NO.YES && (
									<FormInputWrapper form={form} fieldConfig={otherVehicleTowCostField} disabled={disabled} />
								)}
								{values.otherVehicleTowed === YES_NO.NO && (
									<p className="text-xs text-brand-dark50">No tow was required for the other vehicle.</p>
								)}
							</>
						)}
						<FormInputWrapper
							form={form}
							fieldConfig={impoundedField}
							disabled={disabled}
							wrapperClassName="space-y-3"
						/>
						{values.vehicleImpounded === YES_NO.YES && (
							<div className="grid grid-cols-2 gap-4">
								<FormInputWrapper form={form} fieldConfig={impoundLotCostField} disabled={disabled} />
								<FormInputWrapper form={form} fieldConfig={impoundReleaseChargesField} disabled={disabled} />
							</div>
						)}
						{values.vehicleImpounded === YES_NO.NO && (
							<p className="text-xs text-brand-dark50">The BCEW vehicle was not impounded.</p>
						)}
					</fieldset>
				</div>

				{(anotherVehicleInvolved || personStruck || objectStruck) && (
					<div className="space-y-1 border-t border-brand-dark10 pt-3">
						<SectionTitle>Was Drug Screen needed?</SectionTitle>
						<FormInputWrapper
							form={form}
							fieldConfig={drugScreenNeededField}
							disabled={disabled}
							wrapperClassName="space-y-2"
						/>
						{values.drugScreenNeeded === YES_NO.YES && (
							<InfoNote>Call drug coordinator to inform of drug screen.</InfoNote>
						)}
					</div>
				)}

				<div className="space-y-1 border-t border-brand-dark10 pt-2">
					<SectionTitle>Was medical care needed?</SectionTitle>
					<FormInputWrapper
						form={form}
						fieldConfig={medicalCareNeededField}
						disabled={disabled}
						wrapperClassName="space-y-1"
					/>
					{showMedicalLocation && (
						<div className="grid grid-cols-2 gap-4">
							<FormInputWrapper
								form={form}
								fieldConfig={buildMedicalTreatmentLocationField(medicalLocationOptions)}
								disabled={disabled}
							/>
							{showEnterLocation && (
								<FormInputWrapper form={form} fieldConfig={medicalTreatmentLocationOtherField} disabled={disabled} />
							)}
						</div>
					)}
				</div>
			</div>
		</ReviewCard>
	);
};

export default AccidentAdminInputs;
