import { UseFormReturn } from "react-hook-form";

import { InputField } from "@/components/ui/inputField";
import { Spinner } from "@/components/ui/spinner";

import ReportSection from "./report-section";
import { useTruckLookup } from "../hooks/useTruckLookup";
import { IAccidentReportSchema } from "../utils/accident-report-schema";

const BcewVehicleInfoSection = ({
	form,
	disabled,
}: {
	form: UseFormReturn<IAccidentReportSchema>;
	disabled?: boolean;
}) => {
	const { truckNumber, vin, licensePlate, isFetching, lookupError } = useTruckLookup(form);

	return (
		<ReportSection title="Which  vehicle was involved?">
			<div className="space-y-4 text-sm">
				<InputField
					name="truckNumber"
					placeholder="e.g. 142"
					label="Enter Truck Number"
					value={truckNumber}
					onChange={(event) => form.setValue("truckNumber", event.target.value, { shouldDirty: true })}
					disabled={disabled}
					error={lookupError}
				/>

				<div className="grid grid-cols-2 gap-3">
					<div className="space-y-1">
						<p className="text-sm text-brand-grey">VIN</p>
						{isFetching ? (
							<Spinner size="small" className="text-brand-grey" />
						) : (
							<p className="font-medium text-brand-dark">{vin || "-"}</p>
						)}
					</div>
					<div className="space-y-1">
						<p className="text-sm text-brand-grey">License Plate</p>
						{isFetching ? (
							<Spinner size="small" className="text-brand-grey" />
						) : (
							<p className="font-medium text-brand-dark">{licensePlate || "-"}</p>
						)}
					</div>
				</div>
			</div>
		</ReportSection>
	);
};

export default BcewVehicleInfoSection;
