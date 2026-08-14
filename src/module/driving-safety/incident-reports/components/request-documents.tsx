"use client";

import Image from "next/image";
import { FileText } from "lucide-react";

import { toLocalFormattedDate } from "@/lib/utils/date";
import { DATE_FORMAT } from "@/types/date";

import { IAccidentReviewDetail } from "../types";
import { fileNameFromKeyFile } from "../utils/accident-review-display";
import { ReviewCard } from "./review-card";

const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "heic", "webp", "gif"];

const isImageFile = (fileName: string): boolean => {
	const extension = fileName.split(".").pop()?.toLowerCase();
	return !!extension && IMAGE_EXTENSIONS.includes(extension);
};

const RequestDocuments = ({ report }: { report: IAccidentReviewDetail }) => {
	const attachedOn = toLocalFormattedDate(report.submittedAt ?? report.createdAt, DATE_FORMAT.MM_SLASH_DD);

	return (
		<ReviewCard>
			<div className="mb-3 border-b border-brand-dark10 pb-2">
				<h3 className="text-xs font-semibold uppercase tracking-wide text-brand-dark50">Documents</h3>
			</div>

			{report.photos.length === 0 ? (
				<p className="py-4 text-sm text-brand-dark50">No documents attached.</p>
			) : (
				<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
					{report.photos.map((document) => {
						const fileName = fileNameFromKeyFile(document.keyFile);
						return (
							<a
								key={document.id}
								href={document.url}
								target="_blank"
								rel="noopener noreferrer"
								className="flex items-center gap-3 rounded-[10px] border border-brand-dark10 px-3 py-2.5 hover:border-brand-dark30"
							>
								<span className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-[6px] bg-brand-bgLightgrey">
									{isImageFile(fileName) ? (
										<Image src={document.url} alt={fileName} fill sizes="32px" className="object-cover" />
									) : (
										<FileText size={16} className="text-brand-dark50" />
									)}
								</span>
								<span className="min-w-0 flex-1 truncate text-sm text-blue-600 underline-offset-2 hover:underline">
									{fileName}
								</span>
								<span className="shrink-0 text-xs text-brand-dark50">{attachedOn}</span>
							</a>
						);
					})}
				</div>
			)}
		</ReviewCard>
	);
};

export default RequestDocuments;
