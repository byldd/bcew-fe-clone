"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Pencil, Trash2 } from "lucide-react";
import { FiPlusSquare } from "react-icons/fi";
import { IoChevronBack } from "react-icons/io5";
import React, { useState } from "react";
import { getMaterialSelectionReasonLabel } from "../utils";
import { PreviewItem, PreviewRequestViewProps } from "../utils/types";
import MaterialSelectionSearch from "./material-selection-search";

const PreviewRequestView: React.FC<PreviewRequestViewProps> = ({
	previewItems,
	handlePreviewBack,
	onCancel,
	handleAddAnotherItem,
	handleSubmit,
	handleSubmitRequest,
	handleSubmitInvalid,
	isSubmitting,
	onDeleteItem,
	topActions = false,
}) => {
	const [searchQuery, setSearchQuery] = useState("");

	const searchInput = <MaterialSelectionSearch value={searchQuery} onChange={setSearchQuery} />;

	const cancelButton = (
		<Button
			type="button"
			variant="outline"
			className={topActions ? "shrink-0 rounded-[12px]" : "w-full rounded-[12px]"}
			onClick={onCancel ?? handlePreviewBack}
		>
			Cancel
		</Button>
	);

	const submitButton = (
		<Button
			type="button"
			variant="filled"
			className={topActions ? "shrink-0 rounded-[12px]" : "w-full rounded-[12px]"}
			onClick={handleSubmit(handleSubmitRequest, handleSubmitInvalid)}
			loading={isSubmitting}
			disabled={isSubmitting}
		>
			Submit Request
		</Button>
	);

	const renderPreviewValue = (label: string, value?: string | number | null) => {
		if (value === undefined || value === null || value === "") return null;
		return (
			<p className="text-[11px] text-brand-dark60">
				<span className="font-medium text-brand-dark">{label}: </span>
				{value}
			</p>
		);
	};

	const renderPhotoPreviews = (images?: Array<{ keyFile: string; url: string }>) => {
		if (!images || images.length === 0) return null;
		return (
			<div className="mt-1">
				{renderPreviewValue("Photos", images.length)}
				<div className="mt-2 flex flex-wrap gap-2">
					{images.map((image) => (
						<Image
							key={image.keyFile}
							src={image.url}
							alt="Material selection"
							width={48}
							height={48}
							className="h-12 w-12 rounded-[8px] border border-brand-dark10 object-cover"
						/>
					))}
				</div>
			</div>
		);
	};

	return (
		<div className="space-y-4 p-4">
			<div className={topActions ? "flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between" : "space-y-1"}>
				<div className="space-y-1">
					<div className="ml-[-10] flex items-center gap-2">
						<Button onClick={handlePreviewBack} variant="ghost" size="icon" className="size-8" aria-label="Go back">
							<IoChevronBack className="!size-6" />
						</Button>
						<h1 className="text-xl font-bold text-brand-dark">Preview Request</h1>
					</div>
					<p className="ml-8 text-sm text-brand-dark50">Review items before submitting your request.</p>
				</div>
				{topActions && (
					<div className="flex items-center gap-2">
						<div className="w-full sm:w-[320px]">{searchInput}</div>
						{cancelButton}
						{submitButton}
					</div>
				)}
			</div>

			{!topActions && searchInput}

			<div className="space-y-2">
				<p className="text-sm font-medium text-brand-dark50">Selected Items</p>
				{previewItems
					.filter((item) => {
						const q = searchQuery.trim().toLowerCase();
						if (!q) return true;
						return [item.name, item.code].some((field) => field?.toLowerCase().includes(q));
					})
					.map((item: PreviewItem, index: number) => (
						<div
							key={`${item.partId}-${index}`}
							className="space-y-2 rounded-[12px] border border-brand-dark10 bg-white p-3 shadow-sm"
						>
							<div className="flex items-start justify-between gap-2">
								<p className="text-sm font-semibold text-brand-dark">
									({item.code}) {item.name}
								</p>
								<div className="flex shrink-0 items-center gap-1">
									<button
										type="button"
										onClick={() => item.partId && onDeleteItem(item.partId)}
										className="rounded-full p-1 text-red-500 hover:bg-red-50"
										aria-label="Remove item"
									>
										<Trash2 className="h-4 w-4" />
									</button>
									<button
										type="button"
										onClick={handlePreviewBack}
										className="rounded-full p-1 text-brand-dark50 hover:bg-brand-dark10"
										aria-label="Edit item"
									>
										<Pencil className="h-4 w-4" />
									</button>
								</div>
							</div>
							<div className="flex flex-wrap gap-x-4 gap-y-1">
								{renderPreviewValue("Quantity", item.quantity)}
								{renderPreviewValue("Reason", getMaterialSelectionReasonLabel(item.reason))}
								{renderPreviewValue("Received", (item as { receivedInput?: string }).receivedInput)}
								{renderPreviewValue("Reference ID", (item as { referenceId?: string }).referenceId)}
								{renderPreviewValue("Work Order Number", (item as { workOrderNumber?: string }).workOrderNumber)}
							</div>
							{renderPhotoPreviews((item as { images?: Array<{ keyFile: string; url: string }> }).images)}
							{(item as { note?: string }).note && (
								<p className="text-xs text-brand-dark60">
									<span className="font-medium text-brand-dark">Note: </span>
									{(item as { note?: string }).note}
								</p>
							)}
						</div>
					))}
			</div>

			<Button
				type="button"
				onClick={handleAddAnotherItem}
				className="mt-3 flex w-full items-center gap-2 border border-dashed border-brand-dark10 text-sm font-semibold text-brand-dark50"
			>
				<FiPlusSquare className="h-5 w-5 text-brand-dark50" />
				Add Another Item
			</Button>

			{!topActions && (
				<div className="fixed bottom-0 left-0 right-0 flex gap-3 bg-brand-bgLightgrey px-4 pb-6 pt-3 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
					{cancelButton}
					{submitButton}
				</div>
			)}
		</div>
	);
};

export default PreviewRequestView;
