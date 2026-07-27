"use client";

import { useMemo } from "react";
import { Spinner } from "@/components/ui/spinner";
import AdditionalMaterialCard from "@/module/job/components/additional-material-card";
import { ADDITIONAL_MATERIAL_SOURCE } from "@/module/job/utils/enums";
import { mapAdditionalMaterial } from "@/module/job/utils/material-status";
import { useAdminAdditionalMaterials } from "../material-selection/hooks/useAdminMaterialSelection";

export default function JobLevelAdditionalMaterialList({
	recnum,
	tsknum,
}: {
	recnum?: number | null;
	tsknum?: number | null;
}) {
	const { data, isLoading } = useAdminAdditionalMaterials({ recnum, tsknum });

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
					<AdditionalMaterialCard item={item} source={ADDITIONAL_MATERIAL_SOURCE.ADMIN} />
				</div>
			))}
		</div>
	);
}
