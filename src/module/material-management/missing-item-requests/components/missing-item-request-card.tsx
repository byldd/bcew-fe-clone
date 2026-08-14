import Image from "next/image";
import { Camera } from "lucide-react";
import { cn } from "@/lib/utils/utils";
import { toFormattedDate } from "@/lib/utils/date";
import { DATE_FORMAT } from "@/types/date";
import { MISSING_ITEM_REQUEST_STATUS_UI } from "@/module/material-management/missing-item-requests-admin/utils/missing-item-request-status";
import type { MissingItemRequestsListResponse } from "@/module/job/material-selection/utils/types";
import { useModal } from "@/hooks/useModal";
import ImageModal from "@/components/shared/image-upload/image-modal";

export default function MissingItemRequestCard({
	item,
	highlighted = false,
}: {
	item: MissingItemRequestsListResponse;
	highlighted?: boolean;
}) {
	const status = MISSING_ITEM_REQUEST_STATUS_UI[item.status];
	const dateValue = item.date ?? item.createdAt;
	const foremanNote = item.foremanNote?.trim();
	const { Modal, closeModal, openModal } = useModal();

	const handleImageClick = (imageUrl: string) => {
		openModal({
			modalTitle: "Preview Image",
			modalView: <ImageModal imageUrl={imageUrl} onClose={closeModal} />,
			variant: "big",
		});
	};

	return (
		<div
			id={`mir-${item.id}`}
			className={cn(
				"space-y-3 rounded-[10px] border border-brand-dark10 bg-white p-4 shadow-sm",
				highlighted && "bg-gray-100"
			)}
		>
			<Modal />
			<div className="flex items-start justify-between gap-2">
				<span className="text-xs text-brand-dark50">
					{dateValue ? `Submitted on ${toFormattedDate(dateValue, DATE_FORMAT.MM_SLASH_DD_YYYY)}` : "—"}
				</span>
				<span className={cn("shrink-0 text-[13px] font-semibold", status?.className)}>{status?.label}</span>
			</div>

			<div className="flex items-start justify-between gap-2">
				<p className="text-sm font-semibold text-brand-dark">
					{item.jobName}
					{item.jobName && item.phase && " · "}
					{item.phase && <span className="capitalize">{item.phase.replaceAll("_", " ")}</span>}
				</p>
				<span className="shrink-0 text-xs text-brand-dark50">Unknown Material Request</span>
			</div>

			<div className="space-y-3 border-t border-brand-dark10 pt-3">
				<div className="flex items-start justify-between gap-2">
					<span className="text-xs text-brand-dark50">Technician Description</span>
					<span className="shrink-0 text-xs text-brand-dark50">Quantity : {item.quantity ?? "—"}</span>
				</div>
				<p className="text-sm text-brand-dark">{item.description || "No description"}</p>

				<div className="space-y-2">
					<span className="text-xs text-brand-dark50">Images</span>
					<div className="flex flex-wrap items-center gap-2">
						{item.images.length > 0 ? (
							item.images.map((image) => (
								<div
									key={image.id}
									className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-brand-dark10"
								>
									<Image
										src={image.url}
										alt="Missing item request"
										fill
										className="object-cover"
										onClick={() => handleImageClick(image.url)}
									/>
								</div>
							))
						) : (
							<Camera className="h-10 w-10 text-gray-400" />
						)}
					</div>
				</div>
			</div>

			<div className="border-t border-brand-dark10 pt-2">
				<p className="text-xs">
					<span className="text-brand-dark50">Foreman Note: </span>
					{foremanNote ? (
						<span className="font-semibold text-brand-dark">{foremanNote}</span>
					) : (
						<span className="text-brand-dark30">No foreman notes</span>
					)}
				</p>
			</div>
		</div>
	);
}
