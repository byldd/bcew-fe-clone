"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { toLocalFormattedDate } from "@/lib/utils/date";
import { DATE_FORMAT } from "@/types/date";
import { cn } from "@/lib/utils/utils";
import { useModal } from "@/hooks/useModal";
import { AdditionalMaterialItem } from "../material-selection/utils/types";
import { ADDITIONAL_MATERIAL_SOURCE } from "../utils/enums";
import { ADDITIONAL_MATERIAL_STATUS_BADGE, resolveAdditionalMaterialStatus } from "../utils/material-status";
import AdditionalMaterialAuditTrail from "./additional-material-audit-trail";
import AdditionalMaterialNotes, { MaterialNoteEntry } from "./additional-material-notes";

export default function AdditionalMaterialCard({
	item,
	source,
}: {
	item: AdditionalMaterialItem;
	source: ADDITIONAL_MATERIAL_SOURCE;
}) {
	const [expanded, setExpanded] = useState(false);
	const { Modal, openModal } = useModal();
	const status = resolveAdditionalMaterialStatus(item);
	const materialName = [item.code, item.name].filter(Boolean).join(" - ") || "--";
	const adminNote = item.isRejected ? item.rejectNote : item.approveNote;

	const notes: MaterialNoteEntry[] = [];
	if (item.note && item.note.trim().length > 0) {
		notes.push({ name: item.requestedBy || "Employee", note: item.note, date: item.createdAt });
	}
	if (adminNote && adminNote.trim().length > 0) {
		notes.push({ name: "Admin", note: adminNote, date: item.updatedAt });
	}

	const handleViewNotes = () =>
		openModal({
			modalTitle: "Notes Added",
			modalView: <AdditionalMaterialNotes notes={notes} />,
			variant: "medium",
		});

	return (
		<div className="space-y-3">
			<div className="flex items-start justify-between gap-2">
				<p className="text-sm font-semibold text-brand-dark">{materialName}</p>
				<span className="flex shrink-0 items-center gap-2">
					<span
						className={cn("rounded-full px-3 py-1 text-[11px] font-semibold", ADDITIONAL_MATERIAL_STATUS_BADGE[status])}
					>
						{status}
					</span>
					<button
						type="button"
						onClick={() => setExpanded((value) => !value)}
						aria-expanded={expanded}
						aria-label="Toggle audit trail"
						className="rounded p-0.5 text-brand-dark50"
					>
						<ChevronDown className={cn("h-4 w-4 transition-transform", expanded && "rotate-180")} />
					</button>
				</span>
			</div>

			<p className="text-xs text-brand-dark50">
				{toLocalFormattedDate(item.createdAt, DATE_FORMAT.DATE_AND_TIME)}
				{item.requestedBy ? (
					<>
						{" | "}
						<span>{item.requestedBy}</span>
					</>
				) : null}
			</p>

			<p className="text-sm text-brand-dark">Quantity: {item.quantity ?? "--"}</p>

			{notes.length > 0 && (
				<button
					type="button"
					onClick={handleViewNotes}
					className="text-xs font-medium text-brand-dark underline underline-offset-2"
				>
					View Note
				</button>
			)}

			{item.images.length > 0 && (
				<div className="space-y-2">
					<p className="text-xs font-medium text-brand-dark50">Photos</p>
					<div className="flex flex-wrap gap-2">
						{item.images.map((image) => (
							<a
								key={image.id}
								href={image.url}
								target="_blank"
								rel="noopener noreferrer"
								className="relative h-24 w-24 overflow-hidden rounded-[10px] border border-brand-dark10"
							>
								<Image
									src={image.url}
									alt="Material photo"
									width={96}
									height={96}
									className="h-full w-full object-cover"
								/>
							</a>
						))}
					</div>
				</div>
			)}

			{expanded && (
				<div className="border-t border-brand-dark10 pt-3">
					<p className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand-dark50">
						Audit Trail &amp; History
					</p>
					<AdditionalMaterialAuditTrail requestId={item.requestId} lineItemId={item.id} source={source} />
				</div>
			)}

			<Modal />
		</div>
	);
}
