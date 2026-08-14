import { UseFormReturn } from "react-hook-form";

import { InputField } from "@/components/ui/inputField";
import { Spinner } from "@/components/ui/spinner";

import { useTruckLookup } from "../hooks/useTruckLookup";
import { IAccidentReportSchema } from "../utils/accident-report-schema";

const ReadOnlyVehicleField = ({
	label,
	value,
	loading,
}: {
	label: string;
	value: string | null | undefined;
	loading: boolean;
}) => (
	<div className="space-y-1">
		<p className="text-sm text-brand-dark50">{label}</p>
		{loading ? (
			<Spinner size="small" className="text-brand-grey" />
		) : (
			<p className="text-sm font-medium text-brand-dark">{value || "-"}</p>
		)}
	</div>
);

// Truck number input + resolved VIN / license plate rendered as three grid cells, for
// use inside the Employee & Vehicle Information grid (matches the Add New Record page).
const BcewVehicleInfoFields = ({
	form,
	disabled,
}: {
	form: UseFormReturn<IAccidentReportSchema>;
	disabled?: boolean;
}) => {
	const { truckNumber, vin, licensePlate, isFetching, lookupError } = useTruckLookup(form);

	return (
		<>
			<InputField
				name="truckNumber"
				placeholder="e.g. 125"
				label="Truck Number"
				value={truckNumber}
				onChange={(event) => form.setValue("truckNumber", event.target.value, { shouldDirty: true })}
				disabled={disabled}
				error={lookupError}
			/>
			<ReadOnlyVehicleField label="VIN" value={vin} loading={isFetching} />
			<ReadOnlyVehicleField label="License Plate" value={licensePlate} loading={isFetching} />
		</>
	);
};

export default BcewVehicleInfoFields;
