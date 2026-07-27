"use client";
import { FormEvent, useEffect, useState } from "react";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import BackButton from "@/components/common/back-button";
import { Button } from "@/components/ui/button";
import { InputField } from "@/components/ui/inputField";
import { routes } from "@/config/routes";
import EmergencyCallList from "../components/emergency-call-list";
import { useVehicleDocuments } from "../hooks/useVehicleDocuments";
import {
	ACCIDENT_DISCLAIMER_POINTS,
	ACCIDENT_EMERGENCY_CONTACTS,
	ACCIDENT_POLICE_INSTRUCTION,
	EMERGENCY_CALL_DIRECTIONS,
} from "../constants/report-vehicle-accident";

const ReportVehicleAccidentIntroTemplate = () => {
	const router = useRouter();
	const [truckNumber, setTruckNumber] = useState("");
	const [submittedTruck, setSubmittedTruck] = useState<string | null>(null);

	const { data, isFetching, isError, error } = useVehicleDocuments(submittedTruck);

	useEffect(() => {
		if (submittedTruck && data) {
			router.push(routes.employee.vehicleDocuments(submittedTruck));
		}
	}, [submittedTruck, data, router]);

	const searchError =
		submittedTruck && isError
			? ((error as AxiosError<{ message: string }>)?.response?.data?.message ??
				"No registration or insurance found for this truck.")
			: undefined;

	const handleSearch = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const trimmed = truckNumber.trim();
		if (!trimmed) return;
		setSubmittedTruck(trimmed);
	};

	return (
		<div className="min-h-screen w-full space-y-3 bg-brand-bgLightgrey p-4 pb-24">
			<div className="ml-[-10px] flex items-center gap-1">
				<BackButton />
				<h3 className="text-xl font-medium">Report an Accident</h3>
			</div>

			<section className="space-y-2 rounded-[10px] border bg-white p-4">
				<p className="text-sm font-medium text-brand-dark">
					Enter the vehicle number to find its registration and insurance documents
				</p>
				<form onSubmit={handleSearch} className="flex items-start gap-2">
					<InputField
						name="truckNumber"
						placeholder="Type Here"
						value={truckNumber}
						onChange={(event) => {
							setTruckNumber(event.target.value);
							setSubmittedTruck(null);
						}}
						error={searchError}
						className="border"
						style={{ flex: 1 }}
					/>
					<Button
						type="submit"
						variant="filled"
						loading={isFetching}
						disabled={!truckNumber.trim()}
						className="h-9 rounded-[10px]"
					>
						Search
					</Button>
				</form>
			</section>

			<section className="space-y-2 rounded-[10px] bg-[#F01D1D1A] p-4">
				<p className="text-sm font-medium text-brand-red800">Disclaimer</p>
				<ul className="list-disc space-y-1 pl-4">
					{ACCIDENT_DISCLAIMER_POINTS.map((point) => (
						<li key={point} className="text-xs text-brand-red800">
							{point}
						</li>
					))}
				</ul>
			</section>

			<section className="space-y-2 rounded-[10px] border bg-white p-4">
				<p className="text-sm font-medium text-brand-dark">Step 1 - Call the Police</p>
				<p className="text-sm font-medium text-brand-red800">{ACCIDENT_POLICE_INSTRUCTION}</p>
			</section>

			<section className="space-y-3 rounded-[10px] border bg-white p-4">
				<p className="text-sm font-medium text-brand-dark">Step 2 — Contact BCEW</p>
				<EmergencyCallList contacts={ACCIDENT_EMERGENCY_CONTACTS} directions={EMERGENCY_CALL_DIRECTIONS} />
			</section>

			<section className="space-y-2 rounded-[10px] border bg-white p-4">
				<p className="text-sm font-medium text-brand-dark">Step 3 — Fill out Vehicle Accident Report</p>
			</section>

			<div className="fixed bottom-0 left-0 right-0 z-50 flex w-full gap-2 bg-white px-4 py-3 shadow-md">
				<Button type="button" variant="outline" className="w-full" onClick={() => router.back()}>
					Cancel
				</Button>
				<Button
					type="button"
					variant="filled"
					className="w-full"
					onClick={() => router.push(routes.employee.newVehicleAccidentReport)}
				>
					Report Accident
				</Button>
			</div>
		</div>
	);
};

export default ReportVehicleAccidentIntroTemplate;
