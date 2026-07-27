"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils/utils";
import { JobLevelCommsImage } from "../utils/types";
import { COLLAPSED_IMAGE_COUNT, FALLBACK } from "../constants";

export const InfoField = ({
	label,
	value,
	className,
	valueClassName,
}: {
	label: string;
	value: string;
	className?: string;
	valueClassName?: string;
}) => {
	return (
		<div className={cn("flex flex-col items-start space-y-2", className)}>
			<p className="text-xs font-normal tracking-wide text-brand-dark50">{label}</p>
			<p className={cn("text-sm font-medium text-brand-dark", valueClassName)}>{value || FALLBACK}</p>
		</div>
	);
};

export const ImageGrid = ({
	images,
	onOpen,
	emptyLabel = "No Images",
}: {
	images: JobLevelCommsImage[];
	onOpen: (url: string) => void;
	emptyLabel?: string;
}) => {
	const [isExpanded, setIsExpanded] = useState(false);

	if (!images.length) {
		return <p className="text-xs text-brand-dark50">{emptyLabel}</p>;
	}

	const hasOverflow = images.length > COLLAPSED_IMAGE_COUNT;
	const visible = isExpanded ? images : images.slice(0, COLLAPSED_IMAGE_COUNT);
	const overflow = images.length - COLLAPSED_IMAGE_COUNT;

	return (
		<div className="space-y-2">
			<div className="flex flex-wrap gap-2">
				{visible.map((img, index) => {
					const showOverflowBadge = !isExpanded && hasOverflow && index === COLLAPSED_IMAGE_COUNT - 1;
					return (
						<button
							type="button"
							key={img.id}
							onClick={() => (showOverflowBadge ? setIsExpanded(true) : onOpen(img.url))}
							className="relative h-24 w-24 overflow-hidden rounded-[12px] border"
						>
							<Image src={img.url} alt="" fill className="object-cover" />
							{showOverflowBadge && (
								<div className="absolute inset-0 flex items-center justify-center bg-black/50 text-xs font-semibold text-white">
									+{overflow}
								</div>
							)}
						</button>
					);
				})}
			</div>
			{isExpanded && hasOverflow && (
				<button
					type="button"
					onClick={() => setIsExpanded(false)}
					className="text-xs font-medium text-brand-dark50 hover:text-brand-dark"
				>
					Show less
				</button>
			)}
		</div>
	);
};
