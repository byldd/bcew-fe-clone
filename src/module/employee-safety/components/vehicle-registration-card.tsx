import { routes } from "@/config/routes";

import { IVehicleDocumentsVehicle } from "../types";
import DocumentDetailRow from "./document-detail-row";
import DocumentPdfLink from "./document-pdf-link";
import { FALLBACK } from "@/module/job-level-details/constants";

const VehicleRegistrationCard = ({ vehicle }: { vehicle: IVehicleDocumentsVehicle }) => {
	const yearMakeModel = [vehicle.year, vehicle.make, vehicle.model].filter(Boolean).join(" ");

	return (
		<section className="rounded-xl bg-white p-4 shadow-sm">
			<p className="text-sm font-medium">Vehicle</p>

			<div className="mt-2">
				<DocumentDetailRow label="Truck number" value={vehicle.truckNumber} />
				<DocumentDetailRow label="Year / Make / Model" value={yearMakeModel || FALLBACK} />
				<DocumentDetailRow label="VIN" value={vehicle.vin ?? FALLBACK} />
				<DocumentDetailRow label="License plate" value={vehicle.licensePlate ?? FALLBACK} />
			</div>

			<DocumentPdfLink
				fileName="Vehicle Registration.pdf"
				href={routes.bcew.vehicleRegistrationPdf(vehicle.truckNumber)}
			/>
		</section>
	);
};

export default VehicleRegistrationCard;
