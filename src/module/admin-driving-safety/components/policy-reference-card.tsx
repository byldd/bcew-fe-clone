"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { IDrivingSafetyViolationType } from "@/module/driving-safety/policies/types";

const DASH = "--";

const InfoRow = ({ label, value, valueClassName }: { label: string; value: string; valueClassName?: string }) => (
	<div className="space-y-1">
		<p className="text-sm text-brand-grey">{label}</p>
		<p className={`text-sm font-semibold ${valueClassName ?? "text-brand-dark"}`}>{value}</p>
	</div>
);

const PolicyReferenceCard = ({ selectedType }: { selectedType: IDrivingSafetyViolationType | undefined }) => {
	const router = useRouter();

	return (
		<div className="space-y-4 rounded-[8px] border-none bg-white p-4 shadow-sm">
			<h4 className="text-sm font-medium text-brand-grey">Policy Reference</h4>

			<div className="space-y-3">
				<InfoRow label="Selected type" value={selectedType?.name ?? DASH} valueClassName="text-blue-600" />
				<InfoRow label="Point weight" value={selectedType ? String(selectedType.points ?? "TBD") : DASH} />
				<InfoRow
					label="Required docs"
					value={selectedType?.documentationRequired ?? DASH}
					valueClassName="text-blue-600"
				/>
			</div>

			<Button
				type="button"
				variant="outline"
				className="w-full"
				onClick={() => router.push(routes.admin.drivingSafetyPolicies)}
			>
				Open Policies
			</Button>
		</div>
	);
};

export default PolicyReferenceCard;
