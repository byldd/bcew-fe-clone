import { ChevronLeft } from "lucide-react";
import { UseFormReturn, useWatch } from "react-hook-form";

import { FormInputWrapper } from "@/components/common/form/form-input-wrapper";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

import ReportSection from "./report-section";
import { focusFirstError } from "../utils/focus-first-error";
import TreatmentLocationSelect from "./treatment-location-select";
import { IAccidentReportSchema } from "../utils/accident-report-schema";
import {
	buildInjuryPainLevelField,
	injuryAdditionalNotesField,
	injuryBodyPartField,
	injuryDidLeaveWorkToggleField,
	injuryExpectedReturnDateField,
	injuryNatureField,
	injuryWorkRestrictionsField,
} from "../utils/accident-report-fields";
import { YES_NO } from "../enums";
import { IFormOption, IMedicalTreatmentLocation } from "../types";
import { FormLabelRequired } from "@/components/ui/formLabelrequired";

type InjuryReportPageProps = {
	form: UseFormReturn<IAccidentReportSchema>;
	painLevels: IFormOption[];
	treatmentLocations: IMedicalTreatmentLocation[];
	onCancel: () => void;
	onCreate: () => void;
	disabled?: boolean;
};

const InjuryReportPage = ({
	form,
	painLevels,
	treatmentLocations,
	onCancel,
	onCreate,
	disabled,
}: InjuryReportPageProps) => {
	const didLeaveWork = useWatch({ control: form.control, name: "injury.didLeaveWork" }) === true;

	const handleCreate = async () => {
		if (!form.getValues("injury.bodyPartInjured")?.trim()) {
			form.setError("injury.bodyPartInjured", { message: "This field is required" });
			focusFirstError(form.formState.errors);
			return;
		}

		if (!(await form.trigger("injury"))) {
			focusFirstError(form.formState.errors);
			return;
		}
		onCreate();
	};

	return (
		<Form {...form}>
			<div className="min-h-screen w-full overflow-y-auto bg-brand-bgLightgrey p-4 pb-20">
				<div className="mb-3 ml-[-6px] flex items-center gap-1">
					<button type="button" onClick={onCancel} className="text-brand-dark">
						<ChevronLeft size={22} />
					</button>
					<h3 className="text-xl font-medium">Injury Report</h3>
				</div>

				<ReportSection title="Injury Details">
					<FormInputWrapper form={form} fieldConfig={injuryBodyPartField} disabled={disabled} />
					<FormInputWrapper form={form} fieldConfig={injuryNatureField} disabled={disabled} />
					<FormInputWrapper form={form} fieldConfig={buildInjuryPainLevelField(painLevels)} disabled={disabled} />

					<FormField
						control={form.control}
						name="injury.firstAidProvided"
						render={({ field }) => (
							<FormItem className="gap-1.5" data-error-anchor="injury.firstAidProvided">
								<FormLabelRequired
									htmlFor={field.name}
									label="Was first aid Provided?"
									required
									className="font-inter text-sm font-normal text-brand-grey"
								/>
								<FormControl>
									<RadioGroup
										value={field.value === true ? YES_NO.YES : field.value === false ? YES_NO.NO : ""}
										onValueChange={(value) => field.onChange(value === YES_NO.YES)}
										disabled={disabled}
										className="flex items-center gap-4"
									>
										<div className="flex items-center space-x-2">
											<RadioGroupItem value={YES_NO.YES} id="firstAidYes" />
											<Label htmlFor="firstAidYes" className="text-sm font-medium">
												Yes
											</Label>
										</div>
										<div className="flex items-center space-x-2">
											<RadioGroupItem value={YES_NO.NO} id="firstAidNo" />
											<Label htmlFor="firstAidNo" className="text-sm font-medium">
												No
											</Label>
										</div>
									</RadioGroup>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<TreatmentLocationSelect
						form={form}
						name="injury.treatingPhysicianClinic"
						otherFlagName="injury.isTreatingPhysicianClinicOther"
						label="Please select Treating Physician / Clinic"
						locations={treatmentLocations}
						disabled={disabled}
					/>
				</ReportSection>

				<div className="mt-3 rounded-[10px] border bg-white p-4">
					<FormInputWrapper form={form} fieldConfig={injuryDidLeaveWorkToggleField} disabled={disabled} />
					{didLeaveWork && (
						<div className="mt-3 space-y-3">
							<FormInputWrapper form={form} fieldConfig={injuryWorkRestrictionsField} disabled={disabled} />
							<FormInputWrapper form={form} fieldConfig={injuryExpectedReturnDateField} disabled={disabled} />
							<FormInputWrapper form={form} fieldConfig={injuryAdditionalNotesField} disabled={disabled} />
						</div>
					)}
				</div>

				<div className="fixed bottom-0 left-0 right-0 z-50 flex gap-2 bg-white px-4 py-3 shadow-md">
					<Button type="button" variant="outline" className="w-full" onClick={onCancel}>
						{disabled ? "Back" : "Cancel"}
					</Button>
					{!disabled && (
						<Button type="button" variant="filled" className="w-full" onClick={handleCreate}>
							Create Injury Report
						</Button>
					)}
				</div>
			</div>
		</Form>
	);
};

export default InjuryReportPage;
