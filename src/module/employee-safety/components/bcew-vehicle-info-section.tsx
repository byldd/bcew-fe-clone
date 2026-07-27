import { useEffect } from "react";
import { UseFormReturn, useWatch } from "react-hook-form";

import { InputField } from "@/components/ui/inputField";
import { Spinner } from "@/components/ui/spinner";
import { useDebounce } from "@/hooks/useDebounce";

import ReportSection from "./report-section";
import { useVehicleDocuments } from "../hooks/useVehicleDocuments";
import { IAccidentReportSchema } from "../utils/accident-report-schema";

const BcewVehicleInfoSection = ({
	form,
	disabled,
}: {
	form: UseFormReturn<IAccidentReportSchema>;
	disabled?: boolean;
}) => {
	const truckNumber = useWatch({ control: form.control, name: "truckNumber" }) ?? "";
	const vin = useWatch({ control: form.control, name: "vin" });
	const licensePlate = useWatch({ control: form.control, name: "licensePlate" });

	const debouncedTruck = useDebounce(truckNumber.trim(), 400);
	const { data, isFetching, isError } = useVehicleDocuments(debouncedTruck || null);

	useEffect(() => {
		if (data?.vehicle) {
			form.setValue("vin", data.vehicle.vin ?? "");
			form.setValue("licensePlate", data.vehicle.licensePlate ?? "");
		}
	}, [data, form]);

	useEffect(() => {
		if (isError) {
			form.setValue("vin", "");
			form.setValue("licensePlate", "");
		}
	}, [isError, form]);

	const lookupError = debouncedTruck && isError ? "No vehicle found for this truck number." : undefined;

	return (
		<ReportSection title="Which BCEW vehicle was involved?">
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
