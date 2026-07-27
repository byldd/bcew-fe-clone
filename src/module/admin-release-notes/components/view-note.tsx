"use client";

import React, { useRef } from "react";
import { FileText } from "lucide-react";
import { IReleaseNote } from "../types/release-note";
import { getFileName, isImage } from "../utils/release-note";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
import Image from "next/image";
import ImageModal from "@/components/shared/image-upload/image-modal";
import { useModal } from "@/hooks/useModal";
import ReleaseNoteContent from "./release-note-content";

interface ViewNoteProps {
	releaseNote: IReleaseNote;
	searchQuery?: string;
	activeOccurrenceIndex?: number;
	searchNavigationVersion?: number;
	totalMatches?: number;
}

const ViewNote = ({
	releaseNote,
	searchQuery = "",
	activeOccurrenceIndex = -1,
	searchNavigationVersion = 0,
	totalMatches,
}: ViewNoteProps) => {
	const attachments = releaseNote.attachments ?? [];
	const tAdmin = useTypedTranslations(NAMESPACE.RELEASE_NOTE);
	const { openModal, closeModal, Modal } = useModal();
	const activeRef = useRef<HTMLSpanElement | null>(null);
	const contentContainerRef = useRef<HTMLDivElement | null>(null);

	const openImagePreview = (url: string) => {
		openModal({
			modalTitle: "Preview Image",
			modalView: <ImageModal imageUrl={url} onClose={closeModal} />,
			variant: "big",
		});
	};

	return (
		<>
			{searchQuery.trim().length > 0 && (
				<div className="mb-2 flex flex-col gap-1">
					<h1 className="text-sm font-medium text-gray-800">{`Showing result for '${searchQuery}'`}</h1>

					<span className="font-inter text-xs text-gray-400">
						{`${totalMatches} ${totalMatches === 1 ? "match" : "matches"} found`}
					</span>
				</div>
			)}

			<div ref={contentContainerRef} className="overflow-y-auto" style={{ maxHeight: "calc(100vh - 320px)" }}>
				{/* Content */}
				<ReleaseNoteContent
					content={releaseNote.content}
					searchQuery={searchQuery}
					activeOccurrenceIndex={activeOccurrenceIndex}
					searchNavigationVersion={searchNavigationVersion}
					activeRef={activeRef}
					className="release-note-content whitespace-pre-line text-left text-brand-dark"
					scrollContainerRef={contentContainerRef}
				/>

				{/* Attachments */}
				<div className="mt-6">
					{attachments.length > 0 && (
						<div className="mb-4 flex items-center gap-3">
							<div className="flex-1 border-t border-gray-200"></div>
							<p className="whitespace-nowrap text-xs text-gray-400">
								{tAdmin.attachments} ({attachments.length})
							</p>
							<div className="flex-1 border-t border-gray-200"></div>
						</div>
					)}

					<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
						{attachments.map((file) => {
							const isImg = isImage(file.keyFile);
							const Wrapper = isImg ? "div" : "a";

							return (
								<Wrapper
									key={file.keyFile}
									{...(!isImg && {
										href: file.url,
										target: "_blank",
										rel: "noreferrer",
									})}
									onClick={isImg ? () => openImagePreview(file.url) : undefined}
									className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 transition hover:shadow-sm"
								>
									<div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded border bg-white">
										{isImg ? (
											<Image
												src={file.url}
												alt={getFileName(file.keyFile)}
												width={32}
												height={32}
												className="object-cover"
											/>
										) : (
											<FileText className="h-4 w-4 text-gray-500" />
										)}
									</div>

									<div className="min-w-0">
										<p className="truncate text-xs font-medium text-gray-700">{getFileName(file.keyFile)}</p>
									</div>
								</Wrapper>
							);
						})}
					</div>
				</div>
			</div>

			<Modal />
		</>
	);
};

export default ViewNote;
