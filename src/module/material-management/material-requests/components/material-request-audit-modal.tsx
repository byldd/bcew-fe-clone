"use client";

import { useMemo } from "react";
import { Spinner } from "@/components/ui/spinner";
import { useMaterialRequestAuditTrail } from "../hooks/useMaterialRequests";
import { MaterialRequestAuditLineRow } from "./material-request-audit-line-row";
import { MaterialRequestAuditTimeline } from "./material-request-audit-timeline";
import { MATERIAL_REQUEST_AUDIT_EVENT_TYPE } from "../utils/enums";
import type { MaterialRequestAuditEvent } from "../utils/types";

type OverallAuditEvent = MaterialRequestAuditEvent & { partCode: string };

const buildEventTitle = (event: OverallAuditEvent) => {
	const lineItem = `Line item ${event.partCode}`;

	if (event.type === MATERIAL_REQUEST_AUDIT_EVENT_TYPE.NOTE_ADDED) {
		const isAdmin = event.actorRole?.trim().toLowerCase() === "admin";

		if (isAdmin) {
			return `Admin note added for line item ${event.partCode}`;
		}

		return event.actorRole ? `${lineItem} ${event.actorRole} added note` : `${lineItem} added note`;
	}

	return `${lineItem} ${event.title}`;
};

export default function MaterialRequestAuditModal({ requestId }: { requestId: number | string }) {
	const { data, isLoading, isError } = useMaterialRequestAuditTrail({ requestId });

	const overallEvents = useMemo<OverallAuditEvent[]>(() => {
		if (!data) return [];

		return data.lineItems
			.flatMap((item) =>
				item.events.map((event) => ({
					...event,
					partCode: item.code || item.label,
				}))
			)
			.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
	}, [data]);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-10">
				<Spinner />
			</div>
		);
	}

	if (isError || !data) {
		return <p className="py-8 text-center text-sm text-brand-dark50">Unable to load history.</p>;
	}

	if (data.lineItems.length === 0) {
		return <p className="py-8 text-center text-sm text-brand-dark50">No history available.</p>;
	}

	return (
		<div className="space-y-5 pb-1">
			<section className="rounded-2xl border border-brand-dark/10">
				<div className="flex items-center justify-between border-b border-brand-dark/10 px-4 py-3 text-xs font-medium uppercase tracking-wide text-brand-dark50">
					<span>Material</span>
					<span>Quantity</span>
				</div>
				<div className="px-4">
					{data.lineItems.map((item) => (
						<MaterialRequestAuditLineRow key={item.id} lineItem={item} />
					))}
				</div>
			</section>

			<section>
				<h3 className="mb-2 text-sm font-semibold text-brand-dark">Overall History</h3>
				<div className="rounded-2xl border border-brand-dark/10 p-4">
					<MaterialRequestAuditTimeline events={overallEvents} renderTitle={buildEventTitle} />
				</div>
			</section>
		</div>
	);
}
