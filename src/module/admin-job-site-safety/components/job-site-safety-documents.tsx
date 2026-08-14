"use client";

import { FileText } from "lucide-react";
import { cn } from "@/lib/utils/utils";
import { fileNameFromKeyFile, PreviewFile, useFilePreview } from "@/hooks/useFilePreview";
import { ReviewCard } from "@/module/driving-safety/incident-reports/components/review-card";

const JobSiteSafetyDocuments = ({ photos, className }: { photos: PreviewFile[]; className?: string }) => {
	const { Modal, openPreview } = useFilePreview();

	if (!photos.length) return null;

	return (
		<ReviewCard title="Documents" className={className}>
			<div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
				{photos.map((photo) => (
					<button
						key={photo.keyFile}
						type="button"
						onClick={() => openPreview(photo)}
						className={cn(
							"flex items-center gap-2 rounded-[10px] border border-brand-dark10 bg-brand-bgLightgrey px-3 py-2.5",
							"text-left text-sm text-brand-dark hover:bg-brand-dark10"
						)}
					>
						<FileText size={16} className="shrink-0 text-brand-dark50" />
						<span className="truncate">{fileNameFromKeyFile(photo.keyFile)}</span>
					</button>
				))}
			</div>
			<Modal />
		</ReviewCard>
	);
};

export default JobSiteSafetyDocuments;
