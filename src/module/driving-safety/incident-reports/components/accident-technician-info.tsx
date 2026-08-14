"use client";

import { ReactNode, useState } from "react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { toLocalFormattedDate } from "@/lib/utils/date";
import { DATE_FORMAT } from "@/types/date";
import { PreviewFile, useFilePreview } from "@/hooks/useFilePreview";
import { JOB_SITE_TYPE, PERSON_STRUCK_TYPE, VEHICLE_ACCIDENT_PHOTO_CATEGORY } from "@/module/employee-safety/enums";
import { IAccidentReviewDetail } from "../types";
import { WEATHER_CONDITION_LABEL } from "../utils/constants";
import { DASH, orDash, yesNo } from "../utils/accident-review-display";
import AccidentTechnicianEditForm from "./accident-technician-edit-form";
import { InfoNote } from "./info-note";
import { ReviewCard } from "./review-card";

const JOB_SITE_TYPE_LABEL: Record<JOB_SITE_TYPE, string> = {
	[JOB_SITE_TYPE.BCEW_SITE]: "BCEW Site",
	[JOB_SITE_TYPE.CONTRACTOR_SITE]: "Contractor Site",
};

const PhotoGroup = ({
	label,
	photos,
	onPreview,
}: {
	label: string;
	photos: (PreviewFile & { id: string })[];
	onPreview: (photo: PreviewFile) => void;
}) => (
	<div className="space-y-2">
		<p className="text-sm text-brand-dark50">{label}</p>
		<div className="flex flex-wrap gap-3">
			{photos.map((photo) => (
				<button
					key={photo.id}
					type="button"
					onClick={() => onPreview(photo)}
					className="relative h-14 w-[72px] cursor-pointer overflow-hidden rounded-[8px] border border-brand-dark10"
				>
					<Image src={photo.url} alt={label} fill sizes="72px" className="object-cover" unoptimized />
				</button>
			))}
		</div>
	</div>
);

const Section = ({ title, children }: { title?: string; children: ReactNode }) => (
	<div className="space-y-4 border-t border-brand-dark10 py-5 first:border-t-0 first:pt-0">
		{title && <h4 className="text-sm font-semibold tracking-wide text-brand-dark50">{title}</h4>}
		{children}
	</div>
);

const Field = ({ label, value, required = false }: { label: string; value: ReactNode; required?: boolean }) => (
	<div className="space-y-1">
		<p className="text-sm text-brand-dark50">
			{label}
			{required && <span className="ml-0.5 align-super text-xs leading-none text-brand-dark50">*</span>}
		</p>
		<p className="text-sm font-medium text-brand-dark">{value}</p>
	</div>
);

const AccidentTechnicianInfo = ({
	report,
	canEdit = true,
	className,
}: {
	report: IAccidentReviewDetail;
	canEdit?: boolean;
	className?: string;
}) => {
	const { Modal, openPreview } = useFilePreview();
	const [isEditing, setIsEditing] = useState(false);

	if (isEditing) {
		return <AccidentTechnicianEditForm report={report} onClose={() => setIsEditing(false)} />;
	}

	const photosFor = (category: VEHICLE_ACCIDENT_PHOTO_CATEGORY) =>
		report.photos.filter((photo) => photo.category === category);

	const requiredUploadGroups = [
		{ label: "Photos of the BCEW Vehicle", photos: photosFor(VEHICLE_ACCIDENT_PHOTO_CATEGORY.BCEW_VEHICLE) },
		{
			label: "Photos of Damage to Any Other Property Struck",
			photos: photosFor(VEHICLE_ACCIDENT_PHOTO_CATEGORY.OTHER_VEHICLE_PROPERTY),
		},
	].filter((group) => group.photos.length > 0);

	const propertyDamage = report.propertyDamage;
	const anotherCompanyStruck = propertyDamage?.anotherCompanyProperty === true;

	return (
		<ReviewCard
			title="Information from Technician"
			className={className}
			action={
				canEdit ? (
					<Button
						type="button"
						variant="secondary"
						className="h-9 rounded-[8px] text-sm"
						onClick={() => setIsEditing(true)}
					>
						Edit Report
					</Button>
				) : undefined
			}
		>
			<Section title="A Few Quick Questions">
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<Field label="Did the accident occur on a job site?" value={yesNo(report.onJobSite)} required />
					{report.onJobSite && (
						<Field
							label="What type of job site was it?"
							value={report.jobSiteType ? JOB_SITE_TYPE_LABEL[report.jobSiteType] : DASH}
						/>
					)}
					<Field label="Was another vehicle involved?" value={yesNo(report.anotherVehicleInvolved)} required />
					<Field label="Was a person struck?" value={yesNo(report.personStruck)} required />
					{report.anotherVehicleInvolved && (
						<Field label="How many vehicles were involved?" value={report.otherVehicleCount ?? DASH} required />
					)}
				</div>

				{report.personStruck && (
					<InfoNote>
						Coordinate with other company to see if they want to handle accident outside of insurance.
					</InfoNote>
				)}
			</Section>

			<Section title="Employee & Vehicle Information">
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
					<Field label="Full Name" value={orDash(report.user?.name)} />
					<Field label="Phone" value={orDash(report.user?.cellPhone)} />
					<Field label="Driver's License Number" value={orDash(report.driverLicenseNumber)} />
					<Field label="Truck Number" value={orDash(report.truckNumber)} />
					<Field label="VIN" value={orDash(report.vin)} />
					<Field label="License Plate" value={orDash(report.licensePlate)} />
				</div>
			</Section>

			<Section title="Accident Details">
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
					<Field
						label="Date of Accident"
						value={report.accidentDate ? toLocalFormattedDate(report.accidentDate, DATE_FORMAT.MM_SLASH_DD_YYYY) : DASH}
					/>
					<Field
						label="Time of Accident"
						value={report.accidentDate ? toLocalFormattedDate(report.accidentDate, DATE_FORMAT.HH_MM_AA_PM) : DASH}
					/>
				</div>
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
					<Field label="Location of Accident" value={orDash(report.location)} />
					<Field label="Nearest Cross Street" value={orDash(report.nearestCrossStreet)} />
					<Field label="Weather Conditions" value={report.weather ? WEATHER_CONDITION_LABEL[report.weather] : DASH} />
				</div>
			</Section>

			<Section>
				<Field label="Were police contacted?" value={yesNo(report.policeContacted)} />
				{report.policeContacted && (
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<Field label="Police Department" value={orDash(report.policeDepartment)} />
						<Field label="Do you have a Police Report Number?" value={orDash(report.policeReportNumber)} />
					</div>
				)}
			</Section>

			<Section title="What happened?">
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<Field label="Briefly Describe how the Accident Happened" value={orDash(report.describeAccident)} />
					<Field label="Damage to BCEW Vehicle" value={orDash(report.damageToBcewVehicle)} />
				</div>
			</Section>

			{report.personStruck && report.personInvolved && (
				<Section title="Who was the Person Involved">
					{report.personInvolved.whoWasStruck === PERSON_STRUCK_TYPE.OTHER ? (
						<>
							<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
								<Field label="Who was struck?" value="Other person" required />
								<Field label="Full Name (if known)" value={orDash(report.personInvolved.fullName)} />
								<Field label="Phone Number (if available)" value={orDash(report.personInvolved.phoneNumber)} />
							</div>
							<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
								<Field label="Was the Person Injured?" value={yesNo(report.personInvolved.employeeInjured)} />
								{report.personInvolved.employeeInjured && (
									<Field label="Describe the Injury" value={orDash(report.personInvolved.injuryDescription)} />
								)}
							</div>
						</>
					) : (
						<>
							<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
								<Field label="Who was struck?" value="Employee" required />
								<Field label="Employee's Full Name" value={orDash(report.personInvolved.fullName)} />
								<Field label="Was the Employee Injured?" value={yesNo(report.personInvolved.employeeInjured)} />
							</div>
							{report.personInvolved.employeeInjured && (
								<Field label="Describe the injury" value={orDash(report.personInvolved.injuryDescription)} />
							)}
						</>
					)}
				</Section>
			)}

			{report.anotherVehicleInvolved &&
				report.otherVehicles.map((vehicle, index) => (
					<Section key={index} title={`Other Details: Vehicle ${index + 1}`}>
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
							<Field label="Make" value={orDash(vehicle.make)} />
							<Field label="Model" value={orDash(vehicle.model)} />
							<Field label="What was Struck" value={orDash(vehicle.whatWasStruck)} />
							<Field label="VIN" value={orDash(vehicle.vin)} />
							<Field label="Driver's License #" value={orDash(vehicle.driverLicenseNumber)} />
						</div>
						{vehicle.images.length > 0 && (
							<PhotoGroup label="Required Uploads" photos={vehicle.images} onPreview={openPreview} />
						)}
					</Section>
				))}

			{requiredUploadGroups.length > 0 && (
				<Section title="Required Uploads">
					<div className="space-y-4">
						{requiredUploadGroups.map((group) => (
							<PhotoGroup key={group.label} label={group.label} photos={group.photos} onPreview={openPreview} />
						))}
					</div>
				</Section>
			)}

			{report.onJobSite && propertyDamage && (
				<Section title="Follow Up Questions">
					<Field
						label="Was another company's non-vehicle property struck?"
						value={yesNo(propertyDamage.anotherCompanyProperty)}
					/>
					{anotherCompanyStruck && (
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
							<Field label="Company Name" value={orDash(propertyDamage.companyName)} />
							<Field label="Phone Number" value={orDash(propertyDamage.contactPhoneNumber)} />
							<Field label="Contact Person's Name" value={orDash(propertyDamage.contactPersonName)} />
							<Field label="Any Other Information" value={orDash(propertyDamage.otherInformation)} />
						</div>
					)}
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<Field label="Was the builder's property struck?" value={yesNo(propertyDamage.builderProperty)} />
						<Field
							label="Was the homeowner's non-vehicle property struck?"
							value={yesNo(propertyDamage.homeownerProperty)}
						/>
					</div>
				</Section>
			)}

			<Modal />
		</ReviewCard>
	);
};

export default AccidentTechnicianInfo;
