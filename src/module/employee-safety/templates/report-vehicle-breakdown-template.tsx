"use client";

import { useRouter } from "next/navigation";

import BackButton from "@/components/common/back-button";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";

import BreakdownAuthorizedPersonCard from "../components/breakdown-authorized-person-card";

const ReportVehicleBreakdownTemplate = () => {
	const router = useRouter();

	return (
		<div className="flex h-screen w-full flex-col bg-brand-bgLightgrey">
			<div className="shrink-0 p-4">
				<div className="ml-[-10px] flex items-center gap-1">
					<BackButton />
					<h3 className="text-xl font-medium">Report Vehicle Breakdown</h3>
				</div>
			</div>

			<div className="flex-1 space-y-3 overflow-y-auto px-4 pb-4">
				<div className="rounded-xl bg-white p-4 text-sm font-medium text-brand-dark shadow-sm">
					Step 1 — Fill out a Vehicle Breakdown Request
				</div>
				<BreakdownAuthorizedPersonCard />
			</div>

			<div className="flex shrink-0 gap-2 bg-white p-4 shadow-md">
				<Button type="button" variant="outline" className="w-full" onClick={() => router.back()}>
					Cancel
				</Button>
				<Button
					type="button"
					variant="filled"
					className="w-full"
					onClick={() => router.push(routes.employee.newVehicleBreakdownReport)}
				>
					Report Breakdown
				</Button>
			</div>
		</div>
	);
};

export default ReportVehicleBreakdownTemplate;
