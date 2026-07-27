"use client";

import { useMemo } from "react";
import { Spinner } from "@/components/ui/spinner";
import { useEmployeeAdditionalMaterials } from "../material-selection/hooks/useEmployeePullList";
import { ADDITIONAL_MATERIAL_SOURCE } from "../utils/enums";
import { mapAdditionalMaterial } from "../utils/material-status";
import AdditionalMaterialCard from "./additional-material-card";

export default function JobAdditionalMaterialList({ assignmentId }: { assignmentId?: string }) {
	const { data, isLoading } = useEmployeeAdditionalMaterials({ assignmentId });

	const items = useMemo(() => (data ?? []).map(mapAdditionalMaterial), [data]);

	if (isLoading) {
		return (
			<div className="flex justify-center py-6">
				<Spinner />
			</div>
		);
	}

	if (!items.length) {
		return <p className="py-6 text-center text-sm text-brand-dark50">No additional material requests yet.</p>;
	}

	return (
		<div className="divide-y divide-brand-dark10">
			{items.map((item) => (
				<div key={item.id} className="py-3 first:pt-0 last:pb-0">
					<AdditionalMaterialCard item={item} source={ADDITIONAL_MATERIAL_SOURCE.EMPLOYEE} />
				</div>
			))}
		</div>
	);
}
