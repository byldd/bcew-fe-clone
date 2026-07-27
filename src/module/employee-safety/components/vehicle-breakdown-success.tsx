"use client";

import { useRouter } from "next/navigation";
import { FaCircleCheck } from "react-icons/fa6";

import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";

import BreakdownAuthorizedPersonCard from "./breakdown-authorized-person-card";

const VehicleBreakdownSuccess = () => {
	const router = useRouter();

	return (
		<div className="flex min-h-screen w-full flex-col bg-brand-bgLightgrey p-4">
			<div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
				<div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#34C7591A]">
					<div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#22C55E]">
						<FaCircleCheck className="h-8 w-8 text-white" strokeWidth={3} />
					</div>
				</div>
				<p className="mt-2 max-w-xs text-lg font-semibold text-brand-dark">Vehicle Breakdown Reported.</p>
				<p className="text-sm font-medium text-brand-grey">Now follow the next step.</p>

				<div className="mt-6 w-full text-left">
					<BreakdownAuthorizedPersonCard />
				</div>
			</div>

			<div className="space-y-2">
				<Button
					type="button"
					variant="outline"
					className="w-full"
					onClick={() => router.push(routes.employee.dashboard)}
				>
					Go back to home
				</Button>
			</div>
		</div>
	);
};

export default VehicleBreakdownSuccess;
