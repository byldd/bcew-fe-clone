import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { MEDICAL_TREATMENT_LOCATION_OTHER } from "../enums";
import { TreatmentLocationSelectProps } from "../types";
import { useWatch } from "react-hook-form";

const TreatmentLocationSelect = ({
	form,
	name,
	otherFlagName,
	label,
	locations,
	disabled,
}: TreatmentLocationSelectProps) => {
	const isOther = useWatch({ control: form.control, name: otherFlagName }) === true;

	return (
		<FormField
			control={form.control}
			name={name}
			render={({ field }) => (
				<FormItem className="space-y-2" data-error-anchor={name}>
					<FormLabel className="font-inter text-sm font-normal text-brand-grey">
						{label}
						<span className="ml-0.5 align-super text-xs leading-none text-brand-grey">*</span>
					</FormLabel>
					<FormControl>
						<Select
							disabled={disabled}
							value={isOther ? MEDICAL_TREATMENT_LOCATION_OTHER : ((field.value as string) ?? "")}
							onValueChange={(value) => {
								if (value === MEDICAL_TREATMENT_LOCATION_OTHER) {
									form.setValue(otherFlagName, true as never);
									field.onChange("");
								} else {
									form.setValue(otherFlagName, false as never);
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
					{isOther && (
						<Input
							value={(field.value as string) ?? ""}
							onChange={field.onChange}
							placeholder="Type Here"
							disabled={disabled}
							className="h-10 rounded-[10px] border-none bg-brand-bgLightgrey"
						/>
					)}
					<FormMessage />
				</FormItem>
			)}
		/>
	);
};

export default TreatmentLocationSelect;
