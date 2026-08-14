import { useEffect } from "react";
import { UseFormReturn, useWatch } from "react-hook-form";

import { useDebounce } from "@/hooks/useDebounce";

import { useVehicleDocuments } from "./useVehicleDocuments";
import { IAccidentReportSchema } from "../utils/accident-report-schema";

// Resolves the entered truck number to its VIN / license plate and writes them back
// into the form. Shared by the technician "Which BCEW vehicle was involved?" section
// and the admin edit form's Employee & Vehicle Information section.
export const useTruckLookup = (form: UseFormReturn<IAccidentReportSchema>) => {
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

	return { truckNumber, vin, licensePlate, isFetching, lookupError };
};
