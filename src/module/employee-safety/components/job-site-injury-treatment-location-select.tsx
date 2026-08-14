import { UseFormReturn, useWatch } from "react-hook-form";

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { IJobSiteInjurySchema } from "../utils/job-site-injury-schema";
import { MEDICAL_TREATMENT_LOCATION_OTHER } from "../enums";
import { IMedicalTreatmentLocation } from "../types";
import { FormLabelRequired } from "@/components/ui/formLabelrequired";

type JobSiteInjuryTreatmentLocationSelectProps = {
	form: UseFormReturn<IJobSiteInjurySchema>;
	locations: IMedicalTreatmentLocation[];
	disabled?: boolean;
	// Lets a caller render its own, separately-positioned "Other" text field
	// (e.g. spanning a wider grid column) instead of this inline one.
	hideOtherInput?: boolean;
};

// Managed treatment-location dropdown that also allows a free-text "Other" entry
// (stored back into `medicalTreatmentLocation`, with `isMedicalTreatmentLocationOther`
// marking it as manual) — mirrors TreatmentLocationSelect used by vehicle-accident.
const JobSiteInjuryTreatmentLocationSelect = ({
	form,
	locations,
	disabled,
	hideOtherInput,
}: JobSiteInjuryTreatmentLocationSelectProps) => {
	const isOther = useWatch({ control: form.control, name: "isMedicalTreatmentLocationOther" }) === true;

	return (
		<FormField
			control={form.control}
			name="medicalTreatmentLocation"
			render={({ field }) => (
				<FormItem className="space-y-1">
					<FormLabelRequired
						htmlFor={field.name}
						label="Medical Treatment Location"
						required
						className="font-inter text-sm font-normal text-brand-grey"
					/>
					<FormControl className="space-y-2">
						<Select
							disabled={disabled}
							value={isOther ? MEDICAL_TREATMENT_LOCATION_OTHER : (field.value ?? "")}
							onValueChange={(value) => {
								if (value === MEDICAL_TREATMENT_LOCATION_OTHER) {
									form.setValue("isMedicalTreatmentLocationOther", true);
									field.onChange("");
								} else {
									form.setValue("isMedicalTreatmentLocationOther", false);
									field.onChange(value);
								}
							}}
						>
							<SelectTrigger className="rounded-[10px] border-none bg-brand-bgLightgrey">
								<SelectValue placeholder="Select" />
							</SelectTrigger>
							<SelectContent>
								<SelectGroup>
									{locations.map((location) => (
										<SelectItem key={location.id} value={location.name}>
											{location.name}
										</SelectItem>
									))}
									<SelectItem value={MEDICAL_TREATMENT_LOCATION_OTHER}>Other</SelectItem>
								</SelectGroup>
							</SelectContent>
						</Select>
					</FormControl>
					{isOther && !hideOtherInput && (
						<Input
							value={field.value ?? ""}
							onChange={field.onChange}
							disabled={disabled}
							placeholder="Enter location"
							className="h-10 rounded-[8px] border-none bg-brand-bgLightgrey"
						/>
					)}
					<FormMessage />
				</FormItem>
			)}
		/>
	);
};

export default JobSiteInjuryTreatmentLocationSelect;
