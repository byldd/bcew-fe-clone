"use client";

import { useMemo } from "react";
import { Spinner } from "@/components/ui/spinner";
import { MaterialRequestAuditTimeline } from "@/module/material-management/material-requests/components/material-request-audit-timeline";
import { useMaterialRequestAuditTrail } from "@/module/material-management/material-requests/hooks/useMaterialRequests";
import { ADDITIONAL_MATERIAL_SOURCE } from "../utils/enums";

export default function AdditionalMaterialAuditTrail({
	requestId,
	lineItemId,
	source,
}: {
	requestId: number | string;
	lineItemId: string;
	source: ADDITIONAL_MATERIAL_SOURCE;
}) {
	const { data, isLoading, isError } = useMaterialRequestAuditTrail({ requestId, source });

	const events = useMemo(() => {
		const lineItem = data?.lineItems.find((item) => item.id === lineItemId);
		return lineItem?.events ?? [];
	}, [data, lineItemId]);

	if (isLoading) {
		return (
			<div className="flex justify-center py-4">
				<Spinner />
			</div>
		);
	}

	if (isError || events.length === 0) {
		return <p className="py-3 text-sm text-brand-dark50">No history available.</p>;
	}

	return <MaterialRequestAuditTimeline events={events} />;
}
