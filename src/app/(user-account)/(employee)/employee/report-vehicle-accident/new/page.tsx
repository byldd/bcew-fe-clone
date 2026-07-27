"use client";
import NewVehicleAccidentReportTemplate from "@/module/employee-safety/templates/new-vehicle-accident-report-template";
import React, { Suspense } from "react";

export default function NewVehicleAccidentReportPage() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<NewVehicleAccidentReportTemplate />
		</Suspense>
	);
}
