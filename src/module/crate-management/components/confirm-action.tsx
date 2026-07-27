"use client";

import { Button } from "@/components/ui/button";
import { DELIVERY_STATUS_STEP } from "../enums";
import { ICrateConfirmationDetails } from "../types";
import { getCrateConfirmationDetailRows, ITEMS_PREVIEW_COUNT } from "../utils/constants";
import { inferCompletedSteps } from "../utils/delivery-status";
import DeliveryStatusFlow from "./delivery-status-flow";
import OrderProgress from "./order-progress";
import PhotoGrid from "./photo-grid";
import ScreenHeader from "./screen-header";

interface ConfirmActionProps {
	details: ICrateConfirmationDetails;
	photos: File[];
	note: string;
	isSubmitting: boolean;
	onBack: () => void;
	onConfirm: () => void;
}

export default function ConfirmAction({ details, photos, note, isSubmitting, onBack, onConfirm }: ConfirmActionProps) {
	const visibleItems = details.items.slice(0, ITEMS_PREVIEW_COUNT);
	const remainingItemsCount = details.items.length - visibleItems.length;
	const completedSteps = inferCompletedSteps(details.completedDeliverySteps);
	const detailRows = getCrateConfirmationDetailRows(details);

	return (
		<div className="flex min-h-screen flex-col bg-white pb-8">
			<ScreenHeader title="Confirm Action" onBack={onBack} />

			<div className="flex-1 space-y-4 px-4">
				<div className="grid grid-cols-2 gap-3 rounded-xl border border-gray-100 p-3">
					<div>
						<p className="text-xs text-gray-400">Job Name</p>
						<p className="mt-0.5 text-sm font-medium text-gray-900">{details.jobName ?? "—"}</p>
					</div>
					<div>
						<p className="text-xs text-gray-400">Crate Number</p>
						<p className="mt-0.5 text-sm font-medium text-gray-900">Crate - {details.assetId}</p>
					</div>
				</div>

				<div className="rounded-xl border border-gray-100 p-3">
					<p className="mb-2 text-xs font-medium text-gray-500">Delivery Status Flow</p>
					<DeliveryStatusFlow
						completedSteps={completedSteps}
						currentStep={DELIVERY_STATUS_STEP.DELIVERY_CONFIRMATION}
					/>
				</div>

				<OrderProgress deliveryNum={details.delivery_num} orderProgress={details.orderProgress} />

				<div className="space-y-2 rounded-xl border border-gray-100 p-3">
					{detailRows.map(({ label, value }) => (
						<div key={label} className="flex items-center justify-between">
							<span className="text-xs text-gray-400">{label}</span>
							<span className="text-sm font-medium text-gray-900">{value}</span>
						</div>
					))}
				</div>

				<div className="rounded-xl border border-gray-100 p-3">
					<div className="flex items-center justify-between">
						<p className="text-xs font-medium text-gray-500">Item List</p>
						<p className="text-xs text-gray-400">{details.items.length} items</p>
					</div>
					<div className="mt-2 space-y-2">
						{visibleItems.map((item, index) => (
							<div key={`${item.partName}-${index}`} className="flex items-center justify-between">
								<span className="text-sm text-gray-900">{item.partName}</span>
								<span className="text-xs text-gray-400">X {item.quantity}</span>
							</div>
						))}
						{details.items.length === 0 && <p className="text-xs text-gray-400">No pull list items found.</p>}
					</div>
					{remainingItemsCount > 0 && <p className="mt-2 text-xs text-gray-400">+ {remainingItemsCount} more items</p>}
				</div>

				{photos.length > 0 && (
					<div>
						<p className="mb-2 text-xs font-medium text-gray-500">Crate images</p>
						<PhotoGrid photos={photos} />
					</div>
				)}

				<div>
					<p className="mb-1 text-xs font-medium text-gray-500">Note (optional)</p>
					<p className="rounded-xl bg-gray-50 px-3 py-2 text-sm text-gray-700">{note || "—"}</p>
				</div>
			</div>

			<div className="px-4 pt-4">
				<Button
					type="button"
					variant="filled"
					onClick={onConfirm}
					loading={isSubmitting}
					loadingText="Submitting..."
					className="h-auto w-full rounded-2xl py-4 text-sm"
				>
					Confirm Received
				</Button>
			</div>
		</div>
	);
}
