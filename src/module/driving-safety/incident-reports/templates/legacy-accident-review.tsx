"use client";

import { ReactNode } from "react";

import { Spinner } from "@/components/ui/spinner";
import SidebarBackButton from "@/components/common/sidebar-back-button";
import { cn } from "@/lib/utils/utils";
import { toLocalFormattedDate } from "@/lib/utils/date";
import { DATE_FORMAT } from "@/types/date";

import { useLegacyAccidentDetail } from "../hooks/useAccidentReport";
import { ILegacyAccidentDetail, ILegacyOtherVehicle } from "../types";
import { asUtcInstant, INCIDENT_STATUS_META } from "../utils/constants";
import { FALLBACK } from "@/module/job-level-details/constants";
import { displayYesNo } from "../utils/build-incident-report-rows";

const Field = ({ label, value }: { label: string; value: ReactNode }) => (
	<div className="space-y-1">
		<p className="text-sm text-brand-dark50">{label}</p>
		<p className="text-sm font-medium text-brand-dark">{value || FALLBACK}</p>
	</div>
);

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
	<div className="space-y-4 border-t border-brand-dark10 py-5 first:border-t-0 first:pt-0">
		<h3 className="text-xs font-semibold uppercase tracking-wide text-brand-dark50">{title}</h3>
		<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
	</div>
);

const OtherVehicleCard = ({ vehicle, index }: { vehicle: ILegacyOtherVehicle; index: number }) => (
	<div className="space-y-4 rounded-[10px] border border-brand-dark10 p-4">
		<h4 className="text-sm font-semibold text-brand-dark">Vehicle {index + 1}</h4>
		<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
			<Field label="Year" value={vehicle.year} />
			<Field label="Make / Model" value={vehicle.makeModel} />
			<Field label="VIN" value={vehicle.vin} />
			<Field label="Damage" value={vehicle.damage} />
			<Field label="Driver Name" value={vehicle.driverName} />
			<Field label="Driver's License" value={vehicle.driverLicense} />
			<Field label="Driver Phone" value={vehicle.driverPhone} />
			<Field label="Insurance Company" value={vehicle.insuranceCompany} />
			<Field label="Insurance Number" value={vehicle.insuranceNumber} />
			<Field label="Vehicle Towed" value={displayYesNo(vehicle.vehicleTowed)} />
		</div>
	</div>
);

const LegacyAccidentBody = ({ report }: { report: ILegacyAccidentDetail }) => {
	const statusMeta = INCIDENT_STATUS_META[report.status];

	return (
		<div className="space-y-4">
			<div className="flex flex-wrap items-start justify-between gap-3">
				<div className="flex items-start">
					<SidebarBackButton />
					<div>
						<h2 className="text-2xl font-semibold text-brand-dark">{report.id}</h2>
						<div className="my-2 flex items-center gap-2">
							<span className="inline-flex rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-brand-red">
								Accident
							</span>
							<span className={cn("inline-flex rounded-[10px] px-3 py-1 text-xs font-medium", statusMeta.className)}>
								{report.statusLabel}
							</span>
						</div>
					</div>
				</div>
			</div>

			<div className="flex flex-col items-start gap-4 xl:flex-row">
				<div className="w-full flex-1 rounded-[12px] bg-white p-5 shadow-md">
					<Section title="Employee & Vehicle Information">
						<Field label="Full Name" value={report.employeeName} />
						<Field label="Address" value={report.employeeAddress} />
						<Field label="Phone" value={report.employeePhone} />
						<Field label="Driver's License" value={report.employeeLicense} />
						<Field label="Truck Number" value={report.truckNumber} />
						<Field label="VIN" value={report.vin} />
						<Field label="License Plate" value={report.licensePlate} />
						<Field label="Vehicle Damage" value={report.vehicleDamage} />
					</Section>

					<Section title="Accident Details">
						<Field
							label="Date of Accident"
							value={
								report.accidentDate
									? toLocalFormattedDate(asUtcInstant(report.accidentDate), DATE_FORMAT.MM_SLASH_DD_YYYY)
									: FALLBACK
							}
						/>
						<Field
							label="Time of Accident"
							value={
								report.accidentDate
									? toLocalFormattedDate(asUtcInstant(report.accidentDate), DATE_FORMAT.HH_MM_AA_PM)
									: FALLBACK
							}
						/>
						<Field label="Location of Accident" value={report.location} />
						<Field label="Nearest Cross Street" value={report.crossStreet} />
						<Field label="Weather" value={report.weather} />
						<Field label="Vehicle Towed" value={displayYesNo(report.vehicleTowed)} />
					</Section>

					<Section title="Police Information">
						<Field label="Police Contacted" value={report.policeContacted} />
						<Field label="Police Department" value={report.policeDepartment} />
						<Field label="Police Report Number" value={report.policeReportNumber} />
					</Section>

					<Section title="Witness Information">
						<Field label="Witness Name" value={report.witnessName} />
						<Field label="Witness Address" value={report.witnessAddress} />
						<Field label="Witness Phone" value={report.witnessPhone} />
					</Section>

					<Section title="Medical Information">
						<Field label="Drug Screen" value={report.drugScreen} />
						<Field label="Medical Treatment" value={report.medicalTreatment} />
						<Field label="Treatment Location" value={report.medicalTreatmentLocation} />
						<Field label="Injury Report" value={report.injuryReport} />
					</Section>

					<div className="space-y-4 border-t border-brand-dark10 py-5">
						<h3 className="text-xs font-semibold uppercase tracking-wide text-brand-dark50">
							Vehicles Involved ({report.otherVehicles.length})
						</h3>
						{report.otherVehicles.length === 0 ? (
							<p className="text-sm text-brand-dark50">No other vehicles recorded for this accident.</p>
						) : (
							<div className="space-y-4">
								{report.otherVehicles.map((vehicle, index) => (
									<OtherVehicleCard key={vehicle.id} vehicle={vehicle} index={index} />
								))}
							</div>
						)}
					</div>
				</div>

				<aside className="w-full shrink-0 xl:w-[300px]">
					<div className="space-y-2 rounded-[12px] bg-white p-5 shadow-md">
						<h3 className="text-base font-semibold text-brand-dark">Status</h3>
						<span className={cn("inline-flex w-fit rounded-full px-3 py-1 text-xs font-medium", statusMeta.className)}>
							{report.statusLabel}
						</span>
						<p className="text-sm text-brand-dark50">
							This is a manual entry imported from the legacy system and is read-only.
						</p>
					</div>
				</aside>
			</div>
		</div>
	);
};

const LegacyAccidentReview = ({ reportId }: { reportId: string }) => {
	const { data: report, isLoading, isError } = useLegacyAccidentDetail(reportId);

	if (isLoading) {
		return (
			<div className="flex h-[60vh] w-full items-center justify-center">
				<Spinner />
			</div>
		);
	}

	if (isError || !report) {
		return <p className="py-10 text-center text-sm text-brand-red">Unable to load the accident report.</p>;
	}

	return <LegacyAccidentBody report={report} />;
};

export default LegacyAccidentReview;
