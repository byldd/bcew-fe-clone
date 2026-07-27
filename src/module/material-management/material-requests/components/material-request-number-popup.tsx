"use client";

import { useMemo } from "react";
import { Spinner } from "@/components/ui/spinner";
import { formatDisplayValue } from "@/lib/utils/value-formatter";
import { useMaterialRequestsByRequestId } from "../hooks/useMaterialRequests";
import { mapMaterialRequests } from "../utils/map-material-requests";
import type { MaterialRequestRow } from "../utils/types";
import { useModal } from "@/hooks/useModal";

const MaterialRequestListModal = ({ requestId }: { requestId: number | string }) => {
	const { data, isLoading, isError } = useMaterialRequestsByRequestId({ requestId });
	const rows = useMemo(() => mapMaterialRequests(data ?? []), [data]);

	const buildRequestLabel = (row: MaterialRequestRow) => {
		const requestIdLabel = formatDisplayValue(row.requestId);
		const partCode = row.code ? row.code : "--";
		const partName = formatDisplayValue(row.name ?? "");

		return `Req # - ${requestIdLabel} (${partCode}) ${partName}`;
	};

	return (
		<div className="rounded-[12px] bg-white">
			<div className="max-h-[360px] overflow-y-auto">
				{isLoading ? (
					<div className="flex items-center justify-center px-4 py-8 text-brand-dark50">
						<Spinner />
					</div>
				) : isError ? (
					<p className="px-4 py-6 text-sm text-brand-dark50">Unable to load requests.</p>
				) : rows.length === 0 ? (
					<p className="px-4 py-6 text-sm text-brand-dark50">No requests found.</p>
				) : (
					<ul className="divide-y text-sm text-brand-dark">
						{rows.map((row) => (
							<li key={row.id} className="px-4 py-3">
								{buildRequestLabel(row)}
							</li>
						))}
					</ul>
				)}
			</div>
		</div>
	);
};

export default function MaterialRequestNumberPopUp({ requestId }: { requestId?: number | string | null }) {
	const { openModal, Modal } = useModal();
	const hasRequestId = requestId !== null && requestId !== undefined && `${requestId}`.length > 0;

	if (!hasRequestId) {
		return <span>{formatDisplayValue(requestId as number | string | null | undefined)}</span>;
	}

	const openRequestModal = () => {
		openModal({
			modalTitle: "Order Requested",
			showDefaultClose: true,
			modalView: <MaterialRequestListModal requestId={requestId as number | string} />,
		});
	};

	return (
		<>
			<button
				type="button"
				onClick={openRequestModal}
				className="text-brand-dark underline decoration-brand-dark/60 underline-offset-2"
			>
				{formatDisplayValue(requestId as number | string | null | undefined)}
			</button>
			<Modal />
		</>
	);
}
