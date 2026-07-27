"use client";

import { AxiosError } from "axios";
import { useSearchParams } from "next/navigation";

import BackButton from "@/components/common/back-button";
import { Spinner } from "@/components/ui/spinner";

import FleetInsuranceCard from "../components/fleet-insurance-card";
import VehicleRegistrationCard from "../components/vehicle-registration-card";
import { useVehicleDocuments } from "../hooks/useVehicleDocuments";

const VehicleDocumentsTemplate = () => {
	const truckNumber = useSearchParams().get("truckNumber");

	const { data, isPending, isError, error } = useVehicleDocuments(truckNumber);

	const errorMessage =
		(error as AxiosError<{ message: string }>)?.response?.data?.message ?? "Something went wrong. Please try again.";

	const truckLabel = truckNumber?.replace(/^\s*truck\s*/i, "").trim();

	return (
		<div className="flex h-screen w-full flex-col bg-brand-bgLightgrey">
			<div className="shrink-0 p-4 pb-0">
				<div className="ml-[-10px] flex items-center gap-1">
					<BackButton />
					<h3 className="text-xl font-medium">{truckLabel ? `Truck ${truckLabel} · Documents` : "Documents"}</h3>
				</div>
			</div>

			<div className="flex-1 space-y-3 overflow-y-auto p-4">
				{isPending && (
					<div className="flex h-full items-center justify-center">
						<Spinner size="large">
							<p className="mt-3 text-sm text-brand-grey">Loading documents...</p>
						</Spinner>
					</div>
				)}

				{isError && (
					<section className="space-y-1 rounded-xl bg-red-50 p-4">
						<p className="text-sm font-semibold text-brand-red">No documents found</p>
						<p className="text-xs text-brand-red">{errorMessage}</p>
					</section>
				)}

				{data && (
					<>
						<section className="space-y-1 rounded-xl bg-gray-200 p-4">
							<p className="text-sm font-medium text-brand-dark">Registration &amp; insurance found</p>
							<p className="text-xs text-brand-grey">
								Results for Truck {data.vehicle.truckNumber}. Show these to the officer or other party at the scene, or
								download to share.
							</p>
						</section>

						<VehicleRegistrationCard vehicle={data.vehicle} />
						<FleetInsuranceCard insurance={data.insurance} />
					</>
				)}
			</div>
		</div>
	);
};

export default VehicleDocumentsTemplate;
