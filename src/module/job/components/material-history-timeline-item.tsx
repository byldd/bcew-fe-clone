"use client";

import Image from "next/image";
import { useState } from "react";
import { ChevronDown, UserCog } from "lucide-react";
import { cn } from "@/lib/utils/utils";
import { IMaterialHistoryEntry } from "../types";
import { MATERIAL_STATUS_TONE } from "../utils/enums";

interface MaterialHistoryTimelineItemProps {
	entry: IMaterialHistoryEntry;
	isLast: boolean;
}

export default function MaterialHistoryTimelineItem({ entry, isLast }: MaterialHistoryTimelineItemProps) {
	const [showPhotos, setShowPhotos] = useState(false);
	const photoCount = entry.photos.length;

	return (
		<div className="flex gap-3">
			<div className="flex flex-col items-center">
				<span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
					<UserCog className="h-4 w-4" />
				</span>
				{!isLast && <span className="mt-1 w-px flex-1 bg-brand-dark10" />}
			</div>

			<div className={cn("min-w-0 flex-1", isLast ? "pb-0" : "pb-5")}>
				<div className="flex flex-wrap items-center gap-2">
					<p className="text-sm font-semibold text-brand-dark">{entry.title}</p>
					<span
						className={cn(
							"rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
							entry.tone === MATERIAL_STATUS_TONE.DONE
								? "bg-emerald-100 text-emerald-700"
								: "bg-brand-dark10 text-brand-dark50"
						)}
					>
						{entry.status}
					</span>
				</div>

				<p className="mt-1 text-xs text-brand-dark50">
					{entry.dateText}
					{entry.detailLabel && entry.detailValue ? (
						<>
							{" | "}
							{entry.detailLabel} : <span className="text-brand-dark">{entry.detailValue}</span>
						</>
					) : null}
				</p>

				{photoCount > 0 && (
					<div className="mt-2">
						<button
							type="button"
							onClick={() => setShowPhotos((prev) => !prev)}
							className="flex items-center gap-1 text-xs font-medium text-brand-dark"
						>
							{photoCount} {photoCount === 1 ? "Photo" : "Photos"}
							<ChevronDown className={cn("h-3.5 w-3.5 transition-transform", showPhotos && "rotate-180")} />
						</button>

						{showPhotos && (
							<div className="mt-2 flex flex-wrap gap-2">
								{entry.photos.map((url, index) => (
									<a
										key={`${url}-${index}`}
										href={url}
										target="_blank"
										rel="noopener noreferrer"
										className="relative h-20 w-20 overflow-hidden rounded-[10px] border border-brand-dark10"
									>
										<Image
											src={url}
											alt={entry.photosLabel}
											width={80}
											height={80}
											className="h-full w-full object-cover"
										/>
									</a>
								))}
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
}
