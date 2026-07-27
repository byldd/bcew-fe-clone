import VehicleDocumentsTemplate from "@/module/employee-safety/templates/vehicle-documents-template";
import React, { Suspense } from "react";

export default function VehicleDocumentsPage() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<VehicleDocumentsTemplate />
		</Suspense>
	);
}
